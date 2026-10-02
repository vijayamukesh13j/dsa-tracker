export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Platform = 'leetcode' | 'neetcode' | 'gfg' | 'codeforces' | 'hackerrank' | 'other';

export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

export interface RevisionRecord {
  id: string;
  date: string; // ISO or YYYY-MM-DD
  confidence: ConfidenceLevel;
  solveTimeMinutes?: number;
  notes?: string;
}

export interface ProblemNotes {
  keyIntuition: string; // 1-2 sentences on the trick / "Aha!" moment
  mistakes: string;     // What went wrong initially / edge cases missed
  timeComplexity: string; // e.g., "O(N)"
  spaceComplexity: string; // e.g., "O(1)"
  codeSnippet: string;  // Collapsible code block
  language?: string;    // e.g., 'python', 'cpp', 'java', 'javascript'
}

export interface Problem {
  id: string;
  title: string;
  problemNumber?: string;
  url: string;
  platform: Platform;
  difficulty: Difficulty;
  patterns: string[];
  confidence: ConfidenceLevel;
  dateFirstSolved: string; // YYYY-MM-DD
  lastRevisionDate: string; // YYYY-MM-DD
  nextRevisionDate: string; // YYYY-MM-DD
  revisionCount: number;
  revisionHistory: RevisionRecord[];
  notes: ProblemNotes;
  solveTimeMinutes?: number;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RevisionStatus = 'overdue' | 'due_today' | 'upcoming' | 'mastered';

export interface FilterState {
  search: string;
  pattern: string;
  difficulty: string;
  confidence: string;
  status: string;
  platform: string;
  sortBy: 'nextRevision' | 'confidenceAsc' | 'confidenceDesc' | 'lastRevision' | 'title' | 'solveTime';
}

export const STANDARD_PATTERNS = [
  'Two Pointers',
  'Sliding Window',
  'Fast & Slow Pointers',
  'Merge Intervals',
  'Cyclic Sort',
  'In-place Reversal of LL',
  'Tree BFS/DFS',
  'Two Heaps',
  'Subsets / Backtracking',
  'Modified Binary Search',
  'Top \'K\' Elements',
  'K-way Merge',
  '0/1 Knapsack / DP',
  'Monotonic Stack',
  'Graphs / Union Find',
  'Trie',
  'Greedy',
  'Prefix Sum',
  'Bit Manipulation',
  'Math & Geometry'
] as const;

export const CONFIDENCE_CONFIG: Record<
  ConfidenceLevel,
  {
    label: string;
    description: string;
    intervalDays: number;
    color: string;
    bg: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  1: {
    label: 'Struggled',
    description: 'Needed Solution / Failed test cases',
    intervalDays: 1,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-400',
  },
  2: {
    label: 'With Hints',
    description: 'Solved with Hints / Looked up editorial',
    intervalDays: 3,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-400',
  },
  3: {
    label: 'Sub-optimal',
    description: 'Solved Sub-optimally or slow time',
    intervalDays: 7,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
  },
  4: {
    label: 'Optimal',
    description: 'Solved Optimally without assistance',
    intervalDays: 14,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-400',
  },
  5: {
    label: 'Mastered',
    description: 'Can teach it & explain all trade-offs',
    intervalDays: 30,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
  },
};
