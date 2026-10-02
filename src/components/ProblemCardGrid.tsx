import React from 'react';
import {
  ExternalLink,
  Sparkles,
  Edit2,
  Trash2,
  Clock,
  Lightbulb,
  FileText,
} from 'lucide-react';
import {
  CONFIDENCE_CONFIG,
  Problem,
} from '../types/problem';
import { PLATFORM_CONFIG } from '../utils/urlParser';
import { getRelativeRevisionString } from '../utils/spacedRepetition';

interface ProblemCardGridProps {
  problems: Problem[];
  onOpenQuickRevision: (problem: Problem) => void;
  onOpenDetailModal: (problem: Problem) => void;
  onOpenEditModal: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
  onFilterPattern: (pattern: string) => void;
}

export const ProblemCardGrid: React.FC<ProblemCardGridProps> = ({
  problems,
  onOpenQuickRevision,
  onOpenDetailModal,
  onOpenEditModal,
  onDeleteProblem,
  onFilterPattern,
}) => {
  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  if (problems.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-zinc-900/50 border border-zinc-800 text-zinc-400">
        <p className="text-base font-semibold text-zinc-300">No problems match your current criteria.</p>
        <p className="text-xs text-zinc-500 mt-1">Try resetting filters or adding a new problem.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {problems.map((problem) => {
        const platformMeta = PLATFORM_CONFIG[problem.platform || 'other'];
        const confMeta = CONFIDENCE_CONFIG[problem.confidence];
        const relativeRev = getRelativeRevisionString(problem.nextRevisionDate);

        return (
          <div
            key={problem.id}
            className="flex flex-col justify-between rounded-xl bg-zinc-900/70 border border-zinc-800/80 p-4 sm:p-5 shadow-sm hover:border-zinc-700 hover:shadow-md transition-all group"
          >
            <div>
              {/* Header: Platform, Difficulty & Next revision status */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${platformMeta.bg} ${platformMeta.border} ${platformMeta.color}`}
                  >
                    {platformMeta.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyBadge(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${relativeRev.color}`}
                >
                  {relativeRev.text}
                </span>
              </div>

              {/* Title & Link */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <button
                  onClick={() => onOpenDetailModal(problem)}
                  className="font-bold text-sm text-zinc-100 hover:text-emerald-400 transition text-left line-clamp-2"
                >
                  {problem.title}
                </button>
                {problem.url && (
                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-200 p-0.5 shrink-0"
                    title={`Open on ${platformMeta.name}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Patterns */}
              <div className="flex flex-wrap gap-1 mb-3">
                {problem.patterns.map((pat) => (
                  <button
                    key={pat}
                    onClick={() => onFilterPattern(pat)}
                    className="px-2 py-0.5 rounded text-[10px] bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/50 text-zinc-300 transition"
                  >
                    {pat}
                  </button>
                ))}
              </div>

              {/* Key Intuition Preview */}
              {problem.notes.keyIntuition && (
                <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 mb-3 text-xs text-zinc-300 flex items-start gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="line-clamp-2 leading-relaxed text-[11px]">
                    {problem.notes.keyIntuition}
                  </p>
                </div>
              )}

              {/* Complexity & Stats Row */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-1.5 font-mono">
                  <span>{problem.notes.timeComplexity || 'O(?)'}</span>
                  <span>•</span>
                  <span>{problem.notes.spaceComplexity || 'O(?)'}</span>
                </div>
                {problem.solveTimeMinutes && (
                  <div className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3 text-zinc-500" />
                    <span>{problem.solveTimeMinutes}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card Footer: Confidence badge & Action buttons */}
            <div className="pt-3 flex items-center justify-between gap-2 mt-auto">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-6 w-6 rounded-md flex items-center justify-center font-bold text-xs border ${confMeta.badgeBg} ${confMeta.border} ${confMeta.badgeText}`}
                >
                  {problem.confidence}
                </span>
                <span className="text-[11px] font-medium text-zinc-300">
                  {confMeta.label}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Review button */}
                <button
                  onClick={() => onOpenQuickRevision(problem)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition"
                  title="Log a revision now"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Review</span>
                </button>

                {/* Full notes modal */}
                <button
                  onClick={() => onOpenDetailModal(problem)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="View full notes"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => onOpenEditModal(problem)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                  title="Edit problem"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${problem.title}"?`)) {
                      onDeleteProblem(problem.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Delete problem"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
