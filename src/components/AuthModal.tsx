import React, { useState } from 'react';
import { X, User, Lock, Mail, CheckCircle2, Dumbbell, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile, Language } from '../types/fitness';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile> & { isLoggedIn: boolean; email?: string }) => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateUser,
  language,
}) => {
  const isTamil = language === 'ta';
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState(userProfile.name || '');
  const [email, setEmail] = useState((userProfile as any).email || '');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState(userProfile.fitnessGoal);
  const [age, setAge] = useState(userProfile.age || 26);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setName('Athlete');
    }
    onUpdateUser({
      name: name.trim() || 'Athlete',
      age: Number(age) || 26,
      fitnessGoal: goal,
      isLoggedIn: true,
      email: email.trim() || `${(name || 'user').toLowerCase().replace(/\s+/g, '')}@fitbuddy.ai`,
    });
    setMessage(
      isTamil
        ? 'வெற்றிகரமாக உள்நுழைந்தீர்கள்!'
        : mode === 'register'
        ? 'Account registered successfully! Welcome to FitBuddy.'
        : 'Logged in successfully! Welcome back.'
    );
    setTimeout(() => {
      setMessage(null);
      onClose();
    }, 900);
  };

  const handleGuestLogin = () => {
    onUpdateUser({
      name: 'Guest Athlete',
      isLoggedIn: true,
      email: 'guest@fitbuddy.ai',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <Dumbbell className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isTamil ? 'FitBuddy கணக்கு' : 'FitBuddy User Portal'}
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === 'register'
                  ? (isTamil ? 'புதிய உறுப்பினர் பதிவு' : 'Create your athlete account')
                  : (isTamil ? 'உங்கள் கணக்கில் உள்நுழையவும்' : 'Sign in to access your saved plans')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'register' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isTamil ? 'புதிய பதிவு (Sign Up)' : 'Create Account'}
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
              mode === 'login' ? 'bg-zinc-800 text-emerald-400 font-bold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isTamil ? 'உள்நுழைவு (Sign In)' : 'Sign In'}
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Name (for register) */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              {isTamil ? 'முழு பெயர்' : 'Full Name'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTamil ? 'எ.கா: விஜய் / பிரியா' : 'e.g., Alex Johnson'}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              {isTamil ? 'மின்னஞ்சல்' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              {isTamil ? 'கடவுச்சொல்' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Additional details on Register */}
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  {isTamil ? 'வயது' : 'Age'}
                </label>
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 25)}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  {isTamil ? 'முக்கிய இலக்கு' : 'Primary Goal'}
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white"
                >
                  <option value="general-fitness">General Fitness</option>
                  <option value="fat-loss">Fat Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility / Yoga</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mt-2"
          >
            {mode === 'register'
              ? (isTamil ? 'கணக்கை உருவாக்கி தொடங்கு' : 'Create Account & Access Plans')
              : (isTamil ? 'உள்நுழைக' : 'Sign In to FitBuddy')}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
            {isTamil ? 'அல்லது' : 'or'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
        >
          {isTamil ? 'விருந்தினராக தொடரவும் (Guest Mode)' : 'Continue as Guest Athlete'}
        </button>

        <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
          {isTamil
            ? 'தங்கள் தரவுகள் உலாவி உள்ளமைவில் பாதுகாப்பாக சேமிக்கப்படுகின்றன.'
            : 'Your preferences and workout history are stored securely in your browser session.'}
        </p>
      </div>
    </div>
  );
};
