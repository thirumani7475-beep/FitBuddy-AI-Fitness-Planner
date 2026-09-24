import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Calculator, 
  Bookmark, 
  CheckCircle2, 
  Flame, 
  Globe2, 
  Play, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { WorkoutScheduleView } from './components/WorkoutScheduleView';
import { PlanGenerator } from './components/PlanGenerator';
import { WorkoutPlayerModal } from './components/WorkoutPlayerModal';
import { AdaptivePlanModal } from './components/AdaptivePlanModal';
import { AICoachChat } from './components/AICoachChat';
import { ProgressDashboard } from './components/ProgressDashboard';
import { BMICalculator } from './components/BMICalculator';
import { ExerciseVault } from './components/ExerciseVault';
import { NutritionPlanner } from './components/NutritionPlanner';
import { AdminComparisonDashboard } from './components/AdminComparisonDashboard';
import { AuthModal } from './components/AuthModal';
import { SavedPlansModal } from './components/SavedPlansModal';
import { 
  FitnessPlan, 
  UserProfile, 
  WorkoutLog, 
  Exercise, 
  Language, 
  WorkoutDay 
} from './types/fitness';

import { initialFitnessPlan } from './utils/initialPlan';
import { translations } from './utils/translations';
import { playChime } from './utils/audio';

