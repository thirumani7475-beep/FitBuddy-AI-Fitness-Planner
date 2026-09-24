import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Bookmark, 
  Check, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  RotateCcw, 
  Zap, 
  BatteryCharging, 
  SunMedium, 
  Dumbbell 
} from 'lucide-react';
import { FitnessPlan, WorkoutDay, Exercise, Language } from '../types/fitness';
import { translations } from '../utils/translations';
import { PlanValidationBadge } from './PlanValidationBadge';
import { validateFitnessPlan } from '../utils/fitnessValidation';

interface WorkoutScheduleViewProps {
  plan: FitnessPlan;
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
  language: Language;
  onStartWorkout: (day: WorkoutDay) => void;
  onToggleFavorite: (exercise: Exercise) => void;
  isFavorite: (id: string) => boolean;
  onOpenAdaptModal: () => void;
}

export const WorkoutScheduleView: React.FC<WorkoutScheduleViewProps> = ({
  plan,
  selectedDayIndex,
  setSelectedDayIndex,
  language,
  onStartWorkout,
  onToggleFavorite,
  isFavorite,
  onOpenAdaptModal,
}) => {
  const t = translations[language];
  const isTamil = language === 'ta';

  const days = plan.days || [];
  const activeDay = days.find((d) => d.dayIndex === selectedDayIndex) || days[0];

  // Daily Micro-Recommendation state
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('medium');
  const [dailyRec, setDailyRec] = useState<any | null>(null);
  const [isLoadingRec, setIsLoadingRec] = useState(false);

  const handleGetDailyRecommendation = async () => {
    setIsLoadingRec(true);
    try {
      const res = await fetch('/api/daily-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energyLevel,
          availableMinutes: activeDay?.estimatedMinutes || 30,
          goal: plan.targetGoal,
          language,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDailyRec(data.recommendation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRec(false);
    }
  };

  const validation = validateFitnessPlan(plan);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Rich Hero Banner with Generated Imagery */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden">
          <img
            src="/src/assets/images/fitbuddy_hero_banner_1790240187817.jpg"
            alt="Futuristic athletic studio with ambient emerald glow"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-65 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
              <span>{plan.targetGoal}</span>
              <span className="text-zinc-600">·</span>
              <span className="capitalize">{plan.experienceLevel}</span>
              <span className="text-zinc-600">·</span>
              <span>Gemini 3.8 Architecture</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {plan.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl line-clamp-2">
              {plan.overview}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!activeDay.isRestDay && (
              <button
                onClick={() => onStartWorkout(activeDay)}
                className="px-5 py-2.5 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-zinc-950" />
                <span>{t.today.startWorkout}</span>
              </button>
            )}
            <button
              onClick={onOpenAdaptModal}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.generator.adaptButton}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Program Header Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        {/* Adaptation Rationale Banner */}
        {plan.isAdapted && plan.adaptationReason && (
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                {language === 'ta' ? 'AI தழுவல் செயல்படுத்தப்பட்டது' : 'AI Adaptive Customization Active'}
              </span>
              <p className="text-zinc-300">{plan.adaptationReason}</p>
            </div>
          </div>
        )}

        {/* Plan Safety Validation Badge */}
        <PlanValidationBadge validation={validation} language={language} />
      </div>


      {/* 7-Day Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day) => {
          const isSelected = day.dayIndex === selectedDayIndex;
          return (
            <button
              key={day.dayIndex}
              onClick={() => setSelectedDayIndex(day.dayIndex)}
              className={`p-3 rounded-xl border text-left min-w-[130px] transition-all shrink-0 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-950/30'
                  : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  Day {day.dayIndex}
                </span>
                {day.isRestDay ? (
                  <span className="text-[10px] text-zinc-500 font-mono">Rest</span>
                ) : (
                  <span className="text-[10px] text-emerald-400 font-mono">{day.exercises?.length || 0} ex</span>
                )}
              </div>
              <p className="text-xs font-semibold text-zinc-200 mt-1 truncate">
                {day.focus}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      {activeDay && (
        <div className="space-y-6">
          {/* Day Hero Header Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider font-semibold">
                  {activeDay.dayName}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {activeDay.focus}
                </h3>
                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>~{activeDay.estimatedMinutes} mins</span>
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span>{activeDay.isRestDay ? 'Rest / Active Recovery' : `${activeDay.exercises?.length} Exercises`}</span>
                </div>
              </div>

              {!activeDay.isRestDay && (
                <button
                  onClick={() => onStartWorkout(activeDay)}
                  className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>{t.today.startWorkout}</span>
                </button>
              )}
            </div>

            {/* Coach Tip Callout */}
            {activeDay.coachTip && (
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    {t.today.coachTip}:
                  </span>
                  <span>{activeDay.coachTip}</span>
                </div>
              </div>
            )}
          </div>

          {/* Daily Micro-Recommendation Trigger Panel */}
          <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">
                    {language === 'ta' ? 'இன்றைய AI தினசரி பரிந்துரை' : 'Daily Fitness Recommendation'}
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    {language === 'ta' ? 'உங்கள் இன்றைய ஆற்றல் நிலைக்கு ஏற்ப பரிந்துரை பெறுங்கள்' : 'Get quick coach guidance calibrated to today’s energy'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Energy selector */}
                <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                  {[
                    { id: 'low', label: 'Low 😴' },
                    { id: 'medium', label: 'Normal ⚡' },
                    { id: 'high', label: 'High 🔥' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setEnergyLevel(lvl.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        energyLevel === lvl.id
                          ? 'bg-zinc-800 text-emerald-400'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGetDailyRecommendation}
                  disabled={isLoadingRec}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingRec ? 'Loading...' : 'Ask AI'}
                </button>
              </div>
            </div>

            {dailyRec && (
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-emerald-500/20 text-xs space-y-2 animate-in fade-in duration-200">
                <div className="font-bold text-emerald-400">{dailyRec.focusTitle}</div>
                <p className="text-zinc-300 leading-relaxed">{dailyRec.summary}</p>
                {dailyRec.actionSteps && (
                  <ul className="space-y-1 text-zinc-400 pt-1">
                    {dailyRec.actionSteps.map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">·</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {dailyRec.motivationalQuote && (
                  <div className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800/60">
                    "{dailyRec.motivationalQuote}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Warmup & Cooldown summary if not rest day */}
          {!activeDay.isRestDay && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dynamic Warmup */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <SunMedium className="w-4 h-4" />
                  <span>{t.today.warmup}</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {activeDay.warmup?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">W{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cool-Down */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4" />
                  <span>{t.today.cooldown}</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {activeDay.cooldown?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-sky-400 font-mono text-[11px] font-bold">C{idx + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Exercises Breakdown */}
          {activeDay.isRestDay ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-zinc-800 space-y-3">
              <Dumbbell className="w-10 h-10 text-emerald-400/40 mx-auto" />
              <h4 className="text-base font-bold text-white">{t.today.restDayTitle}</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                {t.today.restDayDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                {t.today.exerciseList} ({activeDay.exercises?.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDay.exercises?.map((exercise, index) => {
                  const bookmarked = isFavorite(exercise.id);
                  return (
                    <div
                      key={exercise.id || index}
                      className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                              {exercise.targetMuscleGroup}
                            </span>
                            <h5 className="text-base font-bold text-white mt-0.5">
                              {exercise.name}
                            </h5>
                            {exercise.nameTamil && (
                              <span className="text-xs text-zinc-400 block mt-0.5">
                                {exercise.nameTamil}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => onToggleFavorite(exercise)}
                            className={`p-2 rounded-xl transition-colors ${
                              bookmarked
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-zinc-950 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
                            }`}
                            title={bookmarked ? 'Saved to vault' : 'Bookmark exercise'}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-emerald-400' : ''}`} />
                          </button>
                        </div>

                        {/* Specs */}
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 py-1.5 border-y border-zinc-800/60 font-mono">
                          <span className="text-emerald-400 font-bold">{exercise.sets} Sets</span>
                          <span className="text-zinc-700">·</span>
                          <span className="text-zinc-200">{exercise.repsOrDuration}</span>
                          <span className="text-zinc-700">·</span>
                          <span>{exercise.restSeconds}s rest</span>
                          <span className="text-zinc-700">·</span>
                          <span className="capitalize">{exercise.difficulty}</span>
                        </div>

                        {/* Key Instructions Snippet */}
                        <div className="mt-3 space-y-1">
                          {exercise.instructions?.slice(0, 2).map((inst, i) => (
                            <p key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                              <span className="text-emerald-400">✓</span>
                              <span>{inst}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Safety cue badge & modification */}
                      <div className="pt-2 border-t border-zinc-800/60 space-y-2">
                        {exercise.safetyCues?.[0] && (
                          <div className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{exercise.safetyCues[0]}</span>
                          </div>
                        )}
                        {exercise.modification && (
                          <div className="text-[11px] text-emerald-400/90 bg-emerald-950/20 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                            <span className="font-semibold">Safe Mod: </span>
                            <span>{exercise.modification}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
