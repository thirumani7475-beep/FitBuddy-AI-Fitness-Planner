import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  Send, 
  Dumbbell, 
  Flame, 
  Calendar, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Layers,
  Database,
  Code2,
  Terminal,
  Table,
  Server,
  FileCode,
  Gauge,
  Copy,
  Check,
  Eye
} from 'lucide-react';
import { FitnessPlan, Language, UserProfile, AdminClient, WorkoutDay, DatabaseStats } from '../types/fitness';
import { initialFitnessPlan } from '../utils/initialPlan';
import { playChime } from '../utils/audio';

interface AdminComparisonDashboardProps {
  currentPlan: FitnessPlan;
  onApplyPlanToUser: (plan: FitnessPlan) => void;
  language: Language;
}

export const AdminComparisonDashboard: React.FC<AdminComparisonDashboardProps> = ({
  currentPlan,
  onApplyPlanToUser,
  language,
}) => {
  const isTamil = language === 'ta';

  // Navigation tabs within Admin
  const [activeTab, setActiveTab] = useState<'comparison' | 'database' | 'fastapi'>('comparison');

  // Seed adapted plan with "Cardio & Yoga Additions"
  const defaultUpdatedPlan: FitnessPlan = {
    ...currentPlan,
    id: 'plan-updated-admin-seed',
    title: currentPlan.title + ' (Updated with Cardio & Yoga)',
    workoutIntensity: currentPlan.workoutIntensity || 'medium',
    isAdapted: true,
    adaptationReason: isTamil
      ? 'பயிற்சியாளர் புதுப்பிப்பு: வாராந்திர கார்டியோ மற்றும் யோகா நெகிழ்வுத்தன்மை பயிற்சிகள் சேர்க்கப்பட்டன.'
      : 'Trainer Update: Integrated 15-min metabolic cardio intervals on Day 1 & Day 3, plus dedicated restorative Hatha Yoga mobility.',
    days: currentPlan.days.map((day) => {
      if (day.dayIndex === 1) {
        return {
          ...day,
          focus: day.focus + ' + HIIT Cardio',
          estimatedMinutes: day.estimatedMinutes + 12,
          exercises: [
            ...day.exercises,
            {
              id: 'ex-cardio-1',
              name: 'High-Knee HIIT Intervals',
              nameTamil: 'உயர் முழங்கால் கார்டியோ சுழற்சி',
              targetMuscleGroup: 'Cardiovascular / Full Body',
              sets: 4,
              repsOrDuration: '45s Work / 15s Rest',
              restSeconds: 30,
              difficulty: 'intermediate',
              instructions: [
                'Drive knees rapidly toward hip height with athletic arm swing.',
                'Maintain upright posture and land softly on midfoot balls.',
              ],
              safetyCues: ['Keep core braced to protect lumbar spine.'],
              modification: 'March in place with high knees without jumping for low-impact.',
              equipmentNeeded: 'None',
            },
          ],
        };
      }
      if (day.dayIndex === 4 || day.isRestDay) {
        return {
          ...day,
          isRestDay: false,
          focus: 'Restorative Yoga & Hip Mobility Flow',
          estimatedMinutes: 25,
          coachTip: 'Gentle spinal decompression and parasympathetic recovery.',
          exercises: [
            {
              id: 'ex-yoga-1',
              name: 'Warrior II to Low Lunge Flow',
              nameTamil: 'யோகா: வீரபத்ராசனம் மற்றும் இடுப்பு தளர்வு',
              targetMuscleGroup: 'Hip Flexors / Spine / Groin',
              sets: 3,
              repsOrDuration: '60 seconds each side',
              restSeconds: 30,
              difficulty: 'beginner',
              instructions: [
                'Step into deep lunge, sink hips forward and open chest.',
                'Breathe diaphragmatically for 5 full cycles.',
              ],
              safetyCues: ['Do not let front knee track inward past ankle.'],
              modification: 'Place rear knee gently on a padded cushion or yoga block for knee relief.',
              equipmentNeeded: 'Yoga Mat',
            },
          ],
        };
      }
      return day;
    }),
  };

  // State
  const [clients, setClients] = useState<AdminClient[]>([
    {
      id: 'client-1',
      name: 'Priya Sharma',
      email: 'priya.s@example.com',
      age: 26,
      weightKg: 62,
      goal: 'weight-loss',
      intensity: 'medium',
      originalPlan: initialFitnessPlan,
      updatedPlan: defaultUpdatedPlan,
      feedbackHistory: [
        'Requested: Add 15-min cardio intervals',
        'Requested: Add morning yoga on active recovery days',
      ],
      lastUpdated: 'Today',
    },
    {
      id: 'client-2',
      name: 'Alex Rivera',
      email: 'alex.r@example.com',
      age: 32,
      weightKg: 78,
      goal: 'muscle-gain',
      intensity: 'high',
      originalPlan: initialFitnessPlan,
      feedbackHistory: ['Requested: Increase dumbbell chest hypertrophy volume'],
      lastUpdated: 'Yesterday',
    },
    {
      id: 'client-3',
      name: 'David Chen',
      email: 'david.c@example.com',
      age: 41,
      weightKg: 84,
      goal: 'general-wellness',
      intensity: 'low',
      originalPlan: initialFitnessPlan,
      feedbackHistory: ['Requested: Low-impact knee-friendly substitutions'],
      lastUpdated: '3 days ago',
    },
  ]);

  const [selectedClientId, setSelectedClientId] = useState<string>('client-1');
  const [originalPlan, setOriginalPlan] = useState<FitnessPlan>(initialFitnessPlan);
  const [updatedPlan, setUpdatedPlan] = useState<FitnessPlan>(defaultUpdatedPlan);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  
  // Feedback simulator
  const [feedbackText, setFeedbackText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // SQLite Stats & FastAPI Architecture State
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [selectedDbTable, setSelectedDbTable] = useState<string>('users');
  const [fastApiData, setFastApiData] = useState<any>(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState<string | null>(null);

  // Fetch SQLite users & Database stats
  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.users?.length > 0) {
          setClients(data.users);
          const firstClient = data.users.find((u: AdminClient) => u.id === selectedClientId) || data.users[0];
          if (firstClient) {
            if (firstClient.originalPlan) setOriginalPlan(firstClient.originalPlan);
            if (firstClient.updatedPlan) setUpdatedPlan(firstClient.updatedPlan);
          }
        }
      }

      const dbRes = await fetch('/api/db/stats');
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.success) {
          setDbStats(dbData.stats);
        }
      }

      const archRes = await fetch('/api/architecture/fastapi-jinja');
      if (archRes.ok) {
        const archData = await archRes.json();
        if (archData.success) {
          setFastApiData(archData);
        }
      }
    } catch (e) {
      console.warn('Notice: Using local admin cache while syncing with SQLite', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      if (client.originalPlan) setOriginalPlan(client.originalPlan);
      if (client.updatedPlan) setUpdatedPlan(client.updatedPlan);
      else setUpdatedPlan(defaultUpdatedPlan);
    }
  };

  const handleApplyFeedback = async (presetText?: string) => {
    const feedback = presetText || feedbackText;
    if (!feedback.trim()) return;

    setIsUpdating(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/feedback-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentClient?.id || 'user-priya-1',
          originalPlan,
          feedback,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update plan from feedback.');
      }

      setUpdatedPlan(data.plan);
      setFeedbackText('');
      setStatusMessage(
        isTamil
          ? `அட்டவணை வெற்றிகரமாக புதுப்பிக்கப்பட்டது: "${feedback}"`
          : `Plan updated based on feedback: "${feedback}"`
      );
      playChime('success');
      // Refresh database records
      fetchAdminData();
    } catch (err: any) {
      setStatusMessage(err?.message || 'Error communicating with Gemini.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePushToActive = () => {
    onApplyPlanToUser(updatedPlan);
    playChime('success');
    setStatusMessage(
      isTamil
        ? 'புதுப்பிக்கப்பட்ட திட்டம் பயனர் கணக்கிற்கு வெற்றிகரமாக மாற்றப்பட்டது!'
        : 'Updated plan has been deployed to active workout session!'
    );
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeKey(key);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const origDay = originalPlan.days?.find((d) => d.dayIndex === selectedDayIndex);
  const newDay = updatedPlan.days?.find((d) => d.dayIndex === selectedDayIndex);

  const activeTableData = dbStats?.tables?.find((t) => t.tableName === selectedDbTable);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>FitBuddy Admin & Engineering Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isTamil ? 'நிர்வாகி கட்டுப்பாட்டு பலகை & தரவுத்தளம்' : 'Admin Control, Plan Diff & SQLite Persistence'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            {isTamil
              ? 'பதிவுசெய்யப்பட்ட பயனர்கள், அசல் vs புதுப்பிக்கப்பட்ட உடற்பயிற்சி அட்டவணைகள் மற்றும் SQLite தரவுகளைப் பார்வையிடவும்.'
              : 'Inspect registered athletes, compare original vs updated 7-day plans with live Gemini feedback updates, and explore the SQLite/SQLAlchemy schema.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Tab Switcher */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'comparison'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plans Diff</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'database'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>SQLite & SQLAlchemy</span>
            </button>
            <button
              onClick={() => setActiveTab('fastapi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'fastapi'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>FastAPI & Jinja2</span>
            </button>
          </div>

          {activeTab === 'comparison' && (
            <button
              onClick={handlePushToActive}
              className="px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isTamil ? 'பயன்பாட்டுக்கு ஏற்று' : 'Deploy to Active Workout'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Comparison & Feedback Engine */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Visual Showcase: Yoga & Active Recovery Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <div className="relative h-36 sm:h-44 w-full overflow-hidden">
              <img
                src="/src/assets/images/yoga_mobility_card_1790240225483.jpg"
                alt="Yoga and mobility studio with warm ambient sunlight"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
            </div>

            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-center max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                  Google Gemini 1.5 Pro & Gemini Flash
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  SQLite Storage
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-2">
                {isTamil ? 'கருத்துக்கேற்ப உடனடி திட்டம் மாற்றம்' : 'Dynamic Program Adaptation from Client Feedback'}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {isTamil
                  ? 'பயனர்கள் கார்டியோ அல்லது யோகா சேர்க்கக் கோரும் போது, ஜெமினி 7-நாள் அட்டவணையை உடனடியாக மாற்றியமைக்கிறது.'
                  : 'Submit natural trainer feedback like "Add 15-min cardio intervals" or "Add morning yoga flow". Gemini recalibrates exercise selections and updates SQLite.'}
              </p>
            </div>
          </div>

          {/* Client Selector Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Registered Athletes in SQLite ({clients.length})</span>
              <span className="font-mono text-emerald-400 text-[11px]">Click an athlete to inspect original vs updated plan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {clients.map((c) => {
                const isSelected = selectedClientId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectClient(c.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 shadow-md shadow-emerald-950/30'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 capitalize">
                        {c.goal}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-2">
                      <span>{c.age} yrs</span>
                      <span>·</span>
                      <span>{c.weightKg} kg</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-300 uppercase text-[10px]">
                        {c.intensity || 'medium'} intensity
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-2 truncate font-mono">
                      {c.email}
                    </div>
                    {c.updatedPlan && (
                      <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Has Adapted Plan</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Simulator Box */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isTamil ? 'AI கருத்து இயந்திரம் (Feedback Simulator)' : 'Test Feedback Modification on Selected Athlete'}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                Target: <span className="text-emerald-400 font-bold">{currentClient?.name}</span>
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                'Add 15-min metabolic cardio intervals to Day 1 & Day 3',
                'Add morning yoga flow on active recovery days',
                'Reduce workout intensity for knee sensitivity',
                'Add dumbbell chest hypertrophy burnout sets',
                'Include 10-minute core finisher at the end of each session',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyFeedback(preset)}
                  disabled={isUpdating}
                  className="text-xs px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>{preset}</span>
                </button>
              ))}
            </div>

            {/* Custom feedback input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Type custom feedback (e.g. 'Add 20 minutes of swimming cardio on Saturday')..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleApplyFeedback()}
                disabled={isUpdating || !feedbackText.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-500 hover:from-emerald-400 hover:to-lime-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all shrink-0"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Recalibrating with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Feedback</span>
                  </>
                )}
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>

          {/* Day Selector Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
              <button
                key={dayNum}
                onClick={() => setSelectedDayIndex(dayNum)}
                className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border transition-colors whitespace-nowrap ${
                  selectedDayIndex === dayNum
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-sm'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Day {dayNum}
              </button>
            ))}
          </div>

          {/* Side-by-Side Plan Diff Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Original Plan */}
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
                  <h3 className="text-sm font-bold text-zinc-200">Original Plan (Initial Blueprint)</h3>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Day {selectedDayIndex} of 7</span>
              </div>

              {origDay ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono text-zinc-500 uppercase">{origDay.dayName}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{origDay.focus}</h4>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      ~{origDay.estimatedMinutes} mins · {origDay.isRestDay ? 'Rest Day' : `${origDay.exercises?.length} exercises`}
                    </span>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2 pt-2">
                    {origDay.exercises?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-xs text-zinc-500 text-center">
                        Active Recovery / Rest Day
                      </div>
                    ) : (
                      origDay.exercises?.map((ex, idx) => (
                        <div
                          key={ex.id || idx}
                          className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">{ex.name}</span>
                            <span className="font-mono text-zinc-400 text-[11px]">{ex.sets} × {ex.repsOrDuration}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">{ex.targetMuscleGroup} · {ex.restSeconds}s rest</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No data for Day {selectedDayIndex}</p>
              )}
            </div>

            {/* Right Column: Updated / Adapted Plan (Highlighted Diff) */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/20 via-zinc-900/60 to-zinc-900/40 border border-emerald-500/40 space-y-4 shadow-lg shadow-emerald-950/20">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-emerald-300">Updated / Adapted Plan (Diff)</h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded">
                  AI Recalibrated
                </span>
              </div>

              {newDay ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 uppercase">{newDay.dayName}</span>
                    <h4 className="text-base font-bold text-white mt-0.5">{newDay.focus}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-300 mt-0.5">
                      <span className="font-bold text-emerald-400">~{newDay.estimatedMinutes} mins</span>
                      <span>·</span>
                      <span>{newDay.isRestDay ? 'Rest' : `${newDay.exercises?.length} exercises`}</span>
                      {newDay.estimatedMinutes !== origDay?.estimatedMinutes && (
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                          +{(newDay.estimatedMinutes - (origDay?.estimatedMinutes || 0))} min diff
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rationale if present */}
                  {updatedPlan.adaptationReason && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
                      <span className="font-bold">Coach Rationale: </span>
                      <span>{updatedPlan.adaptationReason}</span>
                    </div>
                  )}

                  {/* Exercises with Diff Tags */}
                  <div className="space-y-2 pt-2">
                    {newDay.exercises?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-xs text-zinc-500 text-center">
                        Active Recovery / Rest Day
                      </div>
                    ) : (
                      newDay.exercises?.map((ex, idx) => {
                        const isNewAddition = !origDay?.exercises?.some((oe) => oe.name.toLowerCase() === ex.name.toLowerCase());
                        return (
                          <div
                            key={ex.id || idx}
                            className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                              isNewAddition
                                ? 'bg-emerald-950/50 border-emerald-500/60 shadow-sm shadow-emerald-950/30'
                                : 'bg-zinc-950/60 border-zinc-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-zinc-100">{ex.name}</span>
                                {isNewAddition && (
                                  <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500 text-zinc-950 px-1.5 py-0.2 rounded">
                                    + Added from Feedback
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-emerald-300 font-bold text-[11px]">
                                {ex.sets} × {ex.repsOrDuration}
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block">{ex.targetMuscleGroup} · {ex.restSeconds}s rest</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No data for Day {selectedDayIndex}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQLite & SQLAlchemy Explorer */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Database Banner */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">SQLite 3 & SQLAlchemy Database Engine</h3>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Active Storage
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  File: <code className="text-emerald-400 font-mono">fitbuddy.db</code> · Real persistence storing athlete records, 7-day plans, and feedback logs.
                </p>
              </div>

              <button
                onClick={fetchAdminData}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <RefreshCw className="w-3 h-3 text-emerald-400" />
                <span>Refresh DB</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Total Athletes</span>
                <p className="text-xl font-black text-white mt-0.5">{dbStats?.totalUsers ?? clients.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400">7-Day Plans Stored</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{dbStats?.totalPlans ?? 4}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Feedback Logs</span>
                <p className="text-xl font-black text-cyan-400 mt-0.5">{dbStats?.totalFeedbacks ?? 4}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-[10px] uppercase font-mono text-zinc-400">Storage Engine</span>
                <p className="text-xs font-mono text-zinc-200 mt-1.5">SQLite / SQLAlchemy</p>
              </div>
            </div>
          </div>

          {/* Table Switcher */}
          <div className="flex gap-2 border-b border-zinc-800 pb-2">
            {['users', 'workout_plans', 'feedback_logs', 'nutrition_plans'].map((tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedDbTable(tbl)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  selectedDbTable === tbl
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{tbl}</span>
                <span className="text-[10px] opacity-70">
                  ({dbStats?.tables?.find((t) => t.tableName === tbl)?.rowCount ?? 0})
                </span>
              </button>
            ))}
          </div>

          {/* Active Table Viewer */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">TABLE: {selectedDbTable}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Schema: {activeTableData?.columns?.map((c) => `${c.name} (${c.type})`).join(', ')}
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {activeTableData?.rowCount || 0} rows found
              </span>
            </div>

            {/* Table Rows Display */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    {activeTableData?.columns?.map((col) => (
                      <th key={col.name} className="p-3 font-semibold uppercase text-[10px]">
                        {col.name} {col.pk && <span className="text-emerald-400 font-bold">(PK)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/60">
                  {activeTableData && activeTableData.sampleRows && activeTableData.sampleRows.length > 0 ? (
                    activeTableData.sampleRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40">
                        {activeTableData.columns.map((col) => {
                          const val = row[col.name];
                          const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val ?? 'NULL');
                          return (
                            <td key={col.name} className="p-3 text-zinc-300 max-w-xs truncate" title={displayVal}>
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeTableData?.columns?.length || 1} className="p-6 text-center text-zinc-500">
                        No rows in this table yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQLAlchemy Code Showcase */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">SQLAlchemy Models (Python ORM Definition)</h4>
              </div>
              <button
                onClick={() => copyToClipboard(fastApiData?.sqlAlchemyCode || '', 'sqlalchemy')}
                className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeKey === 'sqlalchemy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeKey === 'sqlalchemy' ? 'Copied' : 'Copy Python'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-300/90 overflow-x-auto leading-relaxed max-h-64">
              {fastApiData?.sqlAlchemyCode || 'Loading SQLAlchemy models...'}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: FastAPI Backend & Jinja2 Templates */}
      {activeTab === 'fastapi' && (
        <div className="space-y-6">
          {/* FastAPI Architecture Header */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">FastAPI Backend & Jinja2 Frontend Architecture</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              FitBuddy includes the complete production-ready Python FastAPI architecture: route controllers for 7-day plan generation, feedback modifications with Gemini 1.5 Pro, SQLAlchemy session management, and Jinja2 template rendering.
            </p>
          </div>

          {/* FastAPI main.py */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white font-mono">main.py (FastAPI App & Gemini 1.5 Pro Endpoints)</h4>
              </div>
              <button
                onClick={() => copyToClipboard(fastApiData?.fastApiCode || '', 'fastapi')}
                className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeKey === 'fastapi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodeKey === 'fastapi' ? 'Copied' : 'Copy Python'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto leading-relaxed max-h-72">
              {fastApiData?.fastApiCode || 'Loading FastAPI code...'}
            </pre>
          </div>

          {/* Jinja2 Templates Viewer */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Jinja2 Web Templates</h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">templates/index.html, templates/plan.html, templates/admin.html</span>
            </div>

            {fastApiData?.jinjaTemplates && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(fastApiData.jinjaTemplates).map(([path, code]: [string, any]) => (
                  <div key={path} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{path}</span>
                      <button
                        onClick={() => copyToClipboard(code, path)}
                        className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        {copiedCodeKey === path ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="text-[10px] font-mono text-zinc-400 overflow-x-auto max-h-40 leading-relaxed">
                      {code.slice(0, 400)}...
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
