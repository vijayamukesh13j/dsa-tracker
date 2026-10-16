import { ConfidenceLevel, CONFIDENCE_CONFIG, Problem, RevisionStatus } from '../types/problem';

/**
 * Format a Date to 'YYYY-MM-DD' in local timezone
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date formatted as 'YYYY-MM-DD'
 */
export function getTodayISO(): string {
  return formatDateISO(new Date());
}

/**
 * Add N days to a date string 'YYYY-MM-DD'
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return formatDateISO(date);
}

/**
 * Calculate the next revision date based on confidence level
 */
export function calculateNextRevisionDate(
  confidence: ConfidenceLevel,
  fromDate: string = getTodayISO()
): string {
  const days = CONFIDENCE_CONFIG[confidence].intervalDays;
  return addDaysToDate(fromDate, days);
}

/**
 * Calculate day difference between two YYYY-MM-DD dates (target - reference)
 * Positive means target is in the future, negative means target is in the past.
 */
export function diffInDays(targetDateStr: string, referenceDateStr: string = getTodayISO()): number {
  const [y1, m1, d1] = targetDateStr.split('-').map(Number);
  const [y2, m2, d2] = referenceDateStr.split('-').map(Number);
  
  const dTarget = new Date(y1, m1 - 1, d1).getTime();
  const dRef = new Date(y2, m2 - 1, d2).getTime();
  
  const diffTime = dTarget - dRef;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determine the revision status of a problem
 */
export function getRevisionStatus(problem: Problem): RevisionStatus {
  const today = getTodayISO();
  const diff = diffInDays(problem.nextRevisionDate, today);

  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due_today';
  if (problem.confidence === 5 && problem.revisionCount >= 3) return 'mastered';
  return 'upcoming';
}

/**
 * Human-readable relative string for next revision date
 */
export function getRelativeRevisionString(dateStr: string): { text: string; color: string; isUrgent: boolean } {
  const today = getTodayISO();
  const diff = diffInDays(dateStr, today);

  if (diff < 0) {
    const days = Math.abs(diff);
    return {
      text: `${days} day${days > 1 ? 's' : ''} overdue`,
      color: 'text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30',
      isUrgent: true,
    };
  }

  if (diff === 0) {
    return {
      text: 'Due Today',
      color: 'text-amber-700 dark:text-amber-400 bg-amber-500/15 border-amber-500/30',
      isUrgent: true,
    };
  }

  if (diff === 1) {
    return {
      text: 'Due Tomorrow',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25',
      isUrgent: false,
    };
  }

  return {
    text: `In ${diff} days`,
    color: 'text-slate-600 dark:text-zinc-400 bg-slate-200/70 dark:bg-zinc-800/50 border-slate-300 dark:border-zinc-700/40',
    isUrgent: false,
  };
}

/**
 * Helper to check if a problem is a built-in preloaded sample
 */
export function isSampleProblem(problem: Problem): boolean {
  return problem.id.startsWith('sample-');
}

/**
 * Calculate user daily streak based on real solved dates & revision histories
 */
export function calculateStreak(problems: Problem[]): number {
  const activeDates = new Set<string>();

  problems.forEach((p) => {
    // Only count dateFirstSolved if it's a user-added problem (not a preloaded sample placeholder)
    if (!isSampleProblem(p) && p.dateFirstSolved) {
      activeDates.add(p.dateFirstSolved);
    }
    // Count all actual revisions logged by the user
    p.revisionHistory?.forEach((r) => {
      const d = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      activeDates.add(d);
    });
  });

  const today = getTodayISO();
  const yesterday = addDaysToDate(today, -1);

  if (!activeDates.has(today) && !activeDates.has(yesterday)) {
    return 0;
  }

  let currentCheck = activeDates.has(today) ? today : yesterday;
  let streak = 0;

  while (activeDates.has(currentCheck)) {
    streak++;
    currentCheck = addDaysToDate(currentCheck, -1);
  }

  return streak;
}

/**
 * Calculate count of problems first solved today by the user
 */
export function getProblemsSolvedToday(problems: Problem[]): number {
  const today = getTodayISO();
  return problems.filter((p) => !isSampleProblem(p) && p.dateFirstSolved === today).length;
}

/**
 * Calculate count of revisions conducted today by the user
 */
export function getRevisionsDoneToday(problems: Problem[]): number {
  const today = getTodayISO();
  let count = 0;
  problems.forEach((p) => {
    p.revisionHistory?.forEach((r) => {
      const d = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      if (d === today) {
        count++;
      }
    });
  });
  return count;
}

/**
 * 90-Day Heatmap Data interface
 */
export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // total activity (solves + revisions)
  solved: number;
  revised: number;
  level: 0 | 1 | 2 | 3 | 4; // intensity
}

/**
 * Build 90-day heatmap array up to today (counting only real user solves and revisions)
 */
export function generate90DayHeatmap(problems: Problem[]): HeatmapDay[] {
  const today = getTodayISO();
  const dayMap = new Map<string, { solved: number; revised: number }>();

  // Initialize all 90 days with 0
  for (let i = 89; i >= 0; i--) {
    const d = addDaysToDate(today, -i);
    dayMap.set(d, { solved: 0, revised: 0 });
  }

  problems.forEach((p) => {
    // Count first solve only for user-added problems
    if (!isSampleProblem(p) && p.dateFirstSolved && dayMap.has(p.dateFirstSolved)) {
      const entry = dayMap.get(p.dateFirstSolved)!;
      entry.solved += 1;
    }
    // Count actual revisions logged in revisionHistory
    p.revisionHistory?.forEach((r) => {
      const d = r.date.includes('T') ? r.date.split('T')[0] : r.date;
      if (dayMap.has(d)) {
        const entry = dayMap.get(d)!;
        entry.revised += 1;
      }
    });
  });

  const result: HeatmapDay[] = [];
  dayMap.forEach((val, date) => {
    const total = val.solved + val.revised;
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (total === 1) level = 1;
    else if (total === 2) level = 2;
    else if (total >= 3 && total <= 4) level = 3;
    else if (total >= 5) level = 4;

    result.push({
      date,
      count: total,
      solved: val.solved,
      revised: val.revised,
      level,
    });
  });

  return result;
}
