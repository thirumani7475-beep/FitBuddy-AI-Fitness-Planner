import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  initDatabase, 
  getAllAdminUsersWithPlans, 
  upsertUser, 
  saveWorkoutPlan, 
  addFeedbackLog, 
  getDatabaseStats 
} from './server/db.js';
import { fastApiCode, sqlAlchemyCode, jinjaTemplates } from './server/fastapi_arch.js';

dotenv.config();

// Initialize SQLite database tables and seed data
initDatabase();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client with required aistudio-build telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// JSON Schema for Workout Plan
const fitnessPlanSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Descriptive title for the program' },
    overview: { type: Type.STRING, description: 'Executive summary of program design' },
    targetGoal: { type: Type.STRING, description: 'Primary targeted fitness objective' },
    experienceLevel: { type: Type.STRING, description: 'beginner, intermediate, or advanced' },
    weeklyAdvice: { type: Type.STRING, description: 'Key lifestyle and recovery guidelines' },
    safetyNotice: { type: Type.STRING, description: 'Injury prevention and biomechanical reminders' },
    days: {
      type: Type.ARRAY,
      description: '7-day breakdown (including training and rest/recovery days)',
      items: {
        type: Type.OBJECT,
        properties: {
          dayIndex: { type: Type.INTEGER, description: 'Day number 1 to 7' },
          dayName: { type: Type.STRING, description: 'e.g. Day 1: Push & Core or திங்கள்: மார்பு பயிற்சி' },
          focus: { type: Type.STRING, description: 'Primary muscle or cardiovascular focus' },
          isRestDay: { type: Type.BOOLEAN, description: 'Whether this day is a designated rest/active recovery day' },
          estimatedMinutes: { type: Type.INTEGER, description: 'Duration in minutes' },
          warmup: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 dynamic mobility warm-up drills',
          },
          cooldown: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 static stretch or decompression exercises',
          },
          coachTip: { type: Type.STRING, description: 'Actionable coach cue for today' },
          exercises: {
            type: Type.ARRAY,
            description: 'List of resistance or conditioning movements for this session',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Unique slug e.g. ex-pushup' },
                name: { type: Type.STRING, description: 'Exercise name in English' },
                nameTamil: { type: Type.STRING, description: 'Exercise name / Tamil title' },
                targetMuscleGroup: { type: Type.STRING, description: 'Main muscles recruited' },
                sets: { type: Type.INTEGER, description: 'Recommended set count (usually 2 to 4)' },
                repsOrDuration: { type: Type.STRING, description: 'e.g. 10-12 reps or 40 seconds' },
                restSeconds: { type: Type.INTEGER, description: 'Rest interval in seconds between sets (30-90)' },
                difficulty: { type: Type.STRING, description: 'beginner, intermediate, or advanced' },
                instructions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Step-by-step technique instructions',
                },
                safetyCues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Safety cues and form check points',
                },
                modification: { type: Type.STRING, description: 'Easier regression or joint-friendly variation' },
                equipmentNeeded: { type: Type.STRING, description: 'Equipment required (Bodyweight, Dumbbells, etc.)' },
              },
              required: [
                'id',
                'name',
                'targetMuscleGroup',
                'sets',
                'repsOrDuration',
                'restSeconds',
                'difficulty',
                'instructions',
                'safetyCues',
                'modification',
                'equipmentNeeded',
              ],
            },
          },
        },
        required: [
          'dayIndex',
          'dayName',
          'focus',
          'isRestDay',
          'estimatedMinutes',
          'warmup',
          'exercises',
          'cooldown',
          'coachTip',
        ],
      },
    },
  },
  required: ['title', 'overview', 'targetGoal', 'experienceLevel', 'days', 'weeklyAdvice', 'safetyNotice'],
};

