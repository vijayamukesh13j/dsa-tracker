import React from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { type FilterState, STANDARD_PATTERNS } from '../types/problem';

interface ProblemFiltersProps {
  filter: FilterState;
  onChangeFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'table' | 'cards';
  onChangeViewMode: (mode: 'table' | 'cards') => void;
  totalFilteredCount: number;
  totalCount: number;
  availablePatterns: string[];
}

export const ProblemFilters: React.FC<ProblemFiltersProps> = ({
  filter,
  onChangeFilter,
  onResetFilters,
  viewMode,
  onChangeViewMode,
  totalFilteredCount,
  totalCount,
  availablePatterns,
}) => {
  const hasActiveFilters =
    filter.search !== '' ||
    filter.pattern !== '' ||
    filter.difficulty !== '' ||
    filter.confidence !== '' ||
    filter.status !== '' ||
    filter.platform !== '';

  const allPatterns = Array.from(
    new Set([...STANDARD_PATTERNS, ...availablePatterns])
  ).sort();

  return (
    <div className="space-y-3">
      {/* Top Search & Primary Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Search problems by title, keywords, intuition, or edge cases... (Press '/' to focus)"
            value={filter.search}
            onChange={(e) => onChangeFilter({ search: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
          />
          {filter.search && (
            <button
              onClick={() => onChangeFilter({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-xs text-slate-500 dark:text-zinc-400 px-2 font-mono">
            Showing <strong className="text-slate-900 dark:text-zinc-100">{totalFilteredCount}</strong> of {totalCount}
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => onChangeViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
              title="Dense Table View (V)"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
              title="Card Grid View (V)"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills and Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-500 pr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Revision Status Pill Buttons */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-1 text-xs">
          {[
            { label: 'All', value: '' },
            { label: '🔥 Overdue', value: 'overdue' },
            { label: '⏳ Due Today', value: 'due_today' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: '✨ Mastered', value: 'mastered' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeFilter({ status: item.value })}
              className={`px-2.5 py-1 rounded-lg transition font-semibold ${
                filter.status === item.value
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <select
          value={filter.difficulty}
          onChange={(e) => onChangeFilter({ difficulty: e.target.value })}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 shadow-2xs"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Pattern Filter */}
        <select
          value={filter.pattern}
          onChange={(e) => onChangeFilter({ pattern: e.target.value })}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[170px] truncate shadow-2xs"
        >
          <option value="">All Patterns</option>
          {allPatterns.map((pat) => (
            <option key={pat} value={pat}>
              {pat}
            </option>
          ))}
        </select>

        {/* Confidence Filter */}
        <select
          value={filter.confidence}
          onChange={(e) => onChangeFilter({ confidence: e.target.value })}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 shadow-2xs"
        >
          <option value="">All Confidence</option>
          <option value="1">1 - Struggled</option>
          <option value="2">2 - With Hints</option>
          <option value="3">3 - Sub-optimal</option>
          <option value="4">4 - Optimal</option>
          <option value="5">5 - Mastered</option>
        </select>

        {/* Platform Filter */}
        <select
          value={filter.platform}
          onChange={(e) => onChangeFilter({ platform: e.target.value })}
          className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 shadow-2xs"
        >
          <option value="">All Platforms</option>
          <option value="leetcode">LeetCode</option>
          <option value="neetcode">NeetCode</option>
          <option value="gfg">GeeksforGeeks</option>
          <option value="codeforces">Codeforces</option>
          <option value="hackerrank">HackerRank</option>
          <option value="other">Custom / Other</option>
        </select>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-500">Sort:</span>
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onChangeFilter({
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 shadow-2xs"
          >
            <option value="nextRevision">Next Revision (Soonest)</option>
            <option value="confidenceAsc">Confidence (Weakest First)</option>
            <option value="confidenceDesc">Confidence (Strongest First)</option>
            <option value="lastRevision">Last Revised (Recent)</option>
            <option value="title">Problem Title</option>
            <option value="solveTime">Solve Time (Slowest)</option>
          </select>
        </div>

        {/* Clear Filters Reset */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
