import React, { useState } from 'react';
import { X, Bookmark, Save, Trash2, Check, Download, Calendar, ArrowRight, Dumbbell, Sparkles } from 'lucide-react';
import { FitnessPlan, Language } from '../types/fitness';
import { playChime } from '../utils/audio';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: FitnessPlan;
  savedPlans: FitnessPlan[];
  onSaveCurrentPlan: (title: string) => void;
  onSelectPlan: (plan: FitnessPlan) => void;
  onDeleteSavedPlan: (planId: string) => void;
  language: Language;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  savedPlans,
  onSaveCurrentPlan,
  onSelectPlan,
  onDeleteSavedPlan,
  language,
}) => {
  const isTamil = language === 'ta';
  const [newPlanName, setNewPlanName] = useState(currentPlan.title || '');
  const [successNote, setSuccessNote] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;
    onSaveCurrentPlan(newPlanName.trim());
    playChime('success');
    setSuccessNote(
      isTamil
        ? 'திட்டம் வெற்றிகரமாக சேமிக்கப்பட்டது!'
        : 'Workout plan saved to your library!'
    );
    setTimeout(() => setSuccessNote(null), 3000);
  };

  const handleExportJson = (plan: FitnessPlan) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.title.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                {isTamil ? 'சேமிக்கப்பட்ட உடற்பயிற்சி திட்டங்கள்' : 'Saved Fitness Plans Library'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isTamil ? 'திட்டங்களை சேமிக்கவும், ஒப்பிடவும் மற்றும் மாற்றவும்' : 'Manage, export, and switch between your AI workout plans'}
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

        {/* Save Current Plan Form */}
        <form onSubmit={handleSave} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
          <span className="text-xs font-bold text-zinc-300 block">
            {isTamil ? 'நடப்பு திட்டத்தை புதிய பெயரில் சேமிக்கவும்' : 'Save Active Plan to Your Collection'}
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="e.g. My 4-Week Hypertrophy Split"
              className="flex-1 text-xs p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isTamil ? 'சேமி' : 'Save Plan'}</span>
            </button>
          </div>
        </form>

        {successNote && (
          <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successNote}</span>
          </div>
        )}

        {/* Saved Plans List */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
            {isTamil ? `சேமிக்கப்பட்ட திட்டங்கள் (${savedPlans.length})` : `Saved Collection (${savedPlans.length})`}
          </span>

          <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
            {savedPlans.map((plan) => {
              const isCurrent = plan.id === currentPlan.id;
              return (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{plan.title}</h4>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30 font-bold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {plan.targetGoal} · {plan.days?.length} days · {plan.experienceLevel}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleExportJson(plan)}
                      title="Export Plan JSON"
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {!isCurrent && (
                      <button
                        onClick={() => {
                          onSelectPlan(plan);
                          playChime('success');
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-colors"
                      >
                        {isTamil ? 'செயல்படுத்து' : 'Load Plan'}
                      </button>
                    )}

                    {savedPlans.length > 1 && (
                      <button
                        onClick={() => onDeleteSavedPlan(plan.id)}
                        title="Delete Plan"
                        className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
