import React, { useState } from 'react';
import { Calendar, Flame } from 'lucide-react';
import { Problem } from '../types/problem';
import { generate90DayHeatmap, HeatmapDay } from '../utils/spacedRepetition';

interface Heatmap90DaysProps {
  problems: Problem[];
}

export const Heatmap90Days: React.FC<Heatmap90DaysProps> = ({ problems }) => {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const days = generate90DayHeatmap(problems);

  // Group days into columns (weeks of 7 days)
  // To align properly like GitHub, we can group days by their week index
  const weeks: HeatmapDay[][] = [];
  let currentWeek: HeatmapDay[] = [];

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalActivities = days.reduce((sum, d) => sum + d.count, 0);
  const activeDaysCount = days.filter((d) => d.count > 0).length;

  const getCellColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-950/80 border-emerald-800/50 hover:border-emerald-500';
      case 2:
        return 'bg-emerald-800/90 border-emerald-600/60 hover:border-emerald-400';
      case 3:
        return 'bg-emerald-600 border-emerald-400/80 hover:border-emerald-300';
      case 4:
        return 'bg-emerald-400 border-emerald-200 hover:border-white';
      default:
        return 'bg-zinc-900/80 border-zinc-800/60 hover:border-zinc-700';
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
    <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-zinc-100 tracking-tight">
              90-Day Practice & Revision Consistency
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {totalActivities} total activities across {activeDaysCount} active days in the last 90 days
          </p>
        </div>

        {/* Hover info badge */}
        <div className="h-7 flex items-center">
          {hoveredDay ? (
            <div className="flex items-center gap-2 text-xs bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700 text-zinc-200">
              <span className="font-semibold text-emerald-400">
                {formatDateLabel(hoveredDay.date)}:
              </span>
              <span>
                {hoveredDay.count === 0
                  ? 'No practice'
                  : `${hoveredDay.solved} solved, ${hoveredDay.revised} revised (${hoveredDay.count} total)`}
              </span>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-zinc-500" />
              <span>Hover over any day for details</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid container with horizontal scroll on small devices */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-[3px] border transition-all cursor-pointer ${getCellColor(
                    day.level
                  )}`}
                  title={`${day.date}: ${day.count} activities (${day.solved} solved, ${day.revised} revised)`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
        <span>Daily solves + spaced revisions</span>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-[2px] bg-zinc-900 border border-zinc-800" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-950 border border-emerald-800/50" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-800 border border-emerald-600/60" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-600 border border-emerald-400/80" />
            <div className="h-3 w-3 rounded-[2px] bg-emerald-400 border border-emerald-200" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
