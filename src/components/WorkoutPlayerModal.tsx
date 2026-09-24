import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Award
} from 'lucide-react';
import { Exercise, WorkoutDay, WorkoutLog, Language } from '../types/fitness';
import { translations } from '../utils/translations';
import { playChime } from '../utils/audio';

interface WorkoutPlayerModalProps {
  day: WorkoutDay;
  language: Language;
  onClose: () => void;
  onFinishWorkout: (log: WorkoutLog) => void;
}

export const WorkoutPlayerModal: React.FC<WorkoutPlayerModalProps> = ({
  day,
  language,
  onClose,
  onFinishWorkout,
}) => {
  const t = translations[language];
  const exercises = day.exercises || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSetsCount, setCompletedSetsCount] = useState<Record<string, number>>({});
  
  // Timer state for Rest or Active Exercise
  const currentExercise = exercises[currentIndex];
  const defaultRest = currentExercise?.restSeconds || 45;
  const [timerSeconds, setTimerSeconds] = useState(defaultRest);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isRestMode, setIsRestMode] = useState(false);

  // Workout Summary Modal state
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [rpe, setRpe] = useState(7);
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<'energized' | 'good' | 'tired' | 'exhausted'>('energized');
  const [startTime] = useState(Date.now());

  // Reset timer when changing exercise
  useEffect(() => {
    if (currentExercise) {
      setTimerSeconds(currentExercise.restSeconds || 45);
      setIsRestMode(false);
      setIsTimerRunning(false);
      const done = completedSetsCount[currentExercise.id] || 0;
      setCurrentSet(Math.min(done + 1, currentExercise.sets));
    }
  }, [currentIndex]);

  // Countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            playChime('tick');
          }
          if (prev <= 1) {
            playChime('beep');
            setIsTimerRunning(false);
            setIsRestMode(false);
            return currentExercise?.restSeconds || 45;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentExercise]);

  if (!exercises.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full text-center">
          <h3 className="text-lg font-bold text-white mb-2">{t.today.restDayTitle}</h3>
          <p className="text-sm text-zinc-400 mb-6">{t.today.restDayDesc}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl text-sm"
          >
            {t.player.exit}
          </button>
        </div>
      </div>
    );
  }

  const handleCompleteSet = () => {
    const exId = currentExercise.id;
    const newSetsDone = (completedSetsCount[exId] || 0) + 1;
    setCompletedSetsCount((prev) => ({ ...prev, [exId]: newSetsDone }));

    playChime('beep');

    if (newSetsDone < currentExercise.sets) {
      setCurrentSet(newSetsDone + 1);
      // Trigger rest timer
      setTimerSeconds(currentExercise.restSeconds || 45);
      setIsRestMode(true);
      setIsTimerRunning(true);
    } else {
      // Completed all sets for this exercise
      if (currentIndex < exercises.length - 1) {
        setIsRestMode(true);
        setTimerSeconds(60);
        setIsTimerRunning(true);
        setCurrentIndex((prev) => prev + 1);
      } else {
        // Last exercise completed!
        playChime('success');
        setShowFinishConfirm(true);
      }
    }
  };

  const handleFinish = () => {
    playChime('success');
    const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    const completedExercises = Object.keys(completedSetsCount).filter(
      (id) => (completedSetsCount[id] || 0) >= (exercises.find((e) => e.id === id)?.sets || 1)
    ).length;

    const log: WorkoutLog = {
      id: 'log-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      dayTitle: day.dayName,
      durationMinutes: elapsedMinutes,
      exercisesCompleted: Math.max(completedExercises, 1),
      totalExercises: exercises.length,
      rpeRating: rpe,
      notes: notes.trim(),
      mood,
    };

    onFinishWorkout(log);
  };

  const progressPercent = Math.round(
    (Object.values(completedSetsCount).reduce((a, b) => a + b, 0) /
      exercises.reduce((a, b) => a + b.sets, 0)) *
      100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                {t.player.title}
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-xs text-zinc-400">{day.dayName}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
              {currentExercise?.name} {currentExercise?.nameTamil ? `(${currentExercise.nameTamil})` : ''}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
            >
              {language === 'ta' ? 'முடிக்க' : 'Finish Early'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Overall Session Progress Bar */}
        <div className="w-full bg-zinc-900 h-1.5">
          <div
            className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Exercise Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Target</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 block truncate">
                {currentExercise?.targetMuscleGroup}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Target Sets</span>
              <span className="text-sm font-bold text-emerald-400 mt-1 block">
                Set {currentSet} of {currentExercise?.sets}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Prescription</span>
              <span className="text-sm font-mono font-bold text-zinc-200 mt-1 block">
                {currentExercise?.repsOrDuration}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Equipment</span>
              <span className="text-sm font-semibold text-zinc-200 mt-1 block truncate">
                {currentExercise?.equipmentNeeded}
              </span>
            </div>
          </div>

          {/* Rest Interval Timer Panel (Highlighted when Rest Active) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isRestMode
                ? 'bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                : 'bg-zinc-900/40 border-zinc-800/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-700/60 text-emerald-400">
                  <Volume2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isRestMode ? t.player.restTimer : (language === 'ta' ? 'ஓய்வு நேரம் கடிகாரம்' : 'Rest Interval Timer')}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {isRestMode
                      ? (language === 'ta' ? 'மூச்சை ஆழமாக இழுத்து விடுங்கள்.' : 'Deep diaphragmatic breathing & hydrate.')
                      : (language === 'ta' ? 'செட் முடிந்ததும் ஓய்வு தொடங்கவும்.' : 'Click "Complete Set" to trigger rest countdown.')}
                  </p>
                </div>
              </div>

              {/* Big Digits Display */}
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-emerald-400 px-4 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                    title={isTimerRunning ? t.player.pause : t.player.resume}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      setTimerSeconds(currentExercise.restSeconds || 45);
                      setIsTimerRunning(false);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {isRestMode && (
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setIsRestMode(false);
                        setTimerSeconds(currentExercise.restSeconds || 45);
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    >
                      {t.player.skipRest}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Instructions & Safety Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instructions */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t.player.instructions}</span>
              </h5>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentExercise?.instructions?.map((inst, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono text-[11px] shrink-0 font-bold">{idx + 1}.</span>
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Cues & Modification */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t.player.safetyCues}</span>
                </h5>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {currentExercise?.safetyCues?.map((cue, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">·</span>
                      <span>{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {currentExercise?.modification && (
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                  <span className="font-semibold text-emerald-400 block mb-0.5">
                    {t.player.modification}:
                  </span>
                  <p className="text-zinc-300">{currentExercise.modification}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation & Complete Set Button */}
        <div className="px-5 py-4 border-t border-zinc-800/80 bg-zinc-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              title={t.player.prev}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
              {currentIndex + 1} / {exercises.length}
            </span>
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(exercises.length - 1, prev + 1))}
              disabled={currentIndex === exercises.length - 1}
              className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
              title={t.player.next}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCompleteSet}
            className="flex-1 max-w-sm py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>
              {language === 'ta'
                ? `செட் ${currentSet} முடிந்தது (${currentSet}/${currentExercise?.sets})`
                : `Complete Set ${currentSet} of ${currentExercise?.sets}`}
            </span>
          </button>

          <button
            onClick={() => setShowFinishConfirm(true)}
            className="px-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            {t.player.finishWorkout}
          </button>
        </div>
      </div>

      {/* Save / Finish Confirmation Dialog */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {language === 'ta' ? 'அருமையான முயற்சி! பயிற்சி நிறைவு!' : 'Outstanding Effort! Workout Complete!'}
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'ta' ? 'உங்கள் முயற்சியை பதிவு செய்து தொடர்ச்சியைப் பேணுங்கள்.' : 'Log this milestone to maintain your consistency streak.'}
              </p>
            </div>

            {/* RPE Effort Rating */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400 font-medium">{t.progress.rating}</span>
                <span className="font-mono font-bold text-emerald-400">{rpe} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>1 (Very Easy)</span>
                <span>5 (Moderate)</span>
                <span>10 (Max Effort)</span>
              </div>
            </div>

            {/* Post Workout Mood */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium block">{t.progress.mood}</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'energized', label: '⚡ Energized' },
                  { id: 'good', label: '💪 Strong' },
                  { id: 'tired', label: '😅 Tired' },
                  { id: 'exhausted', label: '🔥 Pushed' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setMood(item.id as any)}
                    className={`py-2 px-1 text-xs rounded-xl border text-center transition-colors ${
                      mood === item.id
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium block">
                {language === 'ta' ? 'கூடுதல் குறிப்புகள் (விருப்பம்)' : 'Workout Notes (Optional)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={language === 'ta' ? 'எ.கா: முழங்கால் எளிதாக இருந்தது, கூடுதல் எடை சேர்க்க முடிந்தது...' : 'e.g., Felt great on pushups, dumbbells felt light...'}
                className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                {language === 'ta' ? 'பயிற்சியைத் தொடரு' : 'Resume Workout'}
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 transition-colors"
              >
                {language === 'ta' ? 'சேமித்து முடி' : 'Save & Log Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
