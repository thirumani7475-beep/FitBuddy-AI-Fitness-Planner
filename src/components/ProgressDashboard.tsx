import React, { useState } from 'react';
import { 
  Flame, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Activity, 
  TrendingUp, 
  Heart,
  ChevronRight
} from 'lucide-react';
import { WorkoutLog, Language, FitnessPlan } from '../types/fitness';
import { translations } from '../utils/translations';

interface ProgressDashboardProps {
  logs: WorkoutLog[];
  streak: number;
  language: Language;
  currentPlan: FitnessPlan;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  logs,
  streak,
  language,
  currentPlan,
}) => {
  const t = translations[language];
  const isTamil = language === 'ta';

  // Metrics
  const totalWorkouts = logs.length;
  const totalMinutes = logs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);
  
  // Weekly adherence (target 4 per week)
  const past7Days = logs.filter((l) => {
    const logDate = new Date(l.date).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return logDate >= sevenDaysAgo;
  });
  const weeklyConsistency = Math.min(100, Math.round((past7Days.length / 4) * 100));

  // Calendar: Last 14 days grid
  const calendarDays = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().split('T')[0];
    const logForDay = logs.find((l) => l.date === iso);
    return {
      date: iso,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'narrow' }),
      isCompleted: !!logForDay,
      log: logForDay,
    };
  });

  // AI Weekly Summary State
  const [weeklyAnalysis, setWeeklyAnalysis] = useState<any | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleGenerateWeeklySummary = async () => {
    setIsGeneratingSummary(true);
    setSummaryError(null);

    try {
      const res = await fetch('/api/weekly-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs,
          streak,
          goal: currentPlan.targetGoal,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate weekly summary.');
      }

      setWeeklyAnalysis(data.summary);
    } catch (err: any) {
      setSummaryError(err?.message || 'Error communicating with Gemini.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.progress.streak}</span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-3xl font-mono font-black text-amber-300">
            {streak} <span className="text-xs font-normal text-zinc-400">{t.progress.streakDays}</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            {streak >= 3 ? '🔥 High momentum' : 'Building daily consistency'}
          </span>
        </div>

        {/* Workouts Completed */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.progress.totalWorkouts}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-400">
            {totalWorkouts}
          </div>
          <span className="text-[11px] text-zinc-400 block">
            {language === 'ta' ? 'அமர்வுகள் முடிந்தது' : 'Sessions logged'}
          </span>
        </div>

        {/* Total Minutes */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.progress.totalMinutes}</span>
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-mono font-black text-sky-400">
            {totalMinutes} <span className="text-xs font-normal text-zinc-400">min</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            ~{(totalMinutes / 60).toFixed(1)} {language === 'ta' ? 'மணிநேர பயிற்சி' : 'hours active'}
          </span>
        </div>

        {/* Consistency */}
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">{t.progress.consistency}</span>
            <TrendingUp className="w-5 h-5 text-lime-400" />
          </div>
          <div className="text-3xl font-mono font-black text-lime-400">
            {weeklyConsistency}%
          </div>
          <span className="text-[11px] text-zinc-400 block">
            {past7Days.length} / 4 {language === 'ta' ? 'வாரம் இலக்கு' : 'weekly target'}
          </span>
        </div>
      </div>

      {/* 14-Day Calendar Heatmap */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">{t.progress.calendarTitle}</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {past7Days.length} sessions active this week
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {calendarDays.map((cd, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                cd.isCompleted
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/20'
                  : 'bg-zinc-950/60 border-zinc-800 text-zinc-500'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block">{cd.dayName}</span>
              <span className="text-xs font-mono font-bold block mt-1">{cd.dayNum}</span>
              <div className="mt-1.5 flex justify-center">
                {cd.isCompleted ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Weekly Performance Summary Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.progress.aiWeeklySummary}</h3>
              <p className="text-xs text-zinc-400">
                {language === 'ta'
                  ? 'ஜெமினி உங்கள் பயிற்சி பதிவுகள் மற்றும் உழைப்பை ஆய்வு செய்கிறது'
                  : 'Gemini synthesizes consistency, exertion, and recovery guidance'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateWeeklySummary}
            disabled={isGeneratingSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
          >
            {isGeneratingSummary ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>{t.progress.generatingSummary}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.progress.generateSummary}</span>
              </>
            )}
          </button>
        </div>

        {summaryError && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
            {summaryError}
          </div>
        )}

        {weeklyAnalysis && (
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-400">Overall Grade:</span>
                <span className="text-xl font-mono font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-0.5 rounded-lg">
                  {weeklyAnalysis.grade}
                </span>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                FitBuddy Coach Review
              </span>
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <div className="text-zinc-200 font-medium">
                <span className="text-emerald-400 font-bold block mb-0.5">Praise & Consistency:</span>
                {weeklyAnalysis.praise}
              </div>

              {weeklyAnalysis.recoveryNote && (
                <div className="text-zinc-300">
                  <span className="text-sky-400 font-bold block mb-0.5">Recovery & Sleep Analysis:</span>
                  {weeklyAnalysis.recoveryNote}
                </div>
              )}

              {weeklyAnalysis.nextWeekFocus && (
                <div className="text-zinc-300">
                  <span className="text-amber-400 font-bold block mb-0.5">Next Week Focus:</span>
                  {weeklyAnalysis.nextWeekFocus}
                </div>
              )}

              {weeklyAnalysis.motto && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center font-bold italic text-zinc-200 mt-2">
                  "{weeklyAnalysis.motto}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Workout Log History */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-bold text-white">{t.progress.logHistory}</h3>

        {logs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950/50 border border-dashed border-zinc-800">
            <p className="text-xs text-zinc-400">{t.progress.noLogs}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.slice().reverse().map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{log.date}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs font-bold text-white">{log.dayTitle}</span>
                  </div>
                  {log.notes && (
                    <p className="text-xs text-zinc-400 mt-1 italic">"{log.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="font-mono">{log.durationMinutes} min</span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {log.exercisesCompleted} / {log.totalExercises} exercises
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-amber-300">RPE {log.rpeRating}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