// API: Generate structured fitness plan from profile
app.post('/api/plan/generate', async (req, res) => {
  try {
    const profile = req.body;
    const isTamil = profile.language === 'ta';
    const intensity = profile.workoutIntensity || 'medium';

    const systemPrompt = `You are FitBuddy, an elite certified exercise physiologist and master fitness coach.
You design safe, scientifically grounded, progressive workout programs customized to the user's specific biomechanical profile, equipment, time constraints, and injuries.
CRITICAL SAFETY & VALIDATION RULES:
1. Dynamic warm-up (3-5 min) and cool-down stretches (3-5 min) are mandatory for every training day.
2. Workout Intensity: Calibrate the sets, reps, and cardiovascular work to the requested intensity: "${intensity.toUpperCase()}".
   - LOW: joint-friendly, controlled tempo, RPE 4-6, longer rest intervals (60-90s).
   - MEDIUM: standard progressive overload, balanced hypertrophy & conditioning, RPE 6-8, rest intervals (45-60s).
   - HIGH: high metabolic output, explosive supersets or short rests (30-45s), RPE 8-10.
3. If the user specifies any joint pain or injury (e.g. knee pain, lower back pain, shoulder pain), strictly exclude high-impact contraindications and provide protected, spine/joint-sparing alternatives (e.g. box squats over heavy squats, glute bridges, reverse lunges over forward lunges).
4. Strictly adhere to available equipment: if user only has Bodyweight or Dumbbells, do not prescribe barbell machines or gym cable equipment.
5. Total session length must respect the requested duration (${profile.sessionDurationMinutes || 30} minutes).
${
  isTamil
    ? '6. LANGUAGE: The user requested Tamil (தமிழ்). Provide exercise descriptions, instructions, safety cues, coach tips, warmups, and overviews in clear Tamil (தமிழ்). You can keep standard English exercise names in "name" and Tamil phonetic/translated name in "nameTamil".'
    : '6. LANGUAGE: Provide clear, encouraging English with precise form cues.'
}`;

    const userPrompt = `Generate a personalized 7-day fitness routine for this client:
- Athlete Name: ${profile.name || 'Athlete'}
- Goal: ${profile.fitnessGoal}
- Workout Intensity: ${intensity} (Low, Medium, or High)
- Experience Level: ${profile.experienceLevel}
- Activity Level: ${profile.activityLevel}
- Training Frequency: ${profile.workoutDaysPerWeek || 4} workout days per week (and ${7 - (profile.workoutDaysPerWeek || 4)} rest/active recovery days)
- Session Duration: ${profile.sessionDurationMinutes || 35} minutes per workout
- Location: ${profile.location}
- Available Equipment: ${(profile.availableEquipment || []).join(', ') || 'Bodyweight'}
- Physical Limitations/Injuries: ${(profile.injuriesAndLimitations || []).join(', ') || 'None reported'}
- Additional Preferences/Notes: ${profile.additionalNotes || 'Standard balanced programming'}
- Language: ${profile.language === 'ta' ? 'Tamil (தமிழ்)' : 'English'}

Return a fully populated JSON adhering to the required schema. Ensure exactly 7 days (day 1 through 7).`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: fitnessPlanSchema,
          temperature: 0.7,
        },
      });
    } catch (modelError) {
      console.warn('Gemini 1.5 Pro unavailable or rate limited, falling back to gemini-3.8-flash:', modelError);
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: fitnessPlanSchema,
          temperature: 0.7,
        },
      });
    }

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.id = 'plan-' + Date.now();
    parsed.createdAt = new Date().toISOString().split('T')[0];
    parsed.language = profile.language || 'en';
    parsed.workoutIntensity = intensity;

    // Persist user and plan in SQLite database
    try {
      const userId = upsertUser({
        name: profile.name || 'Registered Athlete',
        email: profile.email || `athlete-${Date.now()}@fitbuddy.local`,
        age: profile.age || 26,
        weightKg: profile.weightKg || 70,
        fitnessGoal: profile.fitnessGoal || 'general-wellness',
        workoutIntensity: intensity,
        experienceLevel: profile.experienceLevel || 'beginner',
      });
      saveWorkoutPlan(userId, parsed, 'original');
    } catch (dbErr) {
      console.warn('SQLite storage notice:', dbErr);
    }

    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Error generating plan:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate fitness plan with Gemini AI.',
    });
  }
});

