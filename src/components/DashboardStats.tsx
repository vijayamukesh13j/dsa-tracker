import React from 'react';
import {
  Flame,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Target,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import {
  calculateStreak,
  diffInDays,
  getProblemsSolvedToday,
  getRevisionsDoneToday,
  getTodayISO,
} from '../utils/spacedRepetition';

interface DashboardStatsProps {
  problems: Problem[];
  onOpenFlashcards: () => void;
  onFilterDue: () => void;
  onSelectPattern: (pattern: string) => void;
}

interface WeakestPattern {
  name: string;
  avg: number;
  count: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  problems,
  onOpenFlashcards,
  onFilterDue,
  onSelectPattern,
}) => {
  const today = getTodayISO();
  const streak = calculateStreak(problems);
  const solvedToday = getProblemsSolvedToday(problems);
  const revisionsToday = getRevisionsDoneToday(problems);

  let overdueCount = 0;
  let dueTodayCount = 0;

  problems.forEach((p) => {
    const diff = diffInDays(p.nextRevisionDate, today);
    if (diff < 0) overdueCount++;
    else if (diff === 0) dueTodayCount++;
  });

  const totalDue = overdueCount + dueTodayCount;

  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  const masteredCount = problems.filter((p) => p.confidence === 5).length;

  const patternScores: Record<string, { total: number; count: number }> = {};
  problems.forEach((p) => {
    p.patterns.forEach((pat) => {
      if (!patternScores[pat]) {
        patternScores[pat] = { total: 0, count: 0 };
      }
      patternScores[pat].total += p.confidence;
      patternScores[pat].count += 1;
    });
  });

  let weakestPattern: WeakestPattern | null = null;
  Object.entries(patternScores).forEach(([name, data]) => {
    const avg = data.total / data.count;
    if (!weakestPattern || avg < weakestPattern.avg) {
      weakestPattern = { name, avg: Number(avg.toFixed(1)), count: data.count };
    }
  });

  const currentWeakest = weakestPattern as WeakestPattern | null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* 1. Daily Streak & Today's Activity */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/75 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Practice Streak
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
            {streak}
          </span>
          <span className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">
            {streak === 1 ? 'day' : 'days'}
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
          <span>
            <strong className="text-slate-800 dark:text-zinc-200">{solvedToday}</strong> solved
          </span>
          <span>•</span>
          <span>
            <strong className="text-slate-800 dark:text-zinc-200">{revisionsToday}</strong> rev
          </span>
        </div>
      </div>

      {/* 2. Spaced Repetition Due Queue */}
      <div
        className={`p-3.5 sm:p-5 rounded-2xl border shadow-xs transition-all ${
          totalDue > 0
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/30'
            : 'bg-white dark:bg-zinc-900/75 border-slate-200/90 dark:border-zinc-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Due Queue
          </span>
          <div
            className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl flex items-center justify-center shrink-0 ${
              totalDue > 0
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {totalDue > 0 ? (
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
          <span className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
            {totalDue}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 truncate">
            ({overdueCount} late, {dueTodayCount} today)
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-2">
          {totalDue > 0 ? (
            <button
              onClick={onOpenFlashcards}
              className="text-[11px] sm:text-xs font-bold text-rose-600 dark:text-rose-300 hover:underline underline-offset-2 flex items-center gap-1"
            >
              <span>3D Deck</span> &rarr;
            </button>
          ) : (
            <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              All caught up!
            </span>
          )}
          {totalDue > 0 && (
            <button
              onClick={onFilterDue}
              className="text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
            >
              (Filter)
            </button>
          )}
        </div>
      </div>

      {/* 3. Total Problems & Mastery */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/75 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Vault Total
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100 font-mono">
            {problems.length}
          </span>
          <span className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold truncate">
            {masteredCount} Mastered
          </span>
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{easyCount}E</span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">{mediumCount}M</span>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">{hardCount}H</span>
        </div>
      </div>

      {/* 4. Weakest Pattern / Priority Focus */}
      <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/75 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2.5">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Priority Focus
          </span>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        {currentWeakest ? (
          <div>
            <button
              onClick={() => onSelectPattern(currentWeakest.name)}
              className="text-left font-bold text-xs sm:text-base text-slate-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition truncate max-w-full block"
              title={`Click to filter by ${currentWeakest.name}`}
            >
              {currentWeakest.name}
            </button>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-orange-600 dark:text-orange-400 font-bold font-mono">
                {currentWeakest.avg} / 5.0
              </span>
              <span className="text-slate-500 dark:text-zinc-500 text-[10px] sm:text-[11px]">
                {currentWeakest.count} probs
              </span>
            </div>
            <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              Lowest confidence pattern
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2">
            Log problems to analyze
          </p>
        )}
      </div>
    </div>
  );
};
