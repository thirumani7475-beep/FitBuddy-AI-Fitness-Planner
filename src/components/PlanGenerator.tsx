import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Settings2, 
  Check, 
  AlertCircle, 
  Dumbbell, 
  ShieldCheck, 
  Flame, 
  Clock, 
  MapPin, 
  Zap,
  Gauge,
  User,
  HeartPulse,
  Activity
} from 'lucide-react';
import { FitnessGoal, ExperienceLevel, ActivityLevel, WorkoutLocation, Language, UserProfile, FitnessPlan, WorkoutIntensity } from '../types/fitness';
import { translations } from '../utils/translations';

interface PlanGeneratorProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onPlanCreated: (plan: FitnessPlan) => void;
  language: Language;
}

export const PlanGenerator: React.FC<PlanGeneratorProps> = ({
  userProfile,
  setUserProfile,
  onPlanCreated,
  language,
}) => {
  const t = translations[language];
  const isTamil = language === 'ta';

  const [inputMode, setInputMode] = useState<'structured' | 'natural'>('structured');
  const [naturalPrompt, setNaturalPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available options
  const goals: { id: FitnessGoal; label: string; desc: string; icon: string }[] = [
    { 
      id: 'fat-loss', 
      label: isTamil ? 'கொழுப்பு குறைப்பு (Weight Loss)' : 'Weight Loss & Fat Burning', 
      desc: isTamil ? 'அதிக கலோரி எரிப்பு மற்றும் மெலிந்த உடல் அமைப்பு' : 'High metabolic rate, calorie deficit, and lean core definition',
      icon: '🔥'
    },
    { 
      id: 'muscle-gain', 
      label: isTamil ? 'தசை வளர்ச்சி (Muscle Gain)' : 'Muscle Gain & Hypertrophy', 
      desc: isTamil ? 'முற்போக்கான தசை வளர்ச்சி மற்றும் உறுதி' : 'Progressive overload for maximum hypertrophy and lean mass',
      icon: '💪'
    },
    { 
      id: 'general-fitness', 
      label: isTamil ? 'பொது உடற்தகுதி (General Wellness)' : 'General Wellness & Longevity', 
      desc: isTamil ? 'ஒட்டுமொத்த சுறுசுறுப்பு மற்றும் உடல் ஆரோக்கியம்' : 'Cardiovascular endurance, joint mobility, posture, and vital energy',
      icon: '⚡'
    },
    { 
      id: 'strength', 
      label: isTamil ? 'உடல் வலிமை (Pure Strength)' : 'Pure Functional Strength', 
      desc: isTamil ? 'நரம்புத்தசை வலிமை மற்றும் ஆற்றல்' : 'Heavier compound multi-joint resilience and power output',
      icon: '🏋️'
    },
    { 
      id: 'flexibility', 
      label: isTamil ? 'நெகிழ்வுத்தன்மை (Mobility & Yoga)' : 'Mobility, Flexibility & Yoga', 
      desc: isTamil ? 'மூட்டு இயக்கம், தளர்வு மற்றும் சமநிலை' : 'Spinal decompression, dynamic stretching and restorative yoga flow',
      icon: '🧘'
    },
    { 
      id: 'endurance', 
      label: isTamil ? 'தாங்குதிறன் (Cardio Endurance)' : 'Cardio & Stamina', 
      desc: isTamil ? 'இதய நலன் மற்றும் நீண்டநேர ஆற்றல்' : 'Zone-2 base conditioning and high aerobic threshold',
      icon: '🏃'
    },
  ];

  const intensities: { id: WorkoutIntensity; label: string; sub: string; rpe: string; desc: string }[] = [
    {
      id: 'low',
      label: isTamil ? 'குறைந்த தீவிரம் (Low Intensity)' : 'Low Intensity',
      sub: isTamil ? 'மூட்டுகளுக்கு பாதுகாப்பானது' : 'Joint-Friendly & Steady',
      rpe: 'RPE 4 - 6',
      desc: isTamil ? 'மெதுவான வேகம், மூட்டுப் பாதுகாப்பு, குறைந்த தாக்கம் மற்றும் மீட்புக்கான பயிற்சி.' : 'Controlled tempo, joint-safe movements, longer recovery intervals (60-90s).',
    },
    {
      id: 'medium',
      label: isTamil ? 'நடுத்தர தீவிரம் (Medium Intensity)' : 'Medium Intensity (Recommended)',
      sub: isTamil ? 'சீரான வளர்ச்சி' : 'Progressive & Balanced',
      rpe: 'RPE 6 - 8',
      desc: isTamil ? 'தசை வளர்ச்சி மற்றும் உடற்தகுதிக்கான சிறந்த சமநிலையான பயிற்சி.' : 'Standard hypertrophy cadence, progressive overload, balanced aerobic conditioning (45-60s rest).',
    },
    {
      id: 'high',
      label: isTamil ? 'அதிக தீவிரம் (High Intensity)' : 'High Intensity',
      sub: isTamil ? 'அதிக கலோரி எரிப்பு' : 'Metabolic & High Output',
      rpe: 'RPE 8 - 10',
      desc: isTamil ? 'சூப்பர்செட்டுகள், இடைவெளிகள் மற்றும் அதிக ஆற்றல் தேவைப்படும் தீவிர பயிற்சி.' : 'High-density supersets, HIIT intervals, short rest periods (30-45s), maximum caloric burn.',
    },
  ];

  const levels: { id: ExperienceLevel; label: string }[] = [
    { id: 'beginner', label: isTamil ? 'ஆரம்பநிலை (Beginner)' : 'Beginner (0 - 6 months)' },
    { id: 'intermediate', label: isTamil ? 'இடைநிலை (Intermediate)' : 'Intermediate (6 - 24 months)' },
    { id: 'advanced', label: isTamil ? 'முன்னேறிய நிலை (Advanced)' : 'Advanced (2+ years)' },
  ];

  const equipmentList = [
    'Bodyweight only',
    'Dumbbells',
    'Resistance Bands',
    'Kettlebell',
    'Pull-up Bar',
    'Full Gym Machines',
    'Barbell & Plates',
    'Yoga Mat',
  ];

  const injuryList = [
    { id: 'none', label: isTamil ? 'வலிகள் எதுவும் இல்லை' : 'No limitations / Fully healthy' },
    { id: 'knee-pain', label: isTamil ? 'முழங்கால் வலி / அசௌகரியம்' : 'Knee sensitivity / avoids deep jumps' },
    { id: 'lower-back-pain', label: isTamil ? 'கீழ் முதுகு வலி' : 'Lower back stiffness / avoids heavy deadlifts' },
    { id: 'shoulder-issue', label: isTamil ? 'தோள்பட்டை வலி' : 'Shoulder impingement / rotator cuff' },
    { id: 'wrist-pain', label: isTamil ? 'மணிக்கட்டு வலி' : 'Wrist strain / prefers neutral grip' },
    { id: 'neck-strain', label: isTamil ? 'கழுத்து வலி' : 'Neck stiffness' },
  ];

  const toggleEquipment = (item: string) => {
    const exists = userProfile.availableEquipment.includes(item);
    setUserProfile((prev) => ({
      ...prev,
      availableEquipment: exists
        ? prev.availableEquipment.filter((x) => x !== item)
        : [...prev.availableEquipment, item],
    }));
  };

  const toggleInjury = (id: string) => {
    if (id === 'none') {
      setUserProfile((prev) => ({ ...prev, injuriesAndLimitations: ['none'] }));
      return;
    }
    const current = userProfile.injuriesAndLimitations.filter((x) => x !== 'none');
    const exists = current.includes(id);
    const updated = exists ? current.filter((x) => x !== id) : [...current, id];
    setUserProfile((prev) => ({
      ...prev,
      injuriesAndLimitations: updated.length ? updated : ['none'],
    }));
  };

  // Quick template trigger
  const applyTemplate = (templateKey: string) => {
    if (templateKey === 'fat-loss') {
      setUserProfile((prev) => ({
        ...prev,
        fitnessGoal: 'fat-loss',
        workoutDaysPerWeek: 4,
        sessionDurationMinutes: 30,
        location: 'home',
        availableEquipment: ['Bodyweight only', 'Dumbbells', 'Yoga Mat'],
        injuriesAndLimitations: ['none'],
      }));
      setNaturalPrompt('I have 30 minutes 4 days a week at home with dumbbells, wanting rapid fat loss and core conditioning.');
    } else if (templateKey === 'strength') {
      setUserProfile((prev) => ({
        ...prev,
        fitnessGoal: 'muscle-gain',
        workoutDaysPerWeek: 4,
        sessionDurationMinutes: 45,
        location: 'gym',
        availableEquipment: ['Full Gym Machines', 'Dumbbells', 'Barbell & Plates'],
        injuriesAndLimitations: ['none'],
      }));
      setNaturalPrompt('I want a classic 4-day push-pull-legs gym routine with free weights for muscle growth.');
    } else if (templateKey === 'mobility') {
      setUserProfile((prev) => ({
        ...prev,
        fitnessGoal: 'flexibility',
        workoutDaysPerWeek: 3,
        sessionDurationMinutes: 25,
        location: 'home',
        availableEquipment: ['Bodyweight only', 'Resistance Bands', 'Yoga Mat'],
        injuriesAndLimitations: ['knee-pain', 'lower-back-pain'],
      }));
      setNaturalPrompt('I have knee and lower back stiffness, need a gentle 25-minute joint mobility and core strengthening plan.');
    } else {
      setUserProfile((prev) => ({
        ...prev,
        fitnessGoal: 'general-fitness',
        experienceLevel: 'beginner',
        workoutDaysPerWeek: 3,
        sessionDurationMinutes: 30,
        location: 'home',
        availableEquipment: ['Bodyweight only', 'Yoga Mat'],
        injuriesAndLimitations: ['none'],
      }));
      setNaturalPrompt('Complete beginner wanting a 3-day full body foundation without fancy gym equipment.');
    }
  };

  // Submit Handler
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (inputMode === 'natural') {
        if (!naturalPrompt.trim()) {
          throw new Error('Please enter your natural fitness request or click a template.');
        }
        const res = await fetch('/api/plan/natural-language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            promptText: naturalPrompt.trim(),
            userProfile,
            language,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to process natural language plan.');
        }
        onPlanCreated(data.plan);
      } else {
        const res = await fetch('/api/plan/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...userProfile,
            language,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to generate plan with Gemini.');
        }
        onPlanCreated(data.plan);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{t.generator.title}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Google Gemini 1.5 Pro
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{t.generator.subtitle} · Flash Nutrition & Recovery</p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setInputMode('structured')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                inputMode === 'structured'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>{t.generator.tabStructured}</span>
            </button>
            <button
              onClick={() => setInputMode('natural')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                inputMode === 'natural'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{t.generator.tabNatural}</span>
            </button>
          </div>
        </div>

        {/* Quick Templates Bar */}
        <div className="pt-2 border-t border-zinc-800/80">
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-2">
            {t.generator.quickTemplates}:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'fat-loss', label: t.generator.templateFatLoss },
              { id: 'strength', label: t.generator.templateStrength },
              { id: 'mobility', label: t.generator.templateMobility },
              { id: 'beginner', label: t.generator.templateBeginner },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 whitespace-nowrap transition-colors"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Natural Language Input */}
      {inputMode === 'natural' ? (
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-200 block">
              {language === 'ta' ? 'உங்கள் உடற்பயிற்சி விருப்பத்தை விவரிக்கவும்' : 'Describe your ideal workout routine naturally'}
            </label>
            <p className="text-xs text-zinc-400">{t.generator.naturalHelp}</p>
          </div>

          <textarea
            value={naturalPrompt}
            onChange={(e) => setNaturalPrompt(e.target.value)}
            rows={4}
            placeholder={t.generator.naturalPlaceholder}
            className="w-full text-xs sm:text-sm p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
          />

          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500">
            <span>Try: "30 min fat burn at home with dumbbells"</span>
            <span>·</span>
            <span>"Beginner routine with knee friendly squats"</span>
            <span>·</span>
            <span>"4 days upper/lower body gym hypertrophy"</span>
          </div>
        </div>
      ) : (
        /* Mode 2: Guided Structured Form */
        <div className="space-y-6">
          {/* Athlete Info Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {isTamil ? 'தடகள வீரர் விவரங்கள் (Athlete Profile)' : 'Athlete Profile (Stored in SQLite)'}
                </label>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">Auto-saved to database</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={userProfile.name || ''}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Athlete Name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={userProfile.email || ''}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="athlete@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Age</label>
                <input
                  type="number"
                  value={userProfile.age || 26}
                  onChange={(e) => setUserProfile((prev) => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={userProfile.gender === 'female' ? 62 : 72}
                  readOnly
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Goal Selector */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                {t.generator.goalLabel}
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">Goal-Based Customization</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {goals.map((g) => {
                const isSelected = userProfile.fitnessGoal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setUserProfile((prev) => ({ ...prev, fitnessGoal: g.id }))}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 text-white shadow-sm shadow-emerald-500/10'
                        : 'border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{g.icon}</span>
                        <span className="text-xs font-bold text-zinc-100">{g.label}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">{g.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workout Intensity Selector */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                  {isTamil ? 'உடற்பயிற்சி தீவிரம் (Workout Intensity Selection)' : 'Workout Intensity Selection'}
                </label>
              </div>
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                Current: <span className="text-emerald-400 font-bold">{userProfile.workoutIntensity || 'medium'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {intensities.map((item) => {
                const isSelected = (userProfile.workoutIntensity || 'medium') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setUserProfile((prev) => ({ ...prev, workoutIntensity: item.id }))}
                    className={`p-4 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md shadow-emerald-950/30'
                        : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-wide text-zinc-100">{item.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                        {item.rpe}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-300/90 mt-1">{item.sub}</p>
                    <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">{item.desc}</p>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule & Duration & Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Experience Level */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                {t.generator.levelLabel}
              </label>
              <div className="space-y-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setUserProfile((prev) => ({ ...prev, experienceLevel: lvl.id }))}
                    className={`w-full py-2 px-3 text-xs rounded-xl border text-left flex items-center justify-between transition-colors ${
                      userProfile.experienceLevel === lvl.id
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{lvl.label}</span>
                    {userProfile.experienceLevel === lvl.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {t.generator.splitLabel}
                </label>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {userProfile.workoutDaysPerWeek} days
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="6"
                value={userProfile.workoutDaysPerWeek}
                onChange={(e) =>
                  setUserProfile((prev) => ({
                    ...prev,
                    workoutDaysPerWeek: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>2 days</span>
                <span>4 days (Recommended)</span>
                <span>6 days</span>
              </div>
            </div>

            {/* Duration per session */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  {t.generator.durationLabel}
                </label>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {userProfile.sessionDurationMinutes} min
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[20, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() =>
                      setUserProfile((prev) => ({ ...prev, sessionDurationMinutes: mins }))
                    }
                    className={`py-2 text-xs font-mono font-bold rounded-xl border text-center transition-colors ${
                      userProfile.sessionDurationMinutes === mins
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Equipment */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                {t.generator.locationLabel} & {t.generator.equipmentLabel}
              </label>

              {/* Venue Selector */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'gym', label: 'Gym' },
                  { id: 'hybrid', label: 'Hybrid' },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setUserProfile((prev) => ({ ...prev, location: loc.id as any }))}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      userProfile.location === loc.id
                        ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Chips */}
            <div className="flex flex-wrap gap-2">
              {equipmentList.map((eq) => {
                const isSelected = userProfile.availableEquipment.includes(eq);
                return (
                  <button
                    key={eq}
                    type="button"
                    onClick={() => toggleEquipment(eq)}
                    className={`px-3 py-2 text-xs rounded-xl border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{eq}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Physical Limitations / Injury Safety Filter */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                {t.generator.injuriesLabel} (Gemini AI will adapt exercises)
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {injuryList.map((inj) => {
                const isSelected = userProfile.injuriesAndLimitations.includes(inj.id);
                return (
                  <button
                    key={inj.id}
                    type="button"
                    onClick={() => toggleInjury(inj.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{inj.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Generate Action Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>{t.generator.generating}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{t.generator.generateButton}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