// API: Generate structured fitness plan from Natural Language Input
app.post('/api/plan/natural-language', async (req, res) => {
  try {
    const { promptText, language = 'en', userProfile = {} } = req.body;
    const isTamil = language === 'ta';

    if (!promptText || typeof promptText !== 'string') {
      return res.status(400).json({ success: false, error: 'Natural language prompt is required.' });
    }

    const systemPrompt = `You are FitBuddy, an intelligent exercise architect powered by Gemini.
The user communicates their fitness desires in everyday natural language (e.g., "I have 30 minutes today, bad lower back, dumbbells at home, and want a beginner-friendly core and upper body workout").
Parse their natural language request, extract constraints (equipment, time, injuries, focus, level), and generate a 7-day personalized workout plan (or tailored multi-day split) that matches their natural description.
Follow strict injury prevention protocols.
${
  isTamil
    ? 'Provide Tamil (தமிழ்) instructions, tips, and safety explanations, with English exercise names in "name" and Tamil in "nameTamil".'
    : 'Provide clear English instructions with biomechanical form cues.'
}`;

    const prompt = `Client Natural Language Request:
"${promptText}"

Client Context:
- Language: ${language}
- Known background: ${JSON.stringify(userProfile)}

Generate a complete structured 7-day plan in JSON complying with the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: fitnessPlanSchema,
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.id = 'plan-nl-' + Date.now();
    parsed.createdAt = new Date().toISOString().split('T')[0];
    parsed.language = language;

    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Error in natural language plan generation:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to parse natural language request.',
    });
  }
});

// API: Adapt Plan with AI (Skip days, too hard, joint pain, time crunch)
app.post('/api/plan/adapt', async (req, res) => {
  try {
    const { currentPlan, reason, customNotes, language = 'en' } = req.body;
    const isTamil = language === 'ta';

    const systemPrompt = `You are FitBuddy AI. You specialize in adaptive programming.
When a user encounters fatigue, joint discomfort, missed workout days, or time limits, you adapt their existing workout routine without completely discarding what they have achieved.
You adjust set volumes, regress complex movements to joint-friendly variations, shorten rest or session times, or redistribute missed muscle groups safely.
Return the updated complete 7-day plan in JSON format.
Add an explicit clear "adaptationReason" explaining in 2 sentences why these changes make their program safer, more realistic, and sustainable.`;

    const prompt = `Adapt the following plan based on user feedback:
Feedback/Reason: ${reason}
User's Custom Notes: ${customNotes || 'None'}
Language: ${language}

Original Plan:
${JSON.stringify(currentPlan)}

Please output the revised plan with modified exercises, sets, or time, retaining the same JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: fitnessPlanSchema,
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.id = 'plan-adapted-' + Date.now();
    parsed.isAdapted = true;
    parsed.adaptationReason = isTamil
      ? `AI தழுவல்: ${reason} - உங்கள் உடல் நிலைக்கு ஏற்ப பயிற்சிகளின் தீவிரம் மற்றும் கால அளவு பாதுகாப்பாக மாற்றியமைக்கப்பட்டுள்ளது.`
      : `AI Adaptation applied: Adjusted for "${reason}". Volume, exercise selection, and recovery intervals optimized for safety and consistency.`;
    parsed.createdAt = new Date().toISOString().split('T')[0];
    parsed.language = language;

    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Error adapting plan:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to adapt plan with Gemini AI.',
    });
  }
});

// API: Conversational Fitness Coach Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext = {}, language = 'en' } = req.body;
    const isTamil = language === 'ta';

    const systemInstruction = `You are FitBuddy, a knowledgeable, encouraging, and science-backed personal fitness coach and exercise physiologist.
Your role:
- Answer fitness, exercise technique, nutrition, recovery, and consistency questions.
- If asked "What workout can I do today?", reference their active plan and current day.
- If asked about form or knee/back pain, emphasize biomechanical safety cues, joint alignment, and gentle regressions.
- If asked about consistency, provide compassionate behavioral coaching (habit stacking, 2-minute rule, non-scale victories).
- Maintain an energetic, motivational, respectful tone.
- CRITICAL DISCLAIMER: Inform users you provide educational fitness guidance, not clinical medical diagnosis.
${
  isTamil
    ? 'Respond naturally in friendly, fluent Tamil (தமிழ்). Keep fitness terminology accessible and clear.'
    : 'Respond in clean, concise markdown formatting.'
}

Current Client Context:
- Active Goal: ${userContext.goal || 'General Fitness'}
- Experience Level: ${userContext.level || 'Beginner'}
- Active Streak: ${userContext.streak || 0} days
- Reported Limitations: ${userContext.limitations || 'None'}
- Language Preference: ${isTamil ? 'Tamil' : 'English'}`;

    // Format chat history
    const conversation = (messages || []).map((m: any) => `${m.role === 'user' ? 'Client' : 'FitBuddy Coach'}: ${m.text}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Conversation history:\n${conversation}\n\nClient's latest message:\n${messages[messages.length - 1]?.text || 'Hello coach'}`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'I am here with you! Let me know which exercise or goal you want to work on.';

    // Generate 3 contextual suggested quick replies
    const suggestedActions = isTamil
      ? [
          'இன்றைய உடற்பயிற்சி என்ன?',
          'புஷ்-அப் சரியான முறை என்ன?',
          'முழங்கால் வலிக்காமல் உடற்பயிற்சி செய்வது எப்படி?',
        ]
      : [
          'What workout should I do today?',
          'How to improve my squat depth safely?',
          'Quick 5-minute cooldown routine',
        ];

    res.json({
      success: true,
      reply: replyText,
      suggestedActions,
    });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Chat assistant error.',
    });
  }
});

