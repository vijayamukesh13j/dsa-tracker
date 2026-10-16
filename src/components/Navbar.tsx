import React from 'react';
import {
  Flame,
  Clock,
  Plus,
  Moon,
  Sun,
  HardDrive,
  CalendarCheck,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import {
  calculateStreak,
  diffInDays,
  getProblemsSolvedToday,
  getRevisionsDoneToday,
  getTodayISO,
} from '../utils/spacedRepetition';
import type { FileSyncStatus } from '../hooks/useProblems';

interface NavbarProps {
  problems: Problem[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenFlashcards: () => void;
  onOpenCommandPalette: () => void;
  onFilterDueToday: () => void;
  fileSyncStatus: FileSyncStatus;
  syncedFileName: string | null;
  timerFormatted: string;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  problems,
  isDark,
  onToggleTheme,
  onOpenAddModal,
  onOpenDataModal,
  onOpenFlashcards,
  onOpenCommandPalette,
  onFilterDueToday,
  fileSyncStatus,
  syncedFileName,
  timerFormatted,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
}) => {
  const streak = calculateStreak(problems);
  const solvedToday = getProblemsSolvedToday(problems);
  const revisionsToday = getRevisionsDoneToday(problems);

  const today = getTodayISO();
  const dueOrOverdueCount = problems.filter((p) => {
    return diffInDays(p.nextRevisionDate, today) <= 0;
  }).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-[#09090b]/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Branding & Command Trigger */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black tracking-wider text-xs ring-1 ring-white/25">
            DSA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-zinc-100">
                DSA Mastery
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Spaced Repetition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
              Local-First Vault • Hard Drive Sync
            </p>
          </div>

          {/* Command Palette Pill Trigger (Raycast style) */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden lg:flex items-center gap-2.5 ml-3 px-3 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 dark:bg-zinc-900 dark:hover:bg-zinc-800/90 border border-slate-200/90 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 transition group"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition" />
            <span>Quick Command...</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Center: Live Stats & Timer */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Daily Streak */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              streak > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400'
            }`}
            title="Consecutive days you solved or reviewed problems"
          >
            <Flame className={`h-3.5 w-3.5 ${streak > 0 ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span className="font-mono">{streak}d</span>
          </div>

          {/* Solved / Revised Today */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-300"
            title="Activity recorded today"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              <strong className="text-slate-900 dark:text-zinc-100 font-mono">{solvedToday}</strong> new
            </span>
            <span className="text-slate-300 dark:text-zinc-700">•</span>
            <span>
              <strong className="text-slate-900 dark:text-zinc-100 font-mono">{revisionsToday}</strong> rev
            </span>
          </div>

          {/* Due Revision Alert Pill */}
          {dueOrOverdueCount > 0 ? (
            <button
              onClick={onFilterDueToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold transition-all"
              title="Click to filter due items"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-rose-500" />
              <span>{dueOrOverdueCount} Due</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Caught Up</span>
            </div>
          )}

          {/* Mini Stopwatch Widget */}
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs">
            <Clock className={`h-3.5 w-3.5 ${isTimerRunning ? 'text-emerald-500 animate-spin' : 'text-slate-400 dark:text-zinc-500'}`} />
            <span className="font-mono font-semibold tracking-wider w-12 text-center text-slate-800 dark:text-zinc-100">
              {timerFormatted}
            </span>
            <button
              onClick={onToggleTimer}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
              title={isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
            >
              {isTimerRunning ? (
                <Pause className="h-3 w-3 text-amber-500" />
              ) : (
                <Play className="h-3 w-3 text-emerald-500" />
              )}
            </button>
            <button
              onClick={onResetTimer}
              className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-zinc-800 transition text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              title="Reset Stopwatch"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Command Trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition"
            title="Command Palette (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* 3D Flashcards Mode Button */}
          <button
            onClick={onOpenFlashcards}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>3D Flashcards</span>
            {dueOrOverdueCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-zinc-950 font-extrabold">
                {dueOrOverdueCount}
              </span>
            )}
          </button>

          {/* File Sync Status Button */}
          <button
            onClick={onOpenDataModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
              fileSyncStatus === 'synced' || fileSyncStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : fileSyncStatus === 'saving'
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 animate-pulse'
                : 'bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
            title="Local File Sync & Backup options"
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span className="hidden xl:inline max-w-[110px] truncate">
              {syncedFileName ? syncedFileName : 'Disk Sync'}
            </span>
          </button>

          {/* Theme Toggle (Light / Dark Mode) */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition"
            title={isDark ? 'Switch to Light Mode (T)' : 'Switch to Dark Mode (T)'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Add Problem Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 text-xs font-extrabold transition shadow-sm shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Problem</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
