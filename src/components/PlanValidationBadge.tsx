import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PlanValidationResult } from '../types/fitness';

interface PlanValidationBadgeProps {
  validation: PlanValidationResult;
  language?: string;
}

export const PlanValidationBadge: React.FC<PlanValidationBadgeProps> = ({ validation, language = 'en' }) => {
  const [expanded, setExpanded] = useState(false);
  const isTamil = language === 'ta';

  const passedCount = validation.checks.filter((c) => c.passed).length;
  const totalCount = validation.checks.length;
  const isAllGood = validation.isValid;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg mt-0.5 ${
              isAllGood
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isAllGood ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-zinc-100">
                {isTamil ? 'AI பாதுகாப்பு மற்றும் உடலியல் சரிபார்ப்பு' : 'AI Safety & Physiological Validation'}
              </h4>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                {passedCount}/{totalCount} {isTamil ? 'சோதனைகள் தேர்ச்சி' : 'Verified'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {validation.summary}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="self-end sm:self-center flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 px-2.5 rounded-lg hover:bg-zinc-800"
        >
          <span>{expanded ? (isTamil ? 'மறைக்க' : 'Hide Checks') : (isTamil ? 'விவரங்கள் காண்க' : 'View Safety Rules')}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 space-y-2.5">
          {validation.checks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-2.5 text-xs text-zinc-300 p-2 rounded-lg bg-zinc-950/50 border border-zinc-800/50"
            >
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-zinc-200">{check.title}: </span>
                <span className="text-zinc-400">{check.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
