import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Flame } from 'lucide-react';
import type { Problem } from '../types/problem';
import { generate90DayHeatmap, type HeatmapDay } from '../utils/spacedRepetition';

interface Heatmap90DaysProps {
  problems: Problem[];
}

export const Heatmap90Days: React.FC<Heatmap90DaysProps> = ({ problems }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const days = generate90DayHeatmap(problems);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [problems.length]);

  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalSolved = days.reduce((sum, d) => sum + d.solved, 0);
  const totalRevised = days.reduce((sum, d) => sum + d.revised, 0);
  const activeDaysCount = days.filter((d) => d.count > 0).length;

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 border-emerald-300 dark:bg-emerald-950/90 dark:border-emerald-800/60 hover:ring-2 hover:ring-emerald-400';
      case 2:
        return 'bg-emerald-400 border-emerald-500 dark:bg-emerald-800/90 dark:border-emerald-600/70 hover:ring-2 hover:ring-emerald-400';
      case 3:
        return 'bg-emerald-500 border-emerald-600 dark:bg-emerald-600 dark:border-emerald-400/80 hover:ring-2 hover:ring-emerald-300';
      case 4:
        return 'bg-emerald-700 border-emerald-800 dark:bg-emerald-400 dark:border-emerald-200 hover:ring-2 hover:ring-emerald-300';
      default:
        return 'bg-slate-100 border-slate-200/90 dark:bg-zinc-900/80 dark:border-zinc-800/60 hover:border-slate-300 dark:hover:border-zinc-700';
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900/75 border border-slate-200/90 dark:border-zinc-800/80 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-zinc-100 tracking-tight">
              90-Day Practice & Revision Consistency
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            <strong className="font-mono text-slate-800 dark:text-zinc-200">{totalSolved}</strong> solved •{' '}
            <strong className="font-mono text-slate-800 dark:text-zinc-200">{totalRevised}</strong> revised across{' '}
            <strong className="font-mono text-slate-800 dark:text-zinc-200">{activeDaysCount}</strong> active days
          </p>
        </div>

        {/* Hover / Tap info badge */}
        <div className="min-h-7 flex items-center">
          {hoveredDay ? (
            <div className="flex items-center gap-2 text-[11px] sm:text-xs bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 shadow-2xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatDateLabel(hoveredDay.date)}:
              </span>
              <span className="font-mono">
                {hoveredDay.count === 0
                  ? '0 solved, 0 revised'
                  : `${hoveredDay.solved} solved, ${hoveredDay.revised} revised`}
              </span>
            </div>
          ) : (
            <div className="text-[11px] sm:text-xs text-slate-400 dark:text-zinc-500 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 shrink-0" />
              <span>Tap or hover any day for breakdown</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid container with horizontal scroll on small devices (auto-scrolled to latest week) */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-2 no-scrollbar">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                const isSelected = hoveredDay?.date === day.date;
                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setHoveredDay(day)}
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-[4px] border transition-all cursor-pointer ${getCellColor(
                      day.level
                    )} ${isSelected ? 'ring-2 ring-emerald-500 scale-110' : ''}`}
                    title={`${day.date}: ${day.solved} solved, ${day.revised} revised`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-zinc-400">
        <span>Real daily solves & logged revisions</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-[3px] bg-slate-100 border border-slate-200 dark:bg-zinc-900 dark:border-zinc-800" />
            <div className="h-3 w-3 rounded-[3px] bg-emerald-200 border border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800/50" />
            <div className="h-3 w-3 rounded-[3px] bg-emerald-400 border border-emerald-500 dark:bg-emerald-800 dark:border-emerald-600/60" />
            <div className="h-3 w-3 rounded-[3px] bg-emerald-500 border border-emerald-600 dark:bg-emerald-600 dark:border-emerald-400/80" />
            <div className="h-3 w-3 rounded-[3px] bg-emerald-700 border border-emerald-800 dark:bg-emerald-400 dark:border-emerald-200" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
