import React, { useState } from 'react';
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Copy,
  Check,
  Code2,
  Lightbulb,
  AlertOctagon,
} from 'lucide-react';
import { CONFIDENCE_CONFIG, type Problem } from '../types/problem';
import { PLATFORM_CONFIG } from '../utils/urlParser';
import { getRelativeRevisionString } from '../utils/spacedRepetition';

interface ProblemTableProps {
  problems: Problem[];
  onOpenQuickRevision: (problem: Problem) => void;
  onOpenDetailModal: (problem: Problem) => void;
  onOpenEditModal: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
  onFilterPattern: (pattern: string) => void;
  onCopyCodeNotify?: (title: string) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  onOpenQuickRevision,
  onOpenDetailModal,
  onOpenEditModal,
  onDeleteProblem,
  onFilterPattern,
  onCopyCodeNotify,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const copyCode = (code: string, id: string, title: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (onCopyCodeNotify) onCopyCodeNotify(title);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'Hard':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25';
    }
  };

  if (problems.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
        <p className="text-base font-bold text-slate-800 dark:text-zinc-200">
          No problems match your current criteria.
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
          Try resetting filters or press <kbd className="font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800">N</kbd> to add a new problem.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            <th className="py-3.5 px-4 w-8"></th>
            <th className="py-3.5 px-4">Problem</th>
            <th className="py-3.5 px-3">Difficulty</th>
            <th className="py-3.5 px-3">Patterns</th>
            <th className="py-3.5 px-3">Confidence</th>
            <th className="py-3.5 px-3">Next Revision</th>
            <th className="py-3.5 px-3 text-center">Solve Time</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 dark:divide-zinc-800/60 text-xs text-slate-700 dark:text-zinc-300">
          {problems.map((problem) => {
            const isExpanded = expandedId === problem.id;
            const platformMeta = PLATFORM_CONFIG[problem.platform || 'other'];
            const confMeta = CONFIDENCE_CONFIG[problem.confidence];
            const relativeRev = getRelativeRevisionString(problem.nextRevisionDate);

            return (
              <React.Fragment key={problem.id}>
                <tr
                  className={`hover:bg-slate-50/90 dark:hover:bg-zinc-800/40 transition-colors group ${
                    isExpanded ? 'bg-slate-50 dark:bg-zinc-800/30' : ''
                  }`}
                >
                  {/* Expand chevron */}
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() => toggleExpand(problem.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
                      title={isExpanded ? 'Collapse notes' : 'Expand notes'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </td>

                  {/* Title & Platform Link */}
                  <td className="py-3.5 px-4 font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenDetailModal(problem)}
                          className="font-bold text-sm text-slate-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition text-left"
                        >
                          {problem.title}
                        </button>
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 p-0.5"
                            title={`Open on ${platformMeta.name}`}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${platformMeta.bg} ${platformMeta.border} ${platformMeta.color}`}
                        >
                          {platformMeta.name}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          Rev #{problem.revisionCount}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getDifficultyBadge(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>

                  {/* Patterns */}
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {problem.patterns.slice(0, 2).map((pat) => (
                        <button
                          key={pat}
                          onClick={() => onFilterPattern(pat)}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-slate-200/80 dark:border-zinc-700/50 text-slate-700 dark:text-zinc-300 font-medium transition"
                        >
                          {pat}
                        </button>
                      ))}
                      {problem.patterns.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-mono">
                          +{problem.patterns.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Confidence Level */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-6 w-6 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${confMeta.badgeBg} ${confMeta.border} ${confMeta.badgeText}`}
                        title={`${problem.confidence} - ${confMeta.label}: ${confMeta.description}`}
                      >
                        {problem.confidence}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {confMeta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                          +{confMeta.intervalDays}d cycle
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Next Revision Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border w-fit ${relativeRev.color}`}
                      >
                        {relativeRev.text}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 font-mono">
                        {problem.nextRevisionDate}
                      </span>
                    </div>
                  </td>

                  {/* Solve Time */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    {problem.solveTimeMinutes ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-950/60 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800">
                        <Clock className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                        {problem.solveTimeMinutes}m
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-zinc-600">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenQuickRevision(problem)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition"
                        title="Log a revision now"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Review</span>
                      </button>

                      <button
                        onClick={() => onOpenEditModal(problem)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
                        title="Edit problem"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${problem.title}"?`)) {
                            onDeleteProblem(problem.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete problem"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <tr className="bg-slate-50/90 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800/80">
                    <td colSpan={8} className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <Lightbulb className="h-3.5 w-3.5" />
                            <span>Key Intuition / "Aha!" Moment</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {problem.notes.keyIntuition || 'No intuition noted yet.'}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 space-y-1 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <AlertOctagon className="h-3.5 w-3.5" />
                            <span>Mistakes & Edge Cases Missed</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                            {problem.notes.mistakes || 'No mistakes recorded.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                          <span className="text-slate-500 dark:text-zinc-500 font-mono">Time:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {problem.notes.timeComplexity || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                          <span className="text-slate-500 dark:text-zinc-500 font-mono">Space:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {problem.notes.spaceComplexity || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                          <span className="text-slate-500 dark:text-zinc-500 font-mono">First Solved:</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {problem.dateFirstSolved}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
                          <span className="text-slate-500 dark:text-zinc-500 font-mono">Last Revised:</span>
                          <span className="font-mono text-slate-700 dark:text-zinc-300">
                            {problem.lastRevisionDate}
                          </span>
                        </div>
                      </div>

                      {problem.notes.codeSnippet && (
                        <div className="rounded-xl border border-slate-800 bg-zinc-950 overflow-hidden">
                          <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800/80 bg-zinc-900/80 text-xs text-zinc-400">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span>Code / Pseudocode Solution</span>
                            </div>
                            <button
                              onClick={() =>
                                copyCode(problem.notes.codeSnippet, problem.id, problem.title)
                              }
                              className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 transition"
                            >
                              {copiedId === problem.id ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3.5 text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-60">
                            <code>{problem.notes.codeSnippet}</code>
                          </pre>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
