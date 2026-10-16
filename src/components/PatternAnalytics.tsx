import React, { useState } from 'react';
import { Target, AlertCircle, ArrowUpDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { Problem } from '../types/problem';

interface PatternAnalyticsProps {
  problems: Problem[];
  selectedPattern: string;
  onSelectPattern: (pattern: string) => void;
}

interface PatternStat {
  name: string;
  count: number;
  avgConfidence: number;
  struggledCount: number;
  masteredCount: number;
}

export const PatternAnalytics: React.FC<PatternAnalyticsProps> = ({
  problems,
  selectedPattern,
  onSelectPattern,
}) => {
  const [sortByWeakness, setSortByWeakness] = useState<boolean>(true);

  const patternMap = new Map<
    string,
    { total: number; count: number; struggled: number; mastered: number }
  >();

  problems.forEach((p) => {
    p.patterns.forEach((pat) => {
      const current = patternMap.get(pat) || { total: 0, count: 0, struggled: 0, mastered: 0 };
      current.total += p.confidence;
      current.count += 1;
      if (p.confidence <= 2) current.struggled += 1;
      if (p.confidence >= 4) current.mastered += 1;
      patternMap.set(pat, current);
    });
  });

  const patternStats: PatternStat[] = [];
  patternMap.forEach((val, name) => {
    patternStats.push({
      name,
      count: val.count,
      avgConfidence: Number((val.total / val.count).toFixed(2)),
      struggledCount: val.struggled,
      masteredCount: val.mastered,
    });
  });

  patternStats.sort((a, b) => {
    if (sortByWeakness) {
      if (a.avgConfidence !== b.avgConfidence) {
        return a.avgConfidence - b.avgConfidence;
      }
      return b.count - a.count;
    }
    return b.count - a.count;
  });

  const weakPatterns = patternStats.filter((p) => p.avgConfidence <= 3.0);

  const getBarColor = (avg: number) => {
    if (avg < 2.0) return 'bg-rose-500';
    if (avg < 3.0) return 'bg-orange-500';
    if (avg < 4.0) return 'bg-amber-400';
    if (avg < 4.8) return 'bg-indigo-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = (avg: number) => {
    if (avg < 2.0) return 'text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30';
    if (avg < 3.0) return 'text-orange-600 dark:text-orange-400 bg-orange-500/15 border-orange-500/30';
    if (avg < 4.0) return 'text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30';
    if (avg < 4.8) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 border-indigo-500/30';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  };

  if (patternStats.length === 0) {
    return null;
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/75 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-orange-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 tracking-tight">
              Pattern Weakness Radar & Mastery Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Click any pattern below to filter your vault and drill weak topics
          </p>
        </div>

        <button
          onClick={() => setSortByWeakness((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-300 transition w-fit"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>Sort: {sortByWeakness ? 'Lowest Confidence' : 'Problem Count'}</span>
        </button>
      </div>

      {/* Weakest Patterns Callout Alert */}
      {weakPatterns.length > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-600 dark:text-rose-300">Priority Study Recommendation: </span>
            Focus your next session on{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">
              {weakPatterns.slice(0, 3).map((w) => `${w.name} (${w.avgConfidence}/5)`).join(', ')}
            </strong>
            .
          </div>
        </div>
      )}

      {/* Pattern Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {patternStats.map((item) => {
          const isSelected = selectedPattern === item.name;
          const percentage = Math.round((item.avgConfidence / 5) * 100);

          return (
            <div
              key={item.name}
              onClick={() => onSelectPattern(isSelected ? '' : item.name)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-2xs'
                  : 'bg-slate-50/70 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100/80 dark:hover:bg-zinc-800/50 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition flex items-center gap-1.5">
                  {item.name}
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold font-mono border ${getBadgeColor(
                      item.avgConfidence
                    )}`}
                  >
                    {item.avgConfidence.toFixed(1)} / 5.0
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                    {item.count} {item.count === 1 ? 'prob' : 'probs'}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                    item.avgConfidence
                  )}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-500 mt-1.5 font-medium">
                <span>{item.struggledCount > 0 ? `${item.struggledCount} struggled` : 'No struggles'}</span>
                <span>{item.masteredCount} mastered</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