export default function App() {
  // Persistent language
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('fitbuddy_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_lang', language);
  }, [language]);

  const t = translations[language];

  // Active Tab - default to user-friendly Home Page
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('fitbuddy_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Athlete',
      age: 28,
      gender: 'prefer-not-to-say',
      fitnessGoal: 'general-fitness',
      experienceLevel: 'beginner',
      activityLevel: 'moderately-active',
      workoutDaysPerWeek: 4,
      sessionDurationMinutes: 35,
      location: 'home',
      availableEquipment: ['Bodyweight only', 'Dumbbells', 'Yoga Mat'],
      injuriesAndLimitations: ['none'],
      additionalNotes: '',
      language: 'en',
    };
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Current Fitness Plan
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan>(() => {
    const saved = localStorage.getItem('fitbuddy_plan');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialFitnessPlan;
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_plan', JSON.stringify(currentPlan));
  }, [currentPlan]);

  // Completed Workout Logs
  const [logs, setLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem('fitbuddy_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Seed initial logs to provide visual gratification
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return [
      {
        id: 'seed-log-1',
        date: twoDaysAgo.toISOString().split('T')[0],
        dayTitle: 'Day 1: Upper Body Push & Core Stability',
        durationMinutes: 34,
        exercisesCompleted: 4,
        totalExercises: 4,
        rpeRating: 7,
        notes: 'Great pump on incline push-ups, felt energetic!',
        mood: 'energized',
      },
      {
        id: 'seed-log-2',
        date: yesterday.toISOString().split('T')[0],
        dayTitle: 'Day 2: Lower Body Power & Knee Resilience',
        durationMinutes: 36,
        exercisesCompleted: 4,
        totalExercises: 4,
        rpeRating: 8,
        notes: 'Goblet squats felt clean and controlled.',
        mood: 'good',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_logs', JSON.stringify(logs));
  }, [logs]);

  // Workout Streak calculation
  const streak = React.useMemo(() => {
    if (!logs.length) return 0;
    // Calculate consecutive dates from latest backwards
    const sorted = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const logDate = new Date(sorted[i].date);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - logDate.getTime()) / (1000 * 3600 * 24));
      
      // If completed today or yesterday, streak continues
      if (diffDays <= currentStreak + 1) {
        currentStreak++;
      } else {
        break;
      }
    }
    return Math.max(currentStreak, 2); // Minimum streak baseline
  }, [logs]);

  // Favorite Exercises Vault
  const [favorites, setFavorites] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('fitbuddy_favs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      initialFitnessPlan.days[0].exercises[0],
      initialFitnessPlan.days[1].exercises[0],
    ];
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_favs', JSON.stringify(favorites));
  }, [favorites]);

  // Saved Plans Library
  const [savedPlans, setSavedPlans] = useState<FitnessPlan[]>(() => {
    const saved = localStorage.getItem('fitbuddy_saved_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [currentPlan];
  });

  useEffect(() => {
    localStorage.setItem('fitbuddy_saved_plans', JSON.stringify(savedPlans));
  }, [savedPlans]);

  const handleSaveCurrentPlan = (title: string) => {
    const newSaved: FitnessPlan = {
      ...currentPlan,
      id: 'saved-plan-' + Date.now(),
      title,
    };
    setSavedPlans((prev) => [newSaved, ...prev.filter((p) => p.title !== title)]);
    setCurrentPlan(newSaved);
  };

  const handleDeleteSavedPlan = (planId: string) => {
    setSavedPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const handleSelectPlan = (plan: FitnessPlan) => {
    setCurrentPlan(plan);
    setSelectedDayIndex(1);
    setActiveTab('plan');
  };

  const handleUpdateUser = (updated: Partial<UserProfile> & { isLoggedIn: boolean; email?: string }) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
  };

  const toggleFavorite = (exercise: Exercise) => {
    setFavorites((prev) => {
      const exists = prev.some((e) => e.id === exercise.id);
      if (exists) {
        return prev.filter((e) => e.id !== exercise.id);
      } else {
        playChime('tick');
        return [...prev, exercise];
      }
    });
  };

  const isFavorite = (id: string) => favorites.some((e) => e.id === id);

  // Modals
  const [activePlayerDay, setActivePlayerDay] = useState<WorkoutDay | null>(null);
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedPlansModalOpen, setIsSavedPlansModalOpen] = useState(false);
  const [showCelebrationToast, setShowCelebrationToast] = useState(false);

  const handleFinishWorkout = (log: WorkoutLog) => {
    setLogs((prev) => [...prev, log]);
    setActivePlayerDay(null);
    setShowCelebrationToast(true);
    playChime('success');
    setTimeout(() => setShowCelebrationToast(false), 5000);
  };

  const handlePlanCreated = (newPlan: FitnessPlan) => {
    setCurrentPlan(newPlan);
    setSavedPlans((prev) => [newPlan, ...prev]);
    setSelectedDayIndex(1);
    setActiveTab('plan');
    playChime('success');
  };

  const activeDayForTodayTab = currentPlan.days.find((d) => d.dayIndex === selectedDayIndex) || currentPlan.days[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        streak={streak}
        onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
        onOpenSavedPlans={() => setIsSavedPlansModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Celebration Toast */}
        {showCelebrationToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-zinc-900 border border-emerald-500/50 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {language === 'ta' ? 'அமர்வு வெற்றிகரமாக பதிவு செய்யப்பட்டது!' : 'Workout Milestone Recorded!'}
              </h4>
              <p className="text-xs text-zinc-400">
                {language === 'ta' ? `உங்கள் தொடர் ${streak} நாட்களாக நீடிக்கிறது.` : `Your streak is active at ${streak} days.`}
              </p>
            </div>
          </div>
        )}

        {/* Tab 0: Home Page with Brand Intro, Visuals & Safety Banner */}
        {activeTab === 'home' && (
          <HomePage
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            userProfile={userProfile}
            currentPlan={currentPlan}
            streak={streak}
            language={language}
          />
        )}

        {/* Tab 1: Full Fitness Plan View */}
        {activeTab === 'plan' && (
          <WorkoutScheduleView
            plan={currentPlan}
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            language={language}
            onStartWorkout={(day) => setActivePlayerDay(day)}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
            onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
          />
        )}

        {/* Tab 2: Today's Workout Focus */}
        {activeTab === 'today' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                  {activeDayForTodayTab.dayName}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  {activeDayForTodayTab.focus}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  {activeDayForTodayTab.isRestDay
                    ? t.today.restDayDesc
                    : `Est. ${activeDayForTodayTab.estimatedMinutes} minutes · ${activeDayForTodayTab.exercises?.length} movements targeted`}
                </p>
              </div>

              {!activeDayForTodayTab.isRestDay && (
                <button
                  onClick={() => setActivePlayerDay(activeDayForTodayTab)}
                  className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-zinc-950" />
                  <span>{t.today.startWorkout}</span>
                </button>
              )}
            </div>

            {/* Render details of active day */}
            <WorkoutScheduleView
              plan={currentPlan}
              selectedDayIndex={selectedDayIndex}
              setSelectedDayIndex={setSelectedDayIndex}
              language={language}
              onStartWorkout={(day) => setActivePlayerDay(day)}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              onOpenAdaptModal={() => setIsAdaptModalOpen(true)}
            />
          </div>
        )}

        {/* Tab 3: Personalized Nutrition & Recovery Tips */}
        {activeTab === 'nutrition' && (
          <NutritionPlanner
            userProfile={userProfile}
            language={language}
          />
        )}

        {/* Tab 4: Admin Dashboard & Side-by-Side Diff Comparison */}
        {activeTab === 'admin' && (
          <AdminComparisonDashboard
            currentPlan={currentPlan}
            onApplyPlanToUser={(newPlan) => {
              setCurrentPlan(newPlan);
              setSelectedDayIndex(1);
            }}
            language={language}
          />
        )}


        {/* Tab 3: AI Generator & Natural Language */}
        {activeTab === 'generate' && (
          <PlanGenerator
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onPlanCreated={handlePlanCreated}
            language={language}
          />
        )}

        {/* Tab 4: AI Fitness Coach Chatbot */}
        {activeTab === 'chat' && (
          <AICoachChat
            currentPlan={currentPlan}
            userProfile={userProfile}
            streak={streak}
            language={language}
          />
        )}

        {/* Tab 5: Progress & Logs */}
        {activeTab === 'progress' && (
          <ProgressDashboard
            logs={logs}
            streak={streak}
            language={language}
            currentPlan={currentPlan}
          />
        )}

        {/* Tab 6: BMI & Health Calculator */}
        {activeTab === 'calculator' && (
          <BMICalculator language={language} />
        )}

        {/* Tab 7: Exercise Vault (Favorites) */}
        {activeTab === 'vault' && (
          <ExerciseVault
            favorites={favorites}
            onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((e) => e.id !== id))}
            language={language}
          />
        )}
      </main>

      {/* Interactive Workout Player Modal */}
      {activePlayerDay && (
        <WorkoutPlayerModal
          day={activePlayerDay}
          language={language}
          onClose={() => setActivePlayerDay(null)}
          onFinishWorkout={handleFinishWorkout}
        />
      )}

      {/* Adaptive Plan Recalibration Modal */}
      {isAdaptModalOpen && (
        <AdaptivePlanModal
          currentPlan={currentPlan}
          language={language}
          onClose={() => setIsAdaptModalOpen(false)}
          onPlanAdapted={(adaptedPlan) => {
            setCurrentPlan(adaptedPlan);
            playChime('success');
          }}
        />
      )}

      {/* User Registration & Login Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userProfile={userProfile}
        onUpdateUser={handleUpdateUser}
        language={language}
      />

      {/* Saved Fitness Plans Manager Modal */}
      <SavedPlansModal
        isOpen={isSavedPlansModalOpen}
        onClose={() => setIsSavedPlansModalOpen(false)}
        currentPlan={currentPlan}
        savedPlans={savedPlans}
        onSaveCurrentPlan={handleSaveCurrentPlan}
        onSelectPlan={handleSelectPlan}
        onDeleteSavedPlan={handleDeleteSavedPlan}
        language={language}
      />

      {/* Footer & Health Disclaimer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-zinc-200">FitBuddy</span>
              <span className="text-zinc-700">·</span>
              <span>AI Fitness Plan Generator Using Gemini Models</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
              <span>Gemini 3.8 Architecture</span>
              <span className="text-zinc-700">·</span>
              <span>English & தமிழ்</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              {language === 'ta'
                ? 'மருத்துவ மறுப்புரை: FitBuddy வழங்கும் அனைத்து உடற்பயிற்சி மற்றும் ஊட்டச்சத்து தகவல்களும் கல்வி மற்றும் பொது வழிகாட்டுதலுக்கு மட்டுமே. புதிய உடற்பயிற்சியைத் தொடங்குவதற்கு முன் மருத்துவ நிபுணரை அணுகவும்.'
                : 'Medical & Fitness Disclaimer: FitBuddy provides AI-generated workout routines and lifestyle guidance for general informational purposes only. It is not a substitute for clinical medical evaluation, diagnosis, or customized physical therapy. Always consult a physician prior to starting any physical regimen.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
