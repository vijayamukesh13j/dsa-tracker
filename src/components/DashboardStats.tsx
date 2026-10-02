import React from 'react';
import {
  Flame,
  AlertTriangle,
  Brain,
  CheckCircle2,
  TrendingUp,
  Target,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import {
  calculateStreak,
  diffInDays,
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

  // Overdue and Due Today tallies
  let overdueCount = 0;
  let dueTodayCount = 0;

  problems.forEach((p) => {
    const diff = diffInDays(p.nextRevisionDate, today);
    if (diff < 0) overdueCount++;
    else if (diff === 0) dueTodayCount++;
  });

  const totalDue = overdueCount + dueTodayCount;

  // Difficulties breakdown
  const easyCount = problems.filter((p) => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter((p) => p.difficulty === 'Medium').length;
  const hardCount = problems.filter((p) => p.difficulty === 'Hard').length;

  // Mastered count (confidence 5)
  const masteredCount = problems.filter((p) => p.confidence === 5).length;

  // Find Pattern with lowest average confidence (weakest area)
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Daily Streak */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Practice Streak
          </span>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            {streak}
          </span>
          <span className="text-xs font-semibold text-amber-400">
            {streak === 1 ? 'day active' : 'days active'}
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span>Keep your momentum going today</span>
        </p>
      </div>

      {/* 2. Spaced Repetition Due Queue */}
      <div
        className={`p-4 rounded-xl border shadow-sm relative overflow-hidden transition-all ${
          totalDue > 0
            ? 'bg-rose-950/20 border-rose-500/30'
            : 'bg-zinc-900/70 border-zinc-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Revision Queue
          </span>
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              totalDue > 0
                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}
          >
            {totalDue > 0 ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            {totalDue}
          </span>
          <span className="text-xs text-zinc-400">
            ({overdueCount} overdue, {dueTodayCount} due today)
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {totalDue > 0 ? (
            <button
              onClick={onOpenFlashcards}
              className="text-xs font-semibold text-rose-300 hover:text-rose-200 underline underline-offset-2 flex items-center gap-1"
            >
              Start Flashcards &rarr;
            </button>
          ) : (
            <span className="text-xs text-emerald-400 font-medium">
              Zero pending revisions!
            </span>
          )}
          {totalDue > 0 && (
            <button
              onClick={onFilterDue}
              className="text-[11px] text-zinc-400 hover:text-zinc-200"
            >
              (Filter table)
            </button>
          )}
        </div>
      </div>

      {/* 3. Total Problems & Mastery */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Problems Tracked
          </span>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Brain className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            {problems.length}
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            {masteredCount} Mastered (lvl 5)
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="text-emerald-400 font-medium">{easyCount}E</span>
          <span className="text-zinc-600">•</span>
          <span className="text-amber-400 font-medium">{mediumCount}M</span>
          <span className="text-zinc-600">•</span>
          <span className="text-rose-400 font-medium">{hardCount}H</span>
        </div>
      </div>

      {/* 4. Weakest Pattern / Priority Focus */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm relative overflow-hidden group hover:border-zinc-700/80 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Needs Attention
          </span>
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Target className="h-4 w-4" />
          </div>
        </div>
        {currentWeakest ? (
          <div>
            <button
              onClick={() => onSelectPattern(currentWeakest.name)}
              className="text-left font-bold text-base text-zinc-100 hover:text-emerald-400 transition truncate max-w-full block"
              title={`Click to filter by ${currentWeakest.name}`}
            >
              {currentWeakest.name}
            </button>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-orange-400 font-semibold">
                Avg Confidence: {currentWeakest.avg} / 5
              </span>
              <span className="text-zinc-500 text-[11px]">
                {currentWeakest.count} problems
              </span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Lowest confidence score across your tracked patterns
            </p>
          </div>
        ) : (
          <p className="text-xs text-zinc-400 mt-2">Log problems to identify weak patterns</p>
        )}
      </div>
    </div>
  );
};
