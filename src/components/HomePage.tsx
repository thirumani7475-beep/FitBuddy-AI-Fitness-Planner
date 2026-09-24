import React from 'react';
import { 
  Dumbbell, 
  Sparkles, 
  Calendar, 
  HeartPulse, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  Utensils, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Award,
  AlertTriangle,
  Layers,
  User,
  RotateCcw
} from 'lucide-react';
import { Language, UserProfile, FitnessPlan } from '../types/fitness';
import { translations } from '../utils/translations';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  userProfile: UserProfile;
  currentPlan: FitnessPlan;
  streak: number;
  language: Language;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenAuth,
  userProfile,
  currentPlan,
  streak,
  language,
}) => {
  const isTamil = language === 'ta';
  const t = translations[language];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-8">
      {/* Hero Section with Athletic Imagery */}
      <section className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden">
          <img
            src="/src/assets/images/fitbuddy_hero_banner_1790240187817.jpg"
            alt="FitBuddy Modern Training Facility"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-55 hover:scale-102 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent via-zinc-950/40 to-zinc-950" />
        </div>

        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-3xl">
          {/* Logo Badge & Gemini pill */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/30">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Fit<span className="text-emerald-400">Buddy</span>
              </span>
              <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Gemini Models
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {isTamil ? (
              <>
                உங்கள் இலக்கிற்கு ஏற்ப <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-200">
                  AI உடற்பயிற்சி & ஊட்டச்சத்து திட்டம்
                </span>
              </>
            ) : (
              <>
                Intelligent Fitness Architecture <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-lime-400 to-emerald-200">
                  Powered by Google Gemini
                </span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 mt-3 leading-relaxed max-w-2xl">
            {isTamil
              ? 'உங்கள் வயது, உடற்பயிற்சி இலக்கு, இருப்பு நேரம், கருவிகள் மற்றும் தீவிரத்தின் அடிப்படையில் அறிவியல் பூர்வமாக உருவாக்கப்பட்ட 7 நாள் உடற்பயிற்சி மற்றும் ஊட்டச்சத்து வழிகாட்டி.'
              : 'FitBuddy designs personalized 7-day workout plans with structured warm-ups, sets, reps, rest intervals, and precision nutrition calibrated to your schedule, equipment, and physiological level.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('generate')}
              className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-500 via-emerald-400 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 shadow-xl shadow-emerald-500/25 flex items-center gap-2 active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
              <span>{isTamil ? 'புதிய திட்டம் உருவாக்குக' : 'Generate Custom Plan with Gemini'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('plan')}
              className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-zinc-900/90 hover:bg-zinc-800 text-white border border-zinc-700/80 flex items-center gap-2 backdrop-blur-md transition-colors"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>{isTamil ? 'நடப்பு திட்டத்தைக் காண்க' : 'View Weekly Schedule'}</span>
            </button>

            {/* Quick Auth Trigger */}
            <button
              onClick={onOpenAuth}
              className="px-4 py-3.5 rounded-xl font-semibold text-xs text-zinc-300 hover:text-white bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 flex items-center gap-1.5 transition-colors"
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>
                {userProfile.name ? `${userProfile.name} (Account)` : (isTamil ? 'உள்நுழைக' : 'Sign In')}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Prominent Medical & Safety Disclaimer Card (Item 10) */}
      <section className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-300 text-sm">
              {isTamil ? 'முக்கிய பாதுகாப்பு மற்றும் மருத்துவ அறிவிப்பு' : 'Essential Health & Medical Safety Disclaimer'}
            </h4>
            <p className="text-zinc-300 leading-relaxed">
              {isTamil
                ? 'FitBuddy மற்றும் Google Gemini மாதிரிகளால் உருவாக்கப்படும் அனைத்து உடற்பயிற்சி மற்றும் ஊட்டச்சத்து தகவல்களும் பொதுவான உடற்தகுதி வழிகாட்டுதலுக்கு மட்டுமே. இது மருத்துவ ஆலோசனை, நோய் கண்டறிதல் அல்லது தொழில்முறை உடற்பயிற்சி சிகிச்சைக்கு மாற்றாகாது. புதிய தீவிர உடற்பயிற்சியைத் தொடங்குவதற்கு முன் தகுதியான மருத்துவர் அல்லது சான்றளிக்கப்பட்ட உடற்பயிற்சி பயிற்சியாளரை அணுகவும்.'
                : 'All workout routines, nutrition frameworks, and exercise explanations generated by FitBuddy using Gemini AI models are provided for informational, educational, and general fitness purposes only. They do not constitute professional medical advice, clinical diagnosis, or physical therapy. Always consult a qualified physician or certified personal trainer before initiating any rigorous workout routine or nutritional modification, especially if you have pre-existing cardiovascular, musculoskeletal, or metabolic conditions.'}
            </p>
          </div>
        </div>
      </section>

      {/* 4 Core Pillar Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {isTamil ? 'FitBuddy முக்கிய அம்சங்கள்' : 'Core Intelligent Capabilities'}
            </h2>
            <p className="text-xs text-zinc-400">
              {isTamil ? 'உடற்தகுதி மற்றும் ஆரோக்கியத்திற்கான முழுமையான தீர்வு' : 'Precision engineering across movement, nutrition, and recovery'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Structured Weekly Workout */}
          <div 
            onClick={() => onNavigate('plan')}
            className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
              {isTamil ? '7-நாள் கட்டமைக்கப்பட்ட திட்டம்' : 'Structured Weekly Schedule'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isTamil
                ? 'ஒவ்வொரு நாளுக்கும் வார்ம்-அப், செட்கள், ரெப்ஸ், ஓய்வு நேரம் மற்றும் கூல்-டவுன் கொண்ட முழுமையான அட்டவணை.'
                : 'Clear day-by-day regimen detailing sets, target repetitions, rest intervals, equipment, and guided video instructions.'}
            </p>
            <span className="text-[11px] text-emerald-400 font-mono font-bold flex items-center gap-1 pt-1">
              <span>{isTamil ? 'திட்டம் காண்க' : 'Explore Routine'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Precision Nutrition & Recovery */}
          <div 
            onClick={() => onNavigate('nutrition')}
            className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 text-lime-400 border border-lime-500/30 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
              <Utensils className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-lime-400 transition-colors">
              {isTamil ? 'ஊட்டச்சத்து & மீட்பு வழிகாட்டி' : 'Nutrition & Healthy Lifestyle'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isTamil
                ? 'உங்கள் எடை மற்றும் தீவிரத்திற்கு ஏற்ப கலோரி, புரதம், பயிற்சிக்கு முன்/பின் உணவு மற்றும் தூக்க ஆலோசனைகள்.'
                : 'Calibrated daily calories, macronutrient targets, pre/post workout fuel timing, and deep sleep recovery protocols.'}
            </p>
            <span className="text-[11px] text-lime-400 font-mono font-bold flex items-center gap-1 pt-1">
              <span>{isTamil ? 'ஊட்டச்சத்து காண்க' : 'View Nutrition Plan'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Adaptive Feedback & Updates */}
          <div 
            onClick={() => onNavigate('admin')}
            className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-zinc-950 transition-colors">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
              {isTamil ? 'கருத்துக்கேற்ப திட்டம் புதுப்பிப்பு' : 'Dynamic Plan Updates & Diff'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isTamil
                ? 'கார்டியோ, யோகா அல்லது குறைந்த தீவிர மாற்றுப் பயிற்சிகளை கோரி திட்டத்தை உடனடியாக மாற்றியமைக்கலாம்.'
                : 'Submit requests to insert HIIT cardio, restorative yoga, or injury deloads with side-by-side visual diff comparison.'}
            </p>
            <span className="text-[11px] text-cyan-400 font-mono font-bold flex items-center gap-1 pt-1">
              <span>{isTamil ? 'ஒப்பீடு பலகை' : 'Admin & Diff Tool'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4: Progress Tracking & Streak */}
          <div 
            onClick={() => onNavigate('progress')}
            className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:-translate-y-1 space-y-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
              {isTamil ? 'தொடர் & முன்னேற்றக் கண்காணிப்பு' : 'Streak & Progress Tracker'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isTamil
                ? 'தினசரி தொடர் பயிற்சி எண்ணிக்கை, 14-நாள் அட்டவணை, RPE உழைப்பு மதிப்பீடு மற்றும் AI வாராந்திர சுருக்கம்.'
                : 'Track workout streaks, session duration, exertion RPE scores, and receive Gemini weekly performance grades.'}
            </p>
            <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1 pt-1">
              <span>{isTamil ? 'முன்னேற்றம் காண்க' : 'Open Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Active Athlete & Current Plan Quick Snapshot */}
      <section className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">
                {userProfile.name || 'Athlete'}
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                {userProfile.fitnessGoal}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 capitalize">
                {userProfile.workoutIntensity || 'medium'} intensity
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Active Plan: <span className="text-zinc-200 font-semibold">{currentPlan.title}</span> ({streak} Day Streak 🔥)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('today')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
          >
            {isTamil ? 'இன்றைய பயிற்சி தொடங்கு' : 'Start Today’s Workout'}
          </button>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
          >
            {isTamil ? 'சுயவிவரம் / மாற்று' : 'Manage Profile'}
          </button>
        </div>
      </section>

      {/* Complete Key Features Matrix (All 10 Features) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
              <Zap className="w-4 h-4" />
              <span>Full System Architecture</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isTamil ? 'FitBuddy முக்கிய அம்சங்கள் (Key Features)' : 'FitBuddy Key Features Matrix'}
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            10/10 Implemented & Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            {
              num: '01',
              title: 'AI Personalized Plans',
              desc: 'Gemini 1.5 Pro analyzes age, weight, goals, time, and equipment.',
              tab: 'generate',
              badge: 'Gemini 1.5 Pro',
            },
            {
              num: '02',
              title: '7-Day Customized Schedule',
              desc: 'Day-by-day warm-up, sets, reps, rest time, and cooldown recovery.',
              tab: 'plan',
              badge: 'Full Week Split',
            },
            {
              num: '03',
              title: 'Goal-Based Planning',
              desc: 'Weight Loss, Muscle Gain, General Wellness, Strength, and Mobility.',
              tab: 'generate',
              badge: 'Goal Tailored',
            },
            {
              num: '04',
              title: 'Workout Intensity Selection',
              desc: 'Low, Medium, and High intensity modes with calibrated RPE & rest.',
              tab: 'generate',
              badge: 'Low · Med · High',
            },
            {
              num: '05',
              title: 'AI Nutrition & Recovery Tips',
              desc: 'Gemini Flash computes macros, hydration, meal timing, and sleep guidance.',
              tab: 'nutrition',
              badge: 'Gemini Flash',
            },
            {
              num: '06',
              title: 'Feedback-Based Updates',
              desc: 'Add cardio or yoga, and AI recalibrates the plan with diff indicators.',
              tab: 'admin',
              badge: 'Cardio & Yoga Diff',
            },
            {
              num: '07',
              title: 'User Data & Plan Storage',
              desc: 'Persistent SQLite 3 database (fitbuddy.db) with SQLAlchemy ORM.',
              tab: 'admin',
              badge: 'SQLite Persistence',
            },
            {
              num: '08',
              title: 'Admin Dashboard for Users',
              desc: 'Manage client roster, compare original vs adapted plans, and deploy.',
              tab: 'admin',
              badge: 'Admin Roster',
            },
            {
              num: '09',
              title: 'Responsive & Accessible UI',
              desc: 'Dark theme, mobile navbar, exercise timers, and Tamil/English bilingual.',
              tab: 'today',
              badge: 'Bilingual & Mobile',
            },
            {
              num: '10',
              title: 'FastAPI & Jinja2 Stack',
              desc: 'FastAPI Python controllers, SQLAlchemy models, and Jinja2 templates.',
              tab: 'admin',
              badge: 'FastAPI + Jinja2',
            },
          ].map((feat) => (
            <div
              key={feat.num}
              onClick={() => onNavigate(feat.tab)}
              className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-emerald-500/50 hover:bg-zinc-900/60 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-emerald-400 font-extrabold">{feat.num}</span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-emerald-300">
                    {feat.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
                <span>Explore Feature</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
