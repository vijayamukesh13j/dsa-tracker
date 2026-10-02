import React from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table as TableIcon,
  X,
} from 'lucide-react';
import { FilterState, STANDARD_PATTERNS } from '../types/problem';

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
        {/* Search input with keyboard shortcut tooltip */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search problems by title, keywords, intuition, or edge cases... (Press '/' to focus)"
            value={filter.search}
            onChange={(e) => onChangeFilter({ search: e.target.value })}
            className="w-full pl-10 pr-10 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition"
          />
          {filter.search && (
            <button
              onClick={() => onChangeFilter({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Toggle & Count */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="text-xs text-zinc-400 px-2">
            Showing <strong className="text-zinc-100">{totalFilteredCount}</strong> of {totalCount}
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => onChangeViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'table'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition ${
                viewMode === 'cards'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills and Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 pr-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters:</span>
        </div>

        {/* Revision Status Pill Buttons */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs">
          {[
            { label: 'All Status', value: '' },
            { label: '🔥 Overdue', value: 'overdue' },
            { label: '⏳ Due Today', value: 'due_today' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: '✨ Mastered', value: 'mastered' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onChangeFilter({ status: item.value })}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filter.status === item.value
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
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
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[160px] truncate"
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
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Confidence Levels</option>
          <option value="1">1 - Struggled (Red)</option>
          <option value="2">2 - With Hints (Orange)</option>
          <option value="3">3 - Sub-optimally (Yellow)</option>
          <option value="4">4 - Optimal (Blue)</option>
          <option value="5">5 - Mastered (Emerald)</option>
        </select>

        {/* Platform Filter */}
        <select
          value={filter.platform}
          onChange={(e) => onChangeFilter({ platform: e.target.value })}
          className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
          <span className="text-xs text-zinc-500">Sort:</span>
          <select
            value={filter.sortBy}
            onChange={(e) =>
              onChangeFilter({
                sortBy: e.target.value as FilterState['sortBy'],
              })
            }
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="nextRevision">Next Revision (Soonest)</option>
            <option value="confidenceAsc">Confidence (Lowest First - Weaknesses)</option>
            <option value="confidenceDesc">Confidence (Highest First)</option>
            <option value="lastRevision">Last Revised (Recent First)</option>
            <option value="title">Problem Title</option>
            <option value="solveTime">Solve Time (Slowest First)</option>
          </select>
        </div>

        {/* Clear Filters Reset */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
          >
            <X className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
