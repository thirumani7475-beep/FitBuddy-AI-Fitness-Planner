import React, { useState } from 'react';
import { Calculator, AlertTriangle, Droplets, HeartPulse, Check, Info } from 'lucide-react';
import { Language } from '../types/fitness';
import { translations } from '../utils/translations';

interface BMICalculatorProps {
  language: Language;
}

export const BMICalculator: React.FC<BMICalculatorProps> = ({ language }) => {
  const t = translations[language];
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);

  // Compute BMI
  let currentBmi = 0;
  let effectiveWeightKg = weightKg;
  let effectiveHeightCm = heightCm;

  if (unit === 'metric') {
    if (heightCm > 0) {
      const heightM = heightCm / 100;
      currentBmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));
      effectiveWeightKg = weightKg;
      effectiveHeightCm = heightCm;
    }
  } else {
    const totalInches = heightFeet * 12 + heightInches;
    if (totalInches > 0) {
      currentBmi = parseFloat(((weightLbs / (totalInches * totalInches)) * 703).toFixed(1));
      effectiveWeightKg = weightLbs * 0.453592;
      effectiveHeightCm = totalInches * 2.54;
    }
  }

  // Categories
  let categoryKey: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  let categoryColor = 'text-emerald-400';
  let categoryBg = 'bg-emerald-500';

  if (currentBmi < 18.5) {
    categoryKey = 'underweight';
    categoryColor = 'text-sky-400';
    categoryBg = 'bg-sky-400';
  } else if (currentBmi <= 24.9) {
    categoryKey = 'normal';
    categoryColor = 'text-emerald-400';
    categoryBg = 'bg-emerald-400';
  } else if (currentBmi <= 29.9) {
    categoryKey = 'overweight';
    categoryColor = 'text-amber-400';
    categoryBg = 'bg-amber-400';
  } else {
    categoryKey = 'obese';
    categoryColor = 'text-rose-400';
    categoryBg = 'bg-rose-400';
  }

  // Healthy weight range for height (BMI 18.5 to 24.9)
  const heightM = effectiveHeightCm / 100;
  const minHealthyKg = Math.round(18.5 * heightM * heightM);
  const maxHealthyKg = Math.round(24.9 * heightM * heightM);

  // Daily water intake: ~35ml per kg body weight
  const waterLiters = (effectiveWeightKg * 0.035).toFixed(1);

  // AI recommendations based on BMI
  const getAiTakeaway = () => {
    if (language === 'ta') {
      if (categoryKey === 'underweight') {
        return 'சத்தான புரதச்சத்து நிறைந்த உணவுகள் மற்றும் தசை வலிமைக்கான உடற்பயிற்சிகளை முன்னுரிமைப்படுத்துங்கள்.';
      } else if (categoryKey === 'normal') {
        return 'சிறப்பான ஆரோக்கிய நிலை! இதைத் தொடர வாராந்திர கார்டியோ மற்றும் தசை பயிற்சிகளை சமநிலைப்படுத்துங்கள்.';
      } else if (categoryKey === 'overweight') {
        return 'மிதமான உணவு கட்டுப்பாடு மற்றும் தினசரி 30-40 நிமிட ஏரோபிக் உடற்பயிற்சி மூலம் கொழுப்பை ஆரோக்கியமாக குறைக்கலாம்.';
      } else {
        return 'மூட்டுகளுக்கு அழுத்தம் தராத நடைப்பயிற்சி, நீச்சல் அல்லது எளிய வீட்டு பயிற்சிகளுடன் படிப்படியாக தொடங்கவும்.';
      }
    } else {
      if (categoryKey === 'underweight') {
        return 'Focus on progressive resistance training to build lean skeletal muscle mass and consume a nutrient-dense caloric surplus with adequate dietary protein.';
      } else if (categoryKey === 'normal') {
        return 'Optimal physiological bracket. Maintain cardiovascular endurance and functional strength with a balanced 3-4 day weekly regimen.';
      } else if (categoryKey === 'overweight') {
        return 'Prioritize sustainable caloric deficit with regular resistance training to preserve lean mass while increasing daily non-exercise physical activity (NEAT).';
      } else {
        return 'Initiate with low-impact joint-friendly conditioning (brisk walking, stationary cycling) combined with gradual whole-body resistance training.';
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{t.calculator.title}</h2>
            <p className="text-xs text-zinc-400">
              {language === 'ta' ? 'உடல் நிறை குறியீடு, பரிந்துரைக்கப்படும் எடை வரம்பு மற்றும் குடிநீர் அளவு' : 'Anthropometric reference metrics, healthy range, and hydration baseline'}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <p>{t.calculator.disclaimer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Column */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-5">
          {/* Unit Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-300">Unit System</span>
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setUnit('metric')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  unit === 'metric' ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.calculator.unitMetric}
              </button>
              <button
                onClick={() => setUnit('imperial')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  unit === 'imperial' ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t.calculator.unitImperial}
              </button>
            </div>
          </div>

          {/* Metric Inputs */}
          {unit === 'metric' ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-zinc-300 font-medium">{t.calculator.weight}</label>
                  <span className="font-mono text-emerald-400 font-bold">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="30"
                  max="250"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-zinc-300 font-medium">{t.calculator.height}</label>
                  <span className="font-mono text-emerald-400 font-bold">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>
            </>
          ) : (
            <>
              {/* Imperial Inputs */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <label className="text-zinc-300 font-medium">{t.calculator.weight} (lbs)</label>
                  <span className="font-mono text-emerald-400 font-bold">{weightLbs} lbs</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="400"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-medium">Feet</label>
                  <input
                    type="number"
                    min="3"
                    max="7"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-medium">Inches</label>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightInches}
                    onChange={(e) => setHeightInches(parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main BMI Score Card */}
          <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3">
            <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
              {t.calculator.bmiScore}
            </span>
            <div className="text-5xl font-mono font-black text-white tracking-tight">
              {currentBmi}
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800">
              <span className={`w-2 h-2 rounded-full ${categoryBg}`} />
              <span className={`text-xs font-bold ${categoryColor}`}>
                {t.calculator[categoryKey]}
              </span>
            </div>

            {/* Visual Color Spectrum Bar */}
            <div className="pt-2">
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden flex">
                <div className="w-[18.5%] bg-sky-400" title="Underweight (< 18.5)" />
                <div className="w-[25%] bg-emerald-400" title="Normal (18.5 - 24.9)" />
                <div className="w-[20%] bg-amber-400" title="Overweight (25 - 29.9)" />
                <div className="w-[36.5%] bg-rose-400" title="Obese (30+)" />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
              </div>
            </div>
          </div>

          {/* Secondary Reference Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>Healthy Range</span>
              </div>
              <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">
                {unit === 'metric'
                  ? `${minHealthyKg} - ${maxHealthyKg} kg`
                  : `${Math.round(minHealthyKg * 2.20462)} - ${Math.round(maxHealthyKg * 2.20462)} lbs`}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Hydration Target</span>
              </div>
              <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">
                ~{waterLiters} L / day
              </p>
            </div>
          </div>

          {/* Gemini AI Guidance Takeaway */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Info className="w-4 h-4" />
              <span>{t.calculator.tips}</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{getAiTakeaway()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
