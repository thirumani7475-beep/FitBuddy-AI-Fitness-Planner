import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../fitbuddy.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      age INTEGER,
      weight_kg REAL,
      fitness_goal TEXT NOT NULL,
      workout_intensity TEXT NOT NULL DEFAULT 'medium',
      experience_level TEXT NOT NULL DEFAULT 'beginner',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_goal TEXT NOT NULL,
      workout_intensity TEXT NOT NULL DEFAULT 'medium',
      plan_type TEXT NOT NULL DEFAULT 'original',
      adaptation_reason TEXT,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT,
      feedback_text TEXT NOT NULL,
      applied_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS nutrition_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      daily_calories INTEGER,
      protein_grams INTEGER,
      carbs_grams INTEGER,
      fats_grams INTEGER,
      water_liters REAL,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed sample users if empty
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  if (userCount === 0) {
    seedDatabase();
  }
}

// Seed Database with initial registered users, plans, and feedback
function seedDatabase() {
  const now = new Date().toISOString();

  // Priya Sharma
  db.prepare(`
    INSERT INTO users (id, name, email, age, weight_kg, fitness_goal, workout_intensity, experience_level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('user-priya-1', 'Priya Sharma', 'priya.s@example.com', 26, 62, 'weight-loss', 'medium', 'beginner', now);

  const priyaOriginalPlan = {
    id: 'plan-priya-orig',
    title: "Priya's 7-Day Weight Loss & Tone Split",
    overview: 'Full body metabolic resistance training calibrated for calorie deficit and core definition.',
    targetGoal: 'weight-loss',
    workoutIntensity: 'medium',
    experienceLevel: 'beginner',
    language: 'en',
    createdAt: now,
    safetyNotice: 'Maintain neutral lumbar alignment and stay hydrated during cardio intervals.',
    weeklyAdvice: 'Prioritize protein at 1.8g/kg and get 7-8 hours of sleep for recovery.',
    days: [
      {
        dayIndex: 1,
        dayName: 'Day 1: Full Body Circuit & Core',
        focus: 'Compound push, pull, legs',
        isRestDay: false,
        estimatedMinutes: 35,
        warmup: ['Arm circles 30s', 'Glute bridges 12 reps', 'Bodyweight squats 10 reps'],
        cooldown: ['Hamstring stretch 45s', 'Child pose 60s'],
        coachTip: 'Keep rest intervals short (45 seconds) to maintain elevated heart rate.',
        exercises: [
          {
            id: 'ex-p1',
            name: 'Goblet Squats',
            nameTamil: 'காப்லெட் ஸ்குவாட்ஸ்',
            targetMuscleGroup: 'Quadriceps & Glutes',
            sets: 3,
            repsOrDuration: '12-15 reps',
            restSeconds: 45,
            difficulty: 'beginner',
            instructions: ['Hold dumbbell at chest level.', 'Squat down until thighs are parallel with floor.', 'Drive up through heels.'],
            safetyCues: ['Do not let knees buckle inward.'],
            modification: 'Perform box squats onto a chair.',
            equipmentNeeded: 'Dumbbell or Kettlebell'
          },
          {
            id: 'ex-p2',
            name: 'Dumbbell Bent-Over Row',
            nameTamil: 'டம்பெல் ரோயிங்',
            targetMuscleGroup: 'Upper Back & Lats',
            sets: 3,
            repsOrDuration: '12 reps',
            restSeconds: 45,
            difficulty: 'beginner',
            instructions: ['Hinge at hips with flat back.', 'Pull elbows back past ribs.', 'Squeeze shoulder blades.'],
            safetyCues: ['Keep spine rigid and gaze slightly forward.'],
            modification: 'Use resistance band anchored to door.',
            equipmentNeeded: 'Dumbbells'
          }
        ]
      },
      {
        dayIndex: 2,
        dayName: 'Day 2: Low-Impact Steady Cardio & Abs',
        focus: 'Cardiovascular endurance & Core',
        isRestDay: false,
        estimatedMinutes: 30,
        warmup: ['Torso twists 20 reps', 'Leg swings 10 each side'],
        cooldown: ['Cobra stretch 45s', 'Seated forward fold'],
        coachTip: 'Maintain conversational pace on your cardio walk or bike.',
        exercises: [
          {
            id: 'ex-p3',
            name: 'Plank with Shoulder Taps',
            nameTamil: 'பிளாங்க் ஷோல்டர் டேப்',
            targetMuscleGroup: 'Transverse Abdominis & Obliques',
            sets: 3,
            repsOrDuration: '40 seconds',
            restSeconds: 45,
            difficulty: 'beginner',
            instructions: ['Hold high plank position.', 'Tap left shoulder with right hand without swaying hips.', 'Repeat opposite side.'],
            safetyCues: ['Keep pelvis level; widen feet for extra stability.'],
            modification: 'Hold stationary plank from knees.',
            equipmentNeeded: 'Yoga Mat'
          }
        ]
      },
      {
        dayIndex: 3,
        dayName: 'Day 3: Lower Body & Glute Burnout',
        focus: 'Glutes, Hamstrings, Calves',
        isRestDay: false,
        estimatedMinutes: 35,
        warmup: ['Hip circles 10 reps', 'Monster walks 15 steps'],
        cooldown: ['Figure four stretch 45s', 'Calf stretch on wall'],
        coachTip: 'Focus on full muscular contraction at top of each rep.',
        exercises: [
          {
            id: 'ex-p4',
            name: 'Dumbbell Romanian Deadlift',
            nameTamil: 'ரோமானியன் டெட்லிஃப்ட்',
            targetMuscleGroup: 'Hamstrings & Posterior Chain',
            sets: 3,
            repsOrDuration: '10-12 reps',
            restSeconds: 60,
            difficulty: 'beginner',
            instructions: ['Push hips back with soft knees.', 'Lower weights along shins.', 'Squeeze glutes to return to standing.'],
            safetyCues: ['Never round lower back.'],
            modification: 'Bodyweight good mornings with hands behind head.',
            equipmentNeeded: 'Dumbbells'
          }
        ]
      },
      {
        dayIndex: 4,
        dayName: 'Day 4: Active Recovery Walk',
        focus: 'Walking & Joint Decompression',
        isRestDay: true,
        estimatedMinutes: 30,
        warmup: ['Gentle neck and shoulder rolls'],
        cooldown: ['Deep diaphragmatic breathing'],
        coachTip: 'Active recovery accelerates metabolic waste clearance.',
        exercises: []
      },
      {
        dayIndex: 5,
        dayName: 'Day 5: Upper Body Sculpt & Core',
        focus: 'Chest, Arms, Core',
        isRestDay: false,
        estimatedMinutes: 35,
        warmup: ['Jumping jacks or step jacks 45s', 'Arm swings 30s'],
        cooldown: ['Chest door-frame stretch', 'Triceps overhead stretch'],
        coachTip: 'Control the lowering eccentric phase for 3 seconds.',
        exercises: [
          {
            id: 'ex-p5',
            name: 'Dumbbell Floor Press',
            nameTamil: 'தரை டம்பெல் பிரஸ்',
            targetMuscleGroup: 'Pectorals & Triceps',
            sets: 3,
            repsOrDuration: '10-12 reps',
            restSeconds: 60,
            difficulty: 'beginner',
            instructions: ['Lie on floor with knees bent.', 'Press dumbbells upward until arms are straight.', 'Lower until upper arms touch floor gently.'],
            safetyCues: ['Avoid flaring elbows 90 degrees out; keep at 45 degrees.'],
            modification: 'Perform incline push-ups on bench.',
            equipmentNeeded: 'Dumbbells'
          }
        ]
      },
      {
        dayIndex: 6,
        dayName: 'Day 6: HIIT Finisher & Mobility',
        focus: 'High-intensity calorie burn & flexibility',
        isRestDay: false,
        estimatedMinutes: 25,
        warmup: ['Ankle circles', 'High knees in place 30s'],
        cooldown: ['Child pose 2 mins'],
        coachTip: 'Empty the tank during work intervals, catch breath on rest.',
        exercises: []
      },
      {
        dayIndex: 7,
        dayName: 'Day 7: Full Rest & Meal Prep',
        focus: 'Complete Rest & Recovery',
        isRestDay: true,
        estimatedMinutes: 10,
        warmup: [],
        cooldown: [],
        coachTip: 'Review weekly progress and prepare nutritious meals for the upcoming week.',
        exercises: []
      }
    ]
  };

  const priyaUpdatedPlan = {
    ...priyaOriginalPlan,
    id: 'plan-priya-updated',
    title: "Priya's 7-Day Plan (Cardio & Yoga Added)",
    isAdapted: true,
    adaptationReason: 'Trainer Update: Integrated 15-min metabolic cardio intervals on Day 1 & Day 3, plus dedicated restorative Hatha Yoga mobility.',
    days: priyaOriginalPlan.days.map((day) => {
      if (day.dayIndex === 1) {
        return {
          ...day,
          focus: day.focus + ' + HIIT Cardio Finisher',
          estimatedMinutes: 45,
          exercises: [
            ...day.exercises,
            {
              id: 'ex-p-cardio-1',
              name: 'High-Knee Sprint Intervals',
              nameTamil: 'உயர் முழங்கால் ஸ்பிரிண்ட் கார்டியோ',
              targetMuscleGroup: 'Cardiovascular & Full Body',
              sets: 4,
              repsOrDuration: '40s Work / 20s Rest',
              restSeconds: 30,
              difficulty: 'intermediate',
              instructions: ['Drive knees up explosively with rapid arm pumping.', 'Land softly on balls of feet.'],
              safetyCues: ['Keep torso tall, avoid leaning back.'],
              modification: 'Fast high-knee marching without jumping.',
              equipmentNeeded: 'None'
            }
          ]
        };
      }
      if (day.dayIndex === 4) {
        return {
          ...day,
          isRestDay: false,
          dayName: 'Day 4: Restorative Yoga & Hip Opening Flow',
          focus: 'Hatha Yoga, Spine Decompression & Parasympathetic Recovery',
          estimatedMinutes: 30,
          coachTip: 'Breathe smoothly through nose to stimulate deep neuromuscular recovery.',
          exercises: [
            {
              id: 'ex-p-yoga-1',
              name: 'Warrior II to Reverse Warrior Flow',
              nameTamil: 'யோகா: வீரபத்ராசனம் நிலை',
              targetMuscleGroup: 'Hip Flexors, Spine & Inner Thighs',
              sets: 3,
              repsOrDuration: '60 seconds per side',
              restSeconds: 30,
              difficulty: 'beginner',
              instructions: ['Step feet 4 feet apart, sink front thigh parallel to ground.', 'Reach arms wide and hold breath calm.', 'Sweep front arm up into reverse warrior.'],
              safetyCues: ['Ensure front knee does not collapse inward.'],
              modification: 'Narrow stance or use chair support.',
              equipmentNeeded: 'Yoga Mat'
            }
          ]
        };
      }
      return day;
    })
  };

  db.prepare(`
    INSERT INTO workout_plans (id, user_id, title, target_goal, workout_intensity, plan_type, adaptation_reason, plan_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('plan-priya-orig', 'user-priya-1', priyaOriginalPlan.title, 'weight-loss', 'medium', 'original', null, JSON.stringify(priyaOriginalPlan), now);

  db.prepare(`
    INSERT INTO workout_plans (id, user_id, title, target_goal, workout_intensity, plan_type, adaptation_reason, plan_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('plan-priya-updated', 'user-priya-1', priyaUpdatedPlan.title, 'weight-loss', 'medium', 'updated', priyaUpdatedPlan.adaptationReason, JSON.stringify(priyaUpdatedPlan), now);

  db.prepare(`
    INSERT INTO feedback_logs (id, user_id, plan_id, feedback_text, applied_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('fb-priya-1', 'user-priya-1', 'plan-priya-orig', 'Requested: Add 15-min cardio intervals for higher calorie expenditure', now);

  db.prepare(`
    INSERT INTO feedback_logs (id, user_id, plan_id, feedback_text, applied_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('fb-priya-2', 'user-priya-1', 'plan-priya-updated', 'Requested: Add morning yoga flow on active recovery days for hip tightness', now);


  // Alex Rivera
  db.prepare(`
    INSERT INTO users (id, name, email, age, weight_kg, fitness_goal, workout_intensity, experience_level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('user-alex-2', 'Alex Rivera', 'alex.r@example.com', 32, 78, 'muscle-gain', 'high', 'intermediate', now);

  const alexOriginalPlan = {
    ...priyaOriginalPlan,
    id: 'plan-alex-orig',
    title: "Alex's High-Intensity Hypertrophy 7-Day Split",
    targetGoal: 'muscle-gain',
    workoutIntensity: 'high',
    experienceLevel: 'intermediate',
    overview: 'High-volume hypertrophy split focusing on mechanical tension and muscle fiber recruitment.',
  };

  db.prepare(`
    INSERT INTO workout_plans (id, user_id, title, target_goal, workout_intensity, plan_type, adaptation_reason, plan_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('plan-alex-orig', 'user-alex-2', alexOriginalPlan.title, 'muscle-gain', 'high', 'original', null, JSON.stringify(alexOriginalPlan), now);

  db.prepare(`
    INSERT INTO feedback_logs (id, user_id, plan_id, feedback_text, applied_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('fb-alex-1', 'user-alex-2', 'plan-alex-orig', 'Requested: Increase dumbbell chest hypertrophy volume and reduce shoulder strain', now);


  // David Chen
  db.prepare(`
    INSERT INTO users (id, name, email, age, weight_kg, fitness_goal, workout_intensity, experience_level, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('user-david-3', 'David Chen', 'david.c@example.com', 41, 84, 'general-wellness', 'low', 'beginner', now);

  const davidOriginalPlan = {
    ...priyaOriginalPlan,
    id: 'plan-david-orig',
    title: "David's Low-Impact Joint Longevity Plan",
    targetGoal: 'general-wellness',
    workoutIntensity: 'low',
    experienceLevel: 'beginner',
    overview: 'Gentle functional movement, joint mobility, and posture correction designed for knee longevity.',
  };

  db.prepare(`
    INSERT INTO workout_plans (id, user_id, title, target_goal, workout_intensity, plan_type, adaptation_reason, plan_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run('plan-david-orig', 'user-david-3', davidOriginalPlan.title, 'general-wellness', 'low', 'original', null, JSON.stringify(davidOriginalPlan), now);

  db.prepare(`
    INSERT INTO feedback_logs (id, user_id, plan_id, feedback_text, applied_at)
    VALUES (?, ?, ?, ?, ?)
  `).run('fb-david-1', 'user-david-3', 'plan-david-orig', 'Requested: Low-impact knee-friendly substitutions and core stabilization', now);
}

// User & Plan Operations
export function getAllAdminUsersWithPlans() {
  const users = db.prepare(`SELECT * FROM users ORDER BY created_at DESC`).all() as any[];

  return users.map((u) => {
    const plans = db.prepare(`SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at ASC`).all(u.id) as any[];
    const feedbacks = db.prepare(`SELECT feedback_text, applied_at FROM feedback_logs WHERE user_id = ? ORDER BY applied_at DESC`).all(u.id) as any[];

    const origPlanRow = plans.find((p) => p.plan_type === 'original') || plans[0];
    const updatedPlanRow = plans.find((p) => p.plan_type === 'updated');

    let originalPlan = null;
    let updatedPlan = null;

    if (origPlanRow?.plan_json) {
      try { originalPlan = JSON.parse(origPlanRow.plan_json); } catch (e) {}
    }
    if (updatedPlanRow?.plan_json) {
      try { updatedPlan = JSON.parse(updatedPlanRow.plan_json); } catch (e) {}
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      age: u.age,
      weightKg: u.weight_kg,
      goal: u.fitness_goal,
      intensity: u.workout_intensity,
      experienceLevel: u.experience_level,
      originalPlan,
      updatedPlan,
      feedbackHistory: feedbacks.map((f) => f.feedback_text),
      lastUpdated: u.created_at,
    };
  });
}

export function upsertUser(user: {
  id?: string;
  name: string;
  email: string;
  age?: number;
  weightKg?: number;
  fitnessGoal: string;
  workoutIntensity?: string;
  experienceLevel?: string;
}) {
  const userId = user.id || 'user-' + Date.now();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(user.email) as any;
  if (existing) {
    db.prepare(`
      UPDATE users SET
        name = ?,
        age = ?,
        weight_kg = ?,
        fitness_goal = ?,
        workout_intensity = ?,
        experience_level = ?
      WHERE id = ?
    `).run(
      user.name,
      user.age || 25,
      user.weightKg || 70,
      user.fitnessGoal,
      user.workoutIntensity || 'medium',
      user.experienceLevel || 'beginner',
      existing.id
    );
    return existing.id;
  } else {
    db.prepare(`
      INSERT INTO users (id, name, email, age, weight_kg, fitness_goal, workout_intensity, experience_level, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      user.name,
      user.email,
      user.age || 25,
      user.weightKg || 70,
      user.fitnessGoal,
      user.workoutIntensity || 'medium',
      user.experienceLevel || 'beginner',
      now
    );
    return userId;
  }
}

export function saveWorkoutPlan(
  userId: string,
  plan: any,
  planType: 'original' | 'updated' = 'original',
  adaptationReason?: string
) {
  const planId = plan.id || 'plan-' + Date.now();
  const now = new Date().toISOString();

  // If saving updated, check if user already has an updated plan and replace or insert
  db.prepare(`
    INSERT INTO workout_plans (id, user_id, title, target_goal, workout_intensity, plan_type, adaptation_reason, plan_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    planId,
    userId,
    plan.title,
    plan.targetGoal || 'general-wellness',
    plan.workoutIntensity || 'medium',
    planType,
    adaptationReason || plan.adaptationReason || null,
    JSON.stringify(plan),
    now
  );

  return planId;
}

export function addFeedbackLog(userId: string, planId: string | null, feedbackText: string) {
  const id = 'fb-' + Date.now();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO feedback_logs (id, user_id, plan_id, feedback_text, applied_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId, planId, feedbackText, now);
  return id;
}

// Database Explorer / Schema inspector for Admin
export function getDatabaseStats() {
  const tables = ['users', 'workout_plans', 'feedback_logs', 'nutrition_plans'];
  const tableData = tables.map((tableName) => {
    const rowCount = (db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as any)?.count || 0;
    const columns = (db.prepare(`PRAGMA table_info(${tableName})`).all() as any[]).map((c) => ({
      name: c.name,
      type: c.type,
      pk: Boolean(c.pk),
    }));
    const sampleRows = db.prepare(`SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT 5`).all() as any[];

    return {
      tableName,
      rowCount,
      columns,
      sampleRows,
    };
  });

  const totalUsers = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  const totalPlans = (db.prepare('SELECT COUNT(*) as count FROM workout_plans').get() as any)?.count || 0;
  const totalFeedbacks = (db.prepare('SELECT COUNT(*) as count FROM feedback_logs').get() as any)?.count || 0;

  return {
    engine: 'SQLite 3 (Persistent node:sqlite)',
    file: DB_PATH,
    tables: tableData,
    totalUsers,
    totalPlans,
    totalFeedbacks,
  };
}
