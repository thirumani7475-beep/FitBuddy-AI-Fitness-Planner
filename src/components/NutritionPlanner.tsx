import React, { useState } from 'react';
import { 
  Utensils, 
  Sparkles, 
  Droplets, 
  Flame, 
  Moon, 
  Apple, 
  Clock, 
  ChevronRight, 
  Zap, 
  HeartPulse, 
  ShieldCheck 
} from 'lucide-react';
import { NutritionPlan, Language, UserProfile, FitnessGoal } from '../types/fitness';
import { translations } from '../utils/translations';

interface NutritionPlannerProps {
  userProfile: UserProfile;
  language: Language;
}

export const NutritionPlanner: React.FC<NutritionPlannerProps> = ({ userProfile, language }) => {
  const isTamil = language === 'ta';

  // Form State
  const [age, setAge] = useState<number>(userProfile.age || 28);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [goal, setGoal] = useState<FitnessGoal>(userProfile.fitnessGoal || 'general-fitness');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial starter nutrition plan
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan>({
    dailyCalories: 2200,
    proteinGrams: 140,
    carbsGrams: 230,
    fatsGrams: 65,
    waterLiters: 3.2,
    overview: isTamil
      ? 'சமச்சீர் புரதம் மற்றும் சிக்கலான கார்போஹைட்ரேட்டுகளுடன் தசைகளை மீட்டெடுக்கும் ஊட்டச்சத்து திட்டம்.'
      : 'Calibrated metabolic blueprint balancing high-bioavailability protein with complex sustained carbohydrates for cellular repair and energy preservation.',
    meals: [
      {
        name: isTamil ? 'காலை உணவு: ஓட்ஸ் & முட்டை பொரியல்' : 'Breakfast: Power Oats & Scrambled Eggs',
        timing: '7:30 AM',
        description: isTamil
          ? 'முழு தானிய ஓட்ஸ், பாதாம், பெர்ரிகள் மற்றும் 2 முட்டைகள்.'
          : 'Rolled oats topped with chia seeds, wild berries, raw honey, alongside 2 pasture-raised whole eggs.',
        calories: 520,
        protein: '32g',
      },
      {
        name: isTamil ? 'மதிய உணவு: கிரில்டு கோழி/பனீர் & பிரவுன் ரைஸ்' : 'Lunch: Grilled Lean Protein & Quinoa Bowl',
        timing: '1:00 PM',
        description: isTamil
          ? 'கிரில் செய்யப்பட்ட கோழி மார்பகக்கறி அல்லது பனீர், வேகவைத்த ப்ரோக்கோலி மற்றும் பழுப்பு அரிசி.'
          : 'Flame-grilled chicken breast or organic tofu, steamed broccoli florets, quinoa, and cold-pressed extra virgin olive oil.',
        calories: 680,
        protein: '45g',
      },
      {
        name: isTamil ? 'பயிற்சிக்கு முன்/பின் சிற்றுண்டி' : 'Pre-Workout Fuel & Hydration',
        timing: '4:30 PM (45m prior to training)',
        description: isTamil
          ? 'வாழைப்பழம், வேர்க்கடலை வெண்ணெய் மற்றும் எலக்ட்ரோலைட் தண்ணீர்.'
          : 'Medium banana with natural almond butter and 400ml chilled water with a pinch of pink Himalayan sea salt.',
        calories: 290,
        protein: '12g',
      },
      {
        name: isTamil ? 'இரவு உணவு: சால்மன்/பருப்பு & நவதானிய சாலட்' : 'Dinner: Wild Salmon / Lentil Nourish Bowl',
        timing: '8:00 PM',
        description: isTamil
          ? 'சுடப்பட்ட மீன் அல்லது தால், வதக்கிய கீரைகள், அவகேடோ மற்றும் இனிப்பு உருளைக்கிழங்கு.'
          : 'Baked salmon or thick seasoned yellow lentils, roasted sweet potato wedges, sautéed spinach, and pumpkin seeds.',
        calories: 610,
        protein: '42g',
      },
    ],
    preWorkoutFuel: isTamil
      ? 'பயிற்சிக்கு 45 நிமிடங்களுக்கு முன் எளிதில் செரிக்கும் வாழைப்பழம் மற்றும் தண்ணீர் அருந்தவும்.'
      : 'Consume fast-acting carbohydrates (banana or 2 Medjool dates) with 350-500ml water 45 minutes before training for glycogen replenishment.',
    postWorkoutRecovery: isTamil
      ? 'பயிற்சி முடிந்த 30 நிமிடங்களுக்குள் புரத குலுக்கு அல்லது 3 வேகவைத்த முட்டைகள் மற்றும் நீர்ச்சத்து எடுக்கவும்.'
      : 'Ingest 25-35g high-quality protein (whey isolate or plant protein blend) within 45 minutes to trigger muscular protein synthesis (mTOR).',
    sleepAndRecoveryProtocol: [
      isTamil
        ? 'ஆழ்ந்த தூக்கம்: இரவு 10:30 மணிக்குள் தூங்கச் சென்று 7-8 மணிநேரம் தடையற்ற தூக்கத்தை உறுதி செய்யுங்கள்.'
        : 'Sleep Architecture: Prioritize 7.5 to 8.5 hours in a dark, 19°C (66°F) ambient environment to maximize deep REM sleep and natural human growth hormone release.',
      isTamil
        ? 'நீரேற்றம்: பயிற்சி முடிந்த பிறகும் உடலின் எடையிழப்பிற்கு ஏற்ப போதுமான அளவு எலக்ட்ரோலைட் நீர் அருந்தவும்.'
        : 'Hydration & Mineral Balance: Replenish 500ml of water per hour of rigorous exertion with magnesium and potassium electrolytes.',
      isTamil
        ? 'தசை தளர்வு: படுக்கைக்கு முன் 10 நிமிட மென்மையான யோகா அல்லது தசை உருளை (foam roll) மசாஜ் செய்யவும்.'
        : 'Nervous System Decompression: 10 minutes of parasympathetic box breathing (4s in, 4s hold, 4s out, 4s hold) and gentle hamstring/spine decompression.',
    ],
  });

  const handleGenerateNutrition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/nutrition/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          weightKg,
          fitnessGoal: goal,
          intensity,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate nutrition guidance.');
      }

      setNutritionPlan(data.nutrition);
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Gemini Flash.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero Banner with Rich Visual Image */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
        <div className="relative h-48 sm:h-60 w-full overflow-hidden">
          <img
            src="/src/assets/images/nutrition_meal_prep_1790240207545.jpg"
            alt="Healthy meal prep on slate counter"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-60 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Gemini Flash Nutrition Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isTamil ? 'தனிப்பயனாக்கப்பட்ட ஊட்டச்சத்து & மீட்பு வழிகாட்டி' : 'Precision Nutrition & Recovery Architecture'}
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl mt-1">
              {isTamil
                ? 'உங்கள் வயது, எடை, பயிற்சி இலக்கு மற்றும் தீவிரத்தின் அடிப்படையில் கணக்கிடப்பட்ட ஊட்டச்சத்து திட்டம்.'
                : 'Custom macronutrient distribution, timed workout nourishment, and circadian recovery guidelines.'}
            </p>
          </div>

          <button
            onClick={handleGenerateNutrition}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 shadow-lg shadow-emerald-500/20 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>{isTamil ? 'கணக்கிடுகிறது...' : 'Analyzing Macros...'}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{isTamil ? 'புதிய ஊட்டச்சத்து திட்டம்' : 'Generate Nutrition Plan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Input Parameters Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-400" />
          <span>{isTamil ? 'உடல் மற்றும் தீவிர அளவுருக்கள்' : 'Metabolic & Physical Inputs'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Age */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{isTamil ? 'வயது' : 'Age (Years)'}</label>
            <input
              type="number"
              min="14"
              max="90"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 28)}
              className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
            />
          </div>

          {/* Weight */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{isTamil ? 'எடை (கிலோ)' : 'Weight (kg)'}</label>
            <input
              type="number"
              min="35"
              max="200"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
              className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
            />
          </div>

          {/* Goal */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{isTamil ? 'இலக்கு' : 'Goal'}</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as FitnessGoal)}
              className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
            >
              <option value="fat-loss">Fat Loss</option>
              <option value="muscle-gain">Muscle Hypertrophy</option>
              <option value="general-fitness">General Fitness</option>
              <option value="strength">Strength</option>
              <option value="flexibility">Mobility & Yoga</option>
              <option value="endurance">Endurance</option>
            </select>
          </div>

          {/* Intensity */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400">{isTamil ? 'தீவிரம்' : 'Workout Intensity'}</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white capitalize"
            >
              <option value="low">Low (Light / Recovery)</option>
              <option value="moderate">Moderate (Standard)</option>
              <option value="high">High (Athletic / Intense)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Daily Macro Targets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Calories */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Daily Calorie Target</span>
          <div className="text-2xl font-mono font-black text-amber-400 mt-1">
            {nutritionPlan.dailyCalories} <span className="text-xs font-normal text-zinc-400">kcal</span>
          </div>
          <span className="text-[10px] text-zinc-500">Metabolic Baseline</span>
        </div>

        {/* Protein */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Protein Target</span>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
            {nutritionPlan.proteinGrams}g
          </div>
          <span className="text-[10px] text-zinc-500">~{((nutritionPlan.proteinGrams * 4 / nutritionPlan.dailyCalories) * 100).toFixed(0)}% of intake</span>
        </div>

        {/* Carbs */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Carbohydrates</span>
          <div className="text-2xl font-mono font-black text-sky-400 mt-1">
            {nutritionPlan.carbsGrams}g
          </div>
          <span className="text-[10px] text-zinc-500">Glycogen & Fuel</span>
        </div>

        {/* Fats */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Healthy Fats</span>
          <div className="text-2xl font-mono font-black text-lime-400 mt-1">
            {nutritionPlan.fatsGrams}g
          </div>
          <span className="text-[10px] text-zinc-500">Hormonal Health</span>
        </div>

        {/* Hydration */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1 text-center">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono">Hydration</span>
          <div className="text-2xl font-mono font-black text-cyan-300 mt-1 flex items-center justify-center gap-1">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span>{nutritionPlan.waterLiters}L</span>
          </div>
          <span className="text-[10px] text-zinc-500">Daily Water Goal</span>
        </div>
      </div>

      {/* Plan Summary */}
      {nutritionPlan.overview && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-200 leading-relaxed">
          <span className="font-bold text-emerald-400 block mb-1">
            {isTamil ? 'ஊட்டச்சத்து கண்ணோட்டம்:' : 'Nutritionist Strategy Overview:'}
          </span>
          {nutritionPlan.overview}
        </div>
      )}

      {/* Timed Meal Schedule */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>{isTamil ? 'தினசரி உணவு அட்டவணை & ஊட்டச்சத்து விநியோகம்' : 'Daily Meal Schedule & Nutrient Timing'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nutritionPlan.meals?.map((meal, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-white">{meal.name}</h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {meal.timing}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{meal.description}</p>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span className="text-amber-300 font-bold">{meal.calories} kcal</span>
                <span className="text-emerald-400 font-semibold">{meal.protein} Protein</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre & Post Workout Timing Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pre Workout */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>{isTamil ? 'பயிற்சிக்கு முன் ஊட்டச்சத்து' : 'Pre-Workout Nutrient Timing'}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">{nutritionPlan.preWorkoutFuel}</p>
        </div>

        {/* Post Workout */}
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>{isTamil ? 'பயிற்சிக்கு பின் தசை மீட்பு' : 'Post-Workout Anabolic Recovery'}</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">{nutritionPlan.postWorkoutRecovery}</p>
        </div>
      </div>

      {/* Sleep Architecture & Central Nervous System Recovery */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Moon className="w-4 h-4" />
          <span>{isTamil ? 'ஆழ்ந்த தூக்கம் & நரம்பு மண்டல மீட்பு நெறிமுறைகள்' : 'Restorative Sleep & Physiological Recovery Protocols'}</span>
        </div>

        <div className="space-y-2.5">
          {nutritionPlan.sleepAndRecoveryProtocol?.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5"
            >
              <span className="text-indigo-400 font-mono font-bold text-xs">0{idx + 1}.</span>
              <p className="leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
