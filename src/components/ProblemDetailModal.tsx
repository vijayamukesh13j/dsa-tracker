import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
  Calendar,
  Lightbulb,
  AlertOctagon,
  Code2,
  Copy,
  Check,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  CONFIDENCE_CONFIG,
  Problem,
} from '../types/problem';
import { PLATFORM_CONFIG } from '../utils/urlParser';
import { getRelativeRevisionString } from '../utils/spacedRepetition';

interface ProblemDetailModalProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickRevision: (problem: Problem) => void;
  onOpenEditModal: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  isOpen,
  onClose,
  onOpenQuickRevision,
  onOpenEditModal,
  onDeleteProblem,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !problem) return null;

  const platformMeta = PLATFORM_CONFIG[problem.platform || 'other'];
  const confMeta = CONFIDENCE_CONFIG[problem.confidence];
  const relativeRev = getRelativeRevisionString(problem.nextRevisionDate);

  const handleCopyCode = () => {
    if (!problem.notes.codeSnippet) return;
    navigator.clipboard.writeText(problem.notes.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100 relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${platformMeta.bg} ${platformMeta.border} ${platformMeta.color}`}
            >
              {platformMeta.name}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                problem.difficulty === 'Easy'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                  : problem.difficulty === 'Medium'
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }`}
            >
              {problem.difficulty}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${relativeRev.color}`}
            >
              {relativeRev.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenEditModal(problem);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Edit Problem"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Delete "${problem.title}"?`)) {
                  onDeleteProblem(problem.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Delete Problem"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & External Link */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-100 flex items-center gap-2.5">
              <span>{problem.title}</span>
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-emerald-400 transition"
                  title="Open problem link in new tab"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </h2>

            {/* Pattern Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {problem.patterns.map((pat) => (
                <span
                  key={pat}
                  className="px-2.5 py-1 rounded-lg text-xs bg-zinc-800/80 border border-zinc-700/60 text-zinc-200"
                >
                  {pat}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Confidence */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
                Confidence
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs border ${confMeta.badgeBg} ${confMeta.border} ${confMeta.badgeText}`}
                >
                  {problem.confidence}
                </span>
                <span className="text-xs font-semibold text-zinc-200">
                  {confMeta.label}
                </span>
              </div>
            </div>

            {/* Solve Time */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
                Solve Time
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200">
                <Clock className="h-4 w-4 text-zinc-500" />
                <span>{problem.solveTimeMinutes ? `${problem.solveTimeMinutes} mins` : 'N/A'}</span>
              </div>
            </div>

            {/* Revision Count */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
                Revisions
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>{problem.revisionCount} completed</span>
              </div>
            </div>

            {/* Next Due */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
                Next Revision
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-200">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <span>{problem.nextRevisionDate}</span>
              </div>
            </div>
          </div>

          {/* Key Intuition & Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Lightbulb className="h-4 w-4" />
                <span>Key Intuition / "Aha!" Moment</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                {problem.notes.keyIntuition || 'No intuition recorded yet.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <AlertOctagon className="h-4 w-4" />
                <span>Mistakes & Edge Cases Missed</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                {problem.notes.mistakes || 'No mistakes recorded.'}
              </p>
            </div>
          </div>

          {/* Time & Space Complexity */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
              Time Complexity: <strong className="text-blue-400">{problem.notes.timeComplexity || 'N/A'}</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
              Space Complexity: <strong className="text-blue-400">{problem.notes.spaceComplexity || 'N/A'}</strong>
            </div>
          </div>

          {/* Code Snippet */}
          {problem.notes.codeSnippet && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/60 text-xs text-zinc-400">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Code Snippet ({problem.notes.language || 'python'})</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-72">
                <code>{problem.notes.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Revision History Timeline */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
              <History className="h-4 w-4 text-emerald-400" />
              <span>Revision History ({problem.revisionHistory?.length || 0})</span>
            </div>

            {problem.revisionHistory && problem.revisionHistory.length > 0 ? (
              <div className="space-y-2">
                {problem.revisionHistory.map((rec, idx) => {
                  const cMeta = CONFIDENCE_CONFIG[rec.confidence];
                  return (
                    <div
                      key={rec.id || idx}
                      className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs border ${cMeta.badgeBg} ${cMeta.border} ${cMeta.badgeText}`}
                        >
                          {rec.confidence}
                        </span>
                        <div>
                          <div className="font-semibold text-zinc-200">
                            {cMeta.label}
                          </div>
                          {rec.notes && (
                            <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">
                              {rec.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono text-zinc-400 text-[11px]">
                        {rec.solveTimeMinutes && (
                          <span>{rec.solveTimeMinutes} mins</span>
                        )}
                        <span>{rec.date.includes('T') ? rec.date.split('T')[0] : rec.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No revisions logged yet.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            First added on {problem.dateFirstSolved}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenQuickRevision(problem);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Log Revision Today</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
