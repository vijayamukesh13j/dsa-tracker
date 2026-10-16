import React from 'react';
import {
  Flame,
  Plus,
  Moon,
  Sun,
  HardDrive,
  Search,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import { calculateStreak } from '../utils/spacedRepetition';
import type { FileSyncStatus } from '../hooks/useProblems';

interface NavbarProps {
  problems: Problem[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenCommandPalette: () => void;
  fileSyncStatus: FileSyncStatus;
  syncedFileName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  problems,
  isDark,
  onToggleTheme,
  onOpenAddModal,
  onOpenDataModal,
  onOpenCommandPalette,
  fileSyncStatus,
  syncedFileName,
}) => {
  const streak = calculateStreak(problems);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Custom Logo + Brand Title */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="./logo.svg"
            alt="DSA Mastery Logo"
            className="h-8 w-8 rounded-lg shadow-sm shadow-emerald-500/20 select-none"
          />
          <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-zinc-100">
            DSA Mastery
          </span>
        </div>

        {/* Center: Clean Raycast/Linear-style Command Search Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="flex-1 max-w-md flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/60 dark:bg-zinc-900/90 dark:hover:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 transition group"
          title="Open Command Palette (Ctrl+K)"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition shrink-0" />
            <span className="truncate">Search problems or run command...</span>
          </span>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 shrink-0">
            Ctrl K
          </kbd>
        </button>

        {/* Right: Streak Badge + 3 Clean Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Daily Streak Badge */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              streak > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400'
            }`}
            title={`Practice Streak: ${streak} consecutive ${streak === 1 ? 'day' : 'days'}`}
          >
            <Flame
              className={`h-3.5 w-3.5 ${
                streak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
            <span className="font-mono">{streak}d</span>
          </div>

          {/* Disk Sync & Data Backup */}
          <button
            onClick={onOpenDataModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition ${
              fileSyncStatus === 'synced' || fileSyncStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
            title="Data Backup & Local File Sync"
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span className="hidden md:inline max-w-[100px] truncate">
              {syncedFileName ? syncedFileName : 'Backup / Sync'}
            </span>
          </button>

          {/* Theme Toggle Icon Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition"
            title={isDark ? 'Switch to Light Mode (T)' : 'Switch to Dark Mode (T)'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Primary CTA: Add Problem */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 text-xs font-bold transition shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Problem</span>
          </button>
        </div>
      </div>
    </header>
  );
};