// API: Daily Activity Recommendation
app.post('/api/daily-recommendation', async (req, res) => {
  try {
    const { energyLevel = 'medium', availableMinutes = 30, goal = 'general-fitness', language = 'en' } = req.body;
    const isTamil = language === 'ta';

    const prompt = `Give a personalized daily fitness recommendation for a user who has ${availableMinutes} minutes available and reports a "${energyLevel}" energy level today. Their overarching goal is "${goal}".
Provide:
1. Recommended Focus (e.g., Active Recovery Walk & Mobility vs High Energy Density Circuit)
2. 3 Specific Action Steps
3. A Personalized Motivational Spark
Format: Respond in ${isTamil ? 'Tamil (தமிழ்)' : 'English'} in clear JSON with keys: focusTitle, summary, actionSteps (array of 3 strings), motivationalQuote.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, recommendation: parsed });
  } catch (error: any) {
    console.error('Daily recommendation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to get daily recommendation.',
    });
  }
});

// API: Weekly Progress Summary & Motivation
app.post('/api/weekly-summary', async (req, res) => {
  try {
    const { logs = [], streak = 0, goal = 'general-fitness', language = 'en' } = req.body;
    const isTamil = language === 'ta';

    const prompt = `Act as an expert fitness mentor. Analyze the client's past week:
- Completed Workouts: ${logs.length}
- Current Streak: ${streak} days
- Primary Goal: ${goal}
- Recent Log Details: ${JSON.stringify(logs.slice(-7))}

Provide:
1. Performance Grade (e.g. A, A-, B+)
2. Key Wins & Consistency Praise
3. Physiological Recovery Analysis
4. Strategic Focus for Next Week
5. Motivational Motto
Language: ${isTamil ? 'Tamil (தமிழ்)' : 'English'}.
Return JSON with keys: grade, praise, recoveryNote, nextWeekFocus, motto.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, summary: parsed });
  } catch (error: any) {
    console.error('Weekly summary error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate weekly summary.',
    });
  }
});

