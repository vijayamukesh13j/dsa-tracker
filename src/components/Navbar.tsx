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
} from 'lucide-react';
import { Problem } from '../types/problem';
import {
  calculateStreak,
  diffInDays,
  getProblemsSolvedToday,
  getRevisionsDoneToday,
  getTodayISO,
} from '../utils/spacedRepetition';
import { FileSyncStatus } from '../hooks/useProblems';

interface NavbarProps {
  problems: Problem[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAddModal: () => void;
  onOpenDataModal: () => void;
  onOpenFlashcards: () => void;
  onFilterDueToday: () => void;
  fileSyncStatus: FileSyncStatus;
  syncedFileName: string | null;
  // Stopwatch props
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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black tracking-wider text-sm ring-1 ring-white/20">
            DSA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-zinc-100 dark:text-zinc-100">
                DSA Mastery
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Spaced Repetition
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-400 hidden sm:block">
              100% Local • Zero-Backend • Hard Drive Sync
            </p>
          </div>
        </div>

        {/* Center: Live Stats & Timer */}
        <div className="hidden md:flex items-center gap-3">
          {/* Daily Streak */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              streak > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Consecutive days you solved or reviewed problems"
          >
            <Flame className={`h-4 w-4 ${streak > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            <span>{streak}d streak</span>
          </div>

          {/* Solved / Revised Today */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
            title="Activity recorded today"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              <strong className="text-zinc-100">{solvedToday}</strong> new
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              <strong className="text-zinc-100">{revisionsToday}</strong> reviewed
            </span>
          </div>

          {/* Due Revision Alert Pill */}
          {dueOrOverdueCount > 0 ? (
            <button
              onClick={onFilterDueToday}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/25 transition-all animate-pulse"
              title="Click to filter due items"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-rose-400" />
              <span>{dueOrOverdueCount} Due</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>All Caught Up</span>
            </div>
          )}

          {/* Mini Stopwatch Widget */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300">
            <Clock className={`h-3.5 w-3.5 ${isTimerRunning ? 'text-emerald-400 animate-spin' : 'text-zinc-500'}`} />
            <span className="font-mono font-medium tracking-wider w-12 text-center text-zinc-100">
              {timerFormatted}
            </span>
            <button
              onClick={onToggleTimer}
              className="p-1 hover:text-white rounded hover:bg-zinc-800 transition"
              title={isTimerRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
            >
              {isTimerRunning ? <Pause className="h-3 w-3 text-amber-400" /> : <Play className="h-3 w-3 text-emerald-400" />}
            </button>
            <button
              onClick={onResetTimer}
              className="p-1 hover:text-white rounded hover:bg-zinc-800 transition"
              title="Reset Stopwatch"
            >
              <RotateCcw className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Review / Flashcard mode button */}
          <button
            onClick={onOpenFlashcards}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500/20 to-emerald-500/20 hover:from-teal-500/30 hover:to-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Flashcards</span>
            {dueOrOverdueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-zinc-950 font-bold">
                {dueOrOverdueCount}
              </span>
            )}
          </button>

          {/* File Sync Status Button */}
          <button
            onClick={onOpenDataModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
              fileSyncStatus === 'synced' || fileSyncStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : fileSyncStatus === 'saving'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            title="Local File Sync & Backup options"
          >
            <HardDrive className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">
              {syncedFileName ? syncedFileName : 'Disk Sync'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          {/* Add Problem Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 text-xs font-bold transition shadow-sm shadow-emerald-500/20"
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
