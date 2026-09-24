import React from 'react';
import { 
  Home,
  Dumbbell, 
  Calendar, 
  Sparkles, 
  MessageSquare, 
  BarChart3, 
  Calculator, 
  Bookmark, 
  Flame, 
  Globe2,
  Utensils,
  Layers,
  User
} from 'lucide-react';
import { Language, UserProfile } from '../types/fitness';
import { translations } from '../utils/translations';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  streak: number;
  onOpenAdaptModal: () => void;
  onOpenSavedPlans: () => void;
  onOpenAuth: () => void;
  userProfile: UserProfile;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  streak,
  onOpenAdaptModal,
  onOpenSavedPlans,
  onOpenAuth,
  userProfile,
}) => {
  const t = translations[language];

  const navItems = [
    { id: 'home', label: language === 'ta' ? 'முகப்பு' : 'Home', icon: Home },
    { id: 'plan', label: t.nav.plan, icon: Calendar },
    { id: 'today', label: t.nav.today, icon: Dumbbell },
    { id: 'nutrition', label: language === 'ta' ? 'ஊட்டச்சத்து' : 'Nutrition & Recovery', icon: Utensils },
    { id: 'admin', label: language === 'ta' ? 'நிர்வாகி ஒப்பீடு' : 'Admin & Diff', icon: Layers },
    { id: 'generate', label: language === 'ta' ? 'திட்டம் உருவாக்கு' : 'AI Generator', icon: Sparkles },
    { id: 'chat', label: t.nav.chat, icon: MessageSquare },
    { id: 'progress', label: t.nav.progress, icon: BarChart3 },
    { id: 'calculator', label: t.nav.calculator, icon: Calculator },
    { id: 'vault', label: t.nav.favorites, icon: Bookmark },
  ];


  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setActiveTab('home')}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  Fit<span className="text-emerald-400">Buddy</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400/90 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Gemini Models
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                {language === 'ta' ? 'செயற்கை நுண்ணறிவு உடற்பயிற்சி வழிகாட்டி' : 'Intelligent Fitness Architect'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 cursor-pointer hover:border-amber-500/40 transition-colors"
              onClick={() => setActiveTab('progress')}
              title={language === 'ta' ? `${streak} நாட்கள் தொடர் உடற்பயிற்சி!` : `${streak} day workout streak!`}
            >
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-zinc-500'}`} />
              <span className="text-xs font-mono font-bold text-amber-300">{streak}d</span>
            </div>

            {/* Saved Plans Library Button */}
            <button
              onClick={onOpenSavedPlans}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              title="Saved Plans Library"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">{language === 'ta' ? 'சேமிக்கப்பட்டவை' : 'Saved Plans'}</span>
            </button>

            {/* User Account / Profile Button */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:border-emerald-500/40 transition-colors"
              title="User Profile & Login"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
              </div>
              <span className="hidden md:inline max-w-[90px] truncate">{userProfile.name || 'Sign In'}</span>
            </button>

            {/* Quick Adapt Plan Button */}
            <button
              onClick={onOpenAdaptModal}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'ta' ? 'திட்டம் மாற்று' : 'Adapt'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
              title="Switch language / மொழி மாற்றம்"
            >
              <Globe2 className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium">{t.languageToggle}</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-zinc-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