// API: Personalized Nutrition & Recovery Tips Generator
app.post('/api/nutrition/generate', async (req, res) => {
  try {
    const { age = 28, weightKg = 70, fitnessGoal = 'general-fitness', intensity = 'moderate', language = 'en' } = req.body;
    const isTamil = language === 'ta';

    const prompt = `You are a sports nutritionist and recovery physiologist.
Create a personalized nutrition & recovery blueprint for this client:
- Age: ${age} years old
- Weight: ${weightKg} kg
- Fitness Goal: ${fitnessGoal}
- Workout Intensity: ${intensity}
- Language: ${isTamil ? 'Tamil (தமிழ்)' : 'English'}

Provide:
1. dailyCalories (realistic integer)
2. proteinGrams (integer target based on goal and weight)
3. carbsGrams (integer target)
4. fatsGrams (integer target)
5. waterLiters (float, e.g. 2.8)
6. overview (short 2-sentence summary)
7. meals: array of 4 meals (Breakfast, Lunch, Pre/Post Workout snack, Dinner) with fields: name, timing, description, calories, protein
8. preWorkoutFuel (what to eat 45-60m before training)
9. postWorkoutRecovery (optimal refuel window meal)
10. sleepAndRecoveryProtocol: array of 3 actionable sleep, hydration, and central nervous system recovery tips.

Respond in clear JSON adhering to these exact keys. If language is Tamil, provide all descriptions in friendly Tamil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    res.json({ success: true, nutrition: parsed });
  } catch (error: any) {
    console.error('Nutrition generation error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate nutrition plan.',
    });
  }
});

// API: Admin / User Feedback Plan Update (e.g. Add Cardio, Add Yoga, Change intensity)
app.post('/api/admin/feedback-update', async (req, res) => {
  try {
    const { originalPlan, feedback, language = 'en', userId = 'user-priya-1' } = req.body;
    const isTamil = language === 'ta';

    const prompt = `You are FitBuddy Coach. A user or trainer provided this feedback to modify the existing 7-day workout plan:
"${feedback}"

Original Plan:
${JSON.stringify(originalPlan)}

Update the plan by fulfilling the feedback (e.g., if feedback is "add cardio", insert cardio intervals/finisher; if "add yoga", insert a dedicated yoga or mobility session; if "lower intensity", adjust sets and reps).
Return the updated plan conforming to the standard fitness plan schema in JSON format.
Add an explicit "adaptationReason" string starting with "Trainer Update:" specifying clearly what was changed so the admin comparison can highlight it.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are FitBuddy coach updating workout routines based on specific feedback.',
        responseMimeType: 'application/json',
        responseSchema: fitnessPlanSchema,
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    parsed.id = 'plan-updated-' + Date.now();
    parsed.isAdapted = true;
    parsed.adaptationReason = isTamil
      ? `பயிற்சியாளர் புதுப்பிப்பு: ${feedback} - உடற்பயிற்சி அட்டவணை வெற்றிகரமாக மாற்றப்பட்டது.`
      : `Trainer Update: Applied "${feedback}". Modified schedule and exercise volume.`;

    // Persist feedback and updated plan in SQLite
    try {
      addFeedbackLog(userId, originalPlan?.id || null, feedback);
      saveWorkoutPlan(userId, parsed, 'updated', parsed.adaptationReason);
    } catch (dbErr) {
      console.warn('SQLite feedback storage notice:', dbErr);
    }

    res.json({ success: true, plan: parsed });
  } catch (error: any) {
    console.error('Admin feedback update error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to update plan from feedback.',
    });
  }
});

// API: Retrieve all registered users and their original/updated workout plans (SQLite & SQLAlchemy)
app.get('/api/admin/users', (req, res) => {
  try {
    const users = getAllAdminUsersWithPlans();
    res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error fetching admin users from SQLite:', error);
    res.status(500).json({ success: false, error: 'Failed to query SQLite database.' });
  }
});

// API: Database Explorer (Table stats, column types, sample rows)
app.get('/api/db/stats', (req, res) => {
  try {
    const stats = getDatabaseStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error fetching SQLite stats:', error);
    res.status(500).json({ success: false, error: 'Failed to inspect SQLite database.' });
  }
});

// API: Register / Upsert user in SQLite
app.post('/api/users', (req, res) => {
  try {
    const userId = upsertUser(req.body);
    res.json({ success: true, userId });
  } catch (error: any) {
    console.error('Error saving user to SQLite:', error);
    res.status(500).json({ success: false, error: 'Failed to save user in SQLite.' });
  }
});

// API: Save Workout Plan to SQLite
app.post('/api/plans/save', (req, res) => {
  try {
    const { userId, plan, planType = 'original', adaptationReason } = req.body;
    const planId = saveWorkoutPlan(userId, plan, planType, adaptationReason);
    res.json({ success: true, planId });
  } catch (error: any) {
    console.error('Error saving plan to SQLite:', error);
    res.status(500).json({ success: false, error: 'Failed to save plan in SQLite.' });
  }
});

// API: FastAPI & Jinja2 Architecture Showcase & Code templates
app.get('/api/architecture/fastapi-jinja', (req, res) => {
  res.json({
    success: true,
    backendFramework: 'FastAPI (Python 3.11)',
    orm: 'SQLAlchemy (Declarative Base)',
    database: 'SQLite 3 (fitbuddy.db)',
    templateEngine: 'Jinja2 Templates',
    fastApiCode,
    sqlAlchemyCode,
    jinjaTemplates,
  });
});


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Full-Stack Server Integration with Vite
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development: mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
