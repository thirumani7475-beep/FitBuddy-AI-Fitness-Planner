import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Clock, Zap, ShieldAlert, CalendarX } from 'lucide-react';
import { FitnessPlan, Language } from '../types/fitness';
import { translations } from '../utils/translations';

interface AdaptivePlanModalProps {
  currentPlan: FitnessPlan;
  language: Language;
  onClose: () => void;
  onPlanAdapted: (newPlan: FitnessPlan) => void;
}

export const AdaptivePlanModal: React.FC<AdaptivePlanModalProps> = ({
  currentPlan,
  language,
  onClose,
  onPlanAdapted,
}) => {
  const t = translations[language];
  const [selectedReason, setSelectedReason] = useState<string>('too-hard');
  const [customNotes, setCustomNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adaptationOptions = [
    {
      id: 'too-hard',
      title: t.adaptation.reasonTooHard,
      icon: ShieldAlert,
      desc: language === 'ta' ? 'செட்களை குறைத்து, எளிமையான மாற்றுப் பயிற்சிகளை வழங்கும்' : 'Lowers volume, increases rest, and introduces joint-friendly regressions.',
    },
    {
      id: 'too-easy',
      title: t.adaptation.reasonTooEasy,
      icon: Zap,
      desc: language === 'ta' ? 'பயிற்சியின் தீவிரத்தை உயர்த்தி சவாலாக்கும்' : 'Increases progressive overload, rep targets, and intensity density.',
    },
    {
      id: 'time-constraint',
      title: t.adaptation.reasonTimeConstraint,
      icon: Clock,
      desc: language === 'ta' ? '15 முதல் 20 நிமிட விரைவு சுழற்சி பயிற்சியாக மாற்றும்' : 'Compresses routine into efficient 15-25 minute superset sessions.',
    },
    {
      id: 'joint-pain',
      title: t.adaptation.reasonPain,
      icon: AlertCircle,
      desc: language === 'ta' ? 'மூட்டு மற்றும் தசை அழுத்தத்தை முற்றிலும் தவிர்க்கும்' : 'Filters out high-impact movements and replaces with mobility & decompression.',
    },
    {
      id: 'missed-days',
      title: t.adaptation.reasonMissedDays,
      icon: CalendarX,
      desc: language === 'ta' ? 'விடுபட்ட தசைகளை மீதமுள்ள நாட்களில் சமன்படுத்தும்' : 'Recalibrates schedule so you don’t lose momentum without overtraining.',
    },
  ];

  const handleApplyAdaptation = async () => {
    setIsLoading(true);
    setError(null);

    const chosenOption = adaptationOptions.find((o) => o.id === selectedReason);
    const reasonText = chosenOption ? chosenOption.title : selectedReason;

    try {
      const res = await fetch('/api/plan/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPlan,
          reason: reasonText,
          customNotes: customNotes.trim(),
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to adapt plan.');
      }

      onPlanAdapted(data.plan);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error communicating with Gemini AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 my-auto">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t.adaptation.title}</h3>
              <p className="text-xs text-zinc-400">
                {language === 'ta' ? 'ஜெமினி உங்கள் தேவைகளுக்கு ஏற்ப திட்டத்தை மேம்படுத்துகிறது' : 'Gemini will recalibrate your weekly schedule based on feedback'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <label className="text-xs font-semibold text-zinc-300 block">
            {t.adaptation.reasonPrompt}
          </label>

          <div className="space-y-2">
            {adaptationOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedReason === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedReason(opt.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-sm'
                      : 'border-zinc-800/90 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-1.5 rounded-lg mt-0.5 ${
                        isSelected ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-zinc-100">{opt.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-zinc-400 block">
              {t.adaptation.customNotes}
            </label>
            <textarea
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={2}
              placeholder={
                language === 'ta'
                  ? 'எ.கா: தோள்பட்டை லேசான வலி உள்ளது, 20 நிமிடத்திற்குள் முடிக்க வேண்டும்...'
                  : 'e.g., Left shoulder feeling strained, need lower body emphasis instead...'
              }
              className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-400 hover:text-zinc-200"
          >
            {language === 'ta' ? 'ரத்து செய்க' : 'Cancel'}
          </button>
          <button
            onClick={handleApplyAdaptation}
            disabled={isLoading}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 hover:from-emerald-400 hover:to-lime-300 text-zinc-950 flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>{t.generator.adapting}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.adaptation.submit}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
