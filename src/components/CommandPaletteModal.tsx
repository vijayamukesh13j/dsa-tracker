import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Sun,
  Moon,
  LayoutGrid,
  Table as TableIcon,
  Play,
  Pause,
  Download,
  FileSpreadsheet,
  HardDrive,
  RotateCcw,
  Flame,
  ArrowRight,
  Command,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import { CONFIDENCE_CONFIG } from '../types/problem';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  isDark: boolean;
  viewMode: 'table' | 'cards';
  isTimerRunning: boolean;
  onOpenAddModal: () => void;
  onOpenFlashcards: () => void;
  onToggleTheme: () => void;
  onChangeViewMode: (mode: 'table' | 'cards') => void;
  onToggleTimer: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onOpenDataModal: () => void;
  onFilterDueToday: () => void;
  onResetFilters: () => void;
  onSelectProblem: (problem: Problem) => void;
  onQuickReviewProblem: (problem: Problem) => void;
}

interface CommandItem {
  id: string;
  category: 'Quick Actions' | 'Problems';
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  problems,
  isDark,
  viewMode,
  isTimerRunning,
  onOpenAddModal,
  onOpenFlashcards,
  onToggleTheme,
  onChangeViewMode,
  onToggleTimer,
  onExportJson,
  onExportCsv,
  onOpenDataModal,
  onFilterDueToday,
  onResetFilters,
  onSelectProblem,
  onQuickReviewProblem,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [isOpen]);

  const items = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [
      {
        id: 'act-add',
        category: 'Quick Actions',
        title: 'Track New DSA Problem',
        subtitle: 'Log a problem with LeetCode URL auto-slug extraction',
        shortcut: 'N',
        icon: <Plus className="h-4 w-4 text-emerald-500" />,
        action: () => {
          onClose();
          onOpenAddModal();
        },
      },
      {
        id: 'act-flashcards',
        category: 'Quick Actions',
        title: 'Start 3D Spaced Repetition Flashcards',
        subtitle: 'Interactive flip cards for due & overdue problems',
        shortcut: 'F',
        icon: <Sparkles className="h-4 w-4 text-indigo-500" />,
        action: () => {
          onClose();
          onOpenFlashcards();
        },
      },
      {
        id: 'act-theme',
        category: 'Quick Actions',
        title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        subtitle: 'Toggle high-contrast interface theme',
        shortcut: 'T',
        icon: isDark ? (
          <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-500" />
        ),
        action: () => {
          onToggleTheme();
          onClose();
        },
      },
      {
        id: 'act-view',
        category: 'Quick Actions',
        title: viewMode === 'table' ? 'Switch to Card Grid View' : 'Switch to Dense Table View',
        subtitle: 'Change problem vault display layout',
        shortcut: 'V',
        icon:
          viewMode === 'table' ? (
            <LayoutGrid className="h-4 w-4 text-sky-500" />
          ) : (
            <TableIcon className="h-4 w-4 text-sky-500" />
          ),
        action: () => {
          onChangeViewMode(viewMode === 'table' ? 'cards' : 'table');
          onClose();
        },
      },
      {
        id: 'act-timer',
        category: 'Quick Actions',
        title: isTimerRunning ? 'Pause Mock Interview Stopwatch' : 'Start Mock Interview Stopwatch',
        subtitle: 'Track solve speed for your current session',
        icon: isTimerRunning ? (
          <Pause className="h-4 w-4 text-amber-500" />
        ) : (
          <Play className="h-4 w-4 text-emerald-500" />
        ),
        action: () => {
          onToggleTimer();
          onClose();
        },
      },
      {
        id: 'act-due',
        category: 'Quick Actions',
        title: 'Filter Due & Overdue Revisions',
        subtitle: 'Show only problems scheduled for review today',
        icon: <Flame className="h-4 w-4 text-rose-500" />,
        action: () => {
          onFilterDueToday();
          onClose();
        },
      },
      {
        id: 'act-export-json',
        category: 'Quick Actions',
        title: 'Export Full Backup (.json)',
        subtitle: 'Download complete local database to disk',
        icon: <Download className="h-4 w-4 text-emerald-500" />,
        action: () => {
          onExportJson();
          onClose();
        },
      },
      {
        id: 'act-export-csv',
        category: 'Quick Actions',
        title: 'Export Spreadsheet (.csv)',
        subtitle: 'Download problems table for Excel or Notion',
        icon: <FileSpreadsheet className="h-4 w-4 text-teal-500" />,
        action: () => {
          onExportCsv();
          onClose();
        },
      },
      {
        id: 'act-sync',
        category: 'Quick Actions',
        title: 'Open Hard Drive Sync & Data Settings',
        subtitle: 'Manage File System Access API, imports, or sample data',
        icon: <HardDrive className="h-4 w-4 text-indigo-500" />,
        action: () => {
          onClose();
          onOpenDataModal();
        },
      },
      {
        id: 'act-reset',
        category: 'Quick Actions',
        title: 'Clear All Active Search & Filters',
        subtitle: 'Show all tracked problems in vault',
        icon: <RotateCcw className="h-4 w-4 text-slate-400" />,
        action: () => {
          onResetFilters();
          onClose();
        },
      },
    ];

    const problemItems: CommandItem[] = problems.map((p) => {
      const conf = CONFIDENCE_CONFIG[p.confidence];
      return {
        id: `prob-${p.id}`,
        category: 'Problems',
        title: p.title,
        subtitle: `${p.difficulty} • ${p.patterns.join(', ')} • Lvl ${p.confidence} (${conf.label})`,
        icon: (
          <span
            className={`h-5 w-5 rounded flex items-center justify-center text-[10px] font-bold border ${conf.badgeBg} ${conf.border} ${conf.badgeText}`}
          >
            {p.confidence}
          </span>
        ),
        action: () => {
          onClose();
          onSelectProblem(p);
        },
        secondaryAction: {
          label: 'Review',
          onClick: () => {
            onClose();
            onQuickReviewProblem(p);
          },
        },
      };
    });

    const all = [...actions, ...problemItems];
    if (!query.trim()) return all;

    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
  }, [
    problems,
    query,
    isDark,
    viewMode,
    isTimerRunning,
    onClose,
    onOpenAddModal,
    onOpenFlashcards,
    onToggleTheme,
    onChangeViewMode,
    onToggleTimer,
    onExportJson,
    onExportCsv,
    onOpenDataModal,
    onFilterDueToday,
    onResetFilters,
    onSelectProblem,
    onQuickReviewProblem,
  ]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          items.length > 0 ? (prev - 1 + items.length) % items.length : 0
        );
      } else if (e.key === 'Enter' && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items, selectedIndex, onClose]);

  if (!isOpen) return null;

  const quickActions = items.filter((i) => i.category === 'Quick Actions');
  const problemResults = items.filter((i) => i.category === 'Problems');

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] p-4 bg-slate-900/50 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100 animate-float-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Top Bar */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 bg-slate-50/70 dark:bg-zinc-950/50">
          <Search className="h-4 w-4 text-emerald-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search DSA problems, patterns, actions..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-200/80 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-300/60 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {items.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500">
              No matching commands or problems found for "{query}".
            </div>
          ) : (
            <>
              {quickActions.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Quick Actions
                  </div>
                  <div className="space-y-0.5">
                    {quickActions.map((item) => {
                      const globalIdx = items.indexOf(item);
                      const isActive = globalIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onClick={item.action}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700/70">
                              {item.icon}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold truncate">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {item.shortcut && (
                              <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                                {item.shortcut}
                              </kbd>
                            )}
                            <ArrowRight
                              className={`h-3.5 w-3.5 transition-transform ${
                                isActive
                                  ? 'text-emerald-500 translate-x-0.5'
                                  : 'text-slate-300 dark:text-zinc-700'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {problemResults.length > 0 && (
                <div>
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Tracked Problems ({problemResults.length})
                  </div>
                  <div className="space-y-0.5">
                    {problemResults.map((item) => {
                      const globalIdx = items.indexOf(item);
                      const isActive = globalIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onClick={item.action}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-slate-900 dark:text-white'
                              : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.icon}
                            <div className="truncate">
                              <div className="text-xs font-semibold truncate">
                                {item.title}
                              </div>
                              {item.subtitle && (
                                <div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            {item.secondaryAction && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  item.secondaryAction!.onClick();
                                }}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 transition"
                              >
                                {item.secondaryAction.label}
                              </button>
                            )}
                            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                              Inspect
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hints */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/70 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 font-mono text-[10px]">
                ↵
              </kbd>
              Execute
            </span>
          </div>
          <div className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <Command className="h-3 w-3" />
            <span>DSA Command Bar</span>
          </div>
        </div>
      </div>
    </div>
  );
};
