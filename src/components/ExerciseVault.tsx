import React, { useState } from 'react';
import { Bookmark, Search, Trash2, CheckCircle2, AlertCircle, Dumbbell } from 'lucide-react';
import { Exercise, Language } from '../types/fitness';
import { translations } from '../utils/translations';

interface ExerciseVaultProps {
  favorites: Exercise[];
  onRemoveFavorite: (id: string) => void;
  language: Language;
}

export const ExerciseVault: React.FC<ExerciseVaultProps> = ({
  favorites,
  onRemoveFavorite,
  language,
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');

  const muscles = ['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Core', 'Triceps', 'Biceps'];

  const filteredExercises = favorites.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.nameTamil && ex.nameTamil.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.targetMuscleGroup.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMuscle =
      selectedMuscle === 'all' ||
      ex.targetMuscleGroup.toLowerCase().includes(selectedMuscle.toLowerCase());

    return matchesSearch && matchesMuscle;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Bookmark className="w-5 h-5 fill-emerald-400/20" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">
              {language === 'ta' ? 'சேமிக்கப்பட்ட பயிற்சிகள்' : 'Personal Movement Vault'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">{t.vault.title}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{t.vault.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={language === 'ta' ? 'பயிற்சியைத் தேடு...' : 'Search exercises...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {muscles.map((muscle) => (
          <button
            key={muscle}
            onClick={() => setSelectedMuscle(muscle)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
              selectedMuscle === muscle
                ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60'
            }`}
          >
            {muscle === 'all' ? (language === 'ta' ? 'அனைத்தும்' : 'All Muscle Groups') : muscle}
          </button>
        ))}
      </div>

      {/* Exercise Cards */}
      {filteredExercises.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-800">
          <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">{t.vault.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block">
                    {ex.targetMuscleGroup}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {ex.name}
                  </h3>
                  {ex.nameTamil && (
                    <span className="text-xs text-zinc-400 block mt-0.5">{ex.nameTamil}</span>
                  )}
                </div>

                <button
                  onClick={() => onRemoveFavorite(ex.id)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                  title={t.vault.remove}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Prescription specs */}
              <div className="flex items-center gap-3 text-xs text-zinc-400 py-1 border-y border-zinc-800/60">
                <span>{ex.sets} Sets</span>
                <span className="text-zinc-700">·</span>
                <span>{ex.repsOrDuration}</span>
                <span className="text-zinc-700">·</span>
                <span>{ex.restSeconds}s Rest</span>
                <span className="text-zinc-700">·</span>
                <span className="capitalize">{ex.difficulty}</span>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5 text-xs text-zinc-300">
                <span className="font-semibold text-zinc-200 block text-[11px] uppercase tracking-wider">
                  Technique
                </span>
                <ul className="space-y-1">
                  {ex.instructions?.slice(0, 3).map((inst, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-400">
                      <span className="text-emerald-400">✓</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Modification */}
              {ex.modification && (
                <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400">
                  <span className="font-bold text-amber-400 block mb-0.5">Safe Variation:</span>
                  <span>{ex.modification}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
