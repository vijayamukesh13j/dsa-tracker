import React, { useState } from 'react';
import { X, Check, Clock, Sparkles } from 'lucide-react';
import {
  type ConfidenceLevel,
  CONFIDENCE_CONFIG,
  type Problem,
} from '../types/problem';
import { calculateNextRevisionDate, getTodayISO } from '../utils/spacedRepetition';

interface QuickRevisionModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  onLogRevision: (
    id: string,
    newConfidence: ConfidenceLevel,
    solveTimeMinutes?: number,
    revisionNote?: string
  ) => void;
}

export const QuickRevisionModal: React.FC<QuickRevisionModalProps> = ({
  problem,
  isOpen,
  onClose,
  onLogRevision,
}) => {
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel>(
    problem?.confidence || 3
  );
  const [solveTime, setSolveTime] = useState<string>(
    problem?.solveTimeMinutes ? String(problem.solveTimeMinutes) : ''
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen || !problem) return null;

  const today = getTodayISO();
  const nextDatePreview = calculateNextRevisionDate(selectedConfidence, today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeNum = solveTime ? parseInt(solveTime, 10) : undefined;
    onLogRevision(
      problem.id,
      selectedConfidence,
      isNaN(timeNum!) ? undefined : timeNum,
      notes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-slate-200 dark:border-zinc-800 shadow-2xl p-5 sm:p-6 max-h-[92dvh] overflow-y-auto text-slate-900 dark:text-zinc-100 relative animate-float-up">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-100 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            Log Spaced Revision
          </span>
        </div>

        <h3 className="text-lg font-extrabold text-slate-900 dark:text-zinc-100 mb-1 line-clamp-1">
          {problem.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
          Current revision count:{' '}
          <strong className="text-slate-800 dark:text-zinc-200 font-mono">
            {problem.revisionCount}
          </strong>
          . Rate your recall today to schedule the next interval.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Confidence Selector 1 to 5 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-2">
              How did you solve it this time?
            </label>
            <div className="space-y-2">
              {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => {
                const conf = CONFIDENCE_CONFIG[level];
                const isSelected = selectedConfidence === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setSelectedConfidence(level)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${conf.bg} ${conf.border} ring-2 ring-emerald-500/40`
                        : 'bg-slate-50/70 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm ${conf.badgeBg} ${conf.badgeText}`}
                      >
                        {level}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">
                          {conf.label}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {conf.description}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                        +{conf.intervalDays}d
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next Revision Date Preview */}
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80 text-xs flex items-center justify-between">
            <span className="text-slate-600 dark:text-zinc-400 font-medium">
              Next scheduled revision:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {nextDatePreview} (+{CONFIDENCE_CONFIG[selectedConfidence].intervalDays}d)
            </span>
          </div>

          {/* Optional Solve Time & Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Solve Time (mins)
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                <input
                  type="number"
                  min="1"
                  max="300"
                  placeholder="e.g. 15"
                  value={solveTime}
                  onChange={(e) => setSolveTime(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                Quick Revision Note
              </label>
              <input
                type="text"
                placeholder="e.g. Smooth two pointer"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 text-xs font-bold transition shadow-sm"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Confirm & Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
