import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Command, Layers, Plus, Search, HardDrive, BookOpen } from 'lucide-react';
import {
  type ConfidenceLevel,
  CONFIDENCE_CONFIG,
  type FilterState,
  type Problem,
} from './types/problem';
import { useProblems } from './hooks/useProblems';
import { useTheme } from './hooks/useTheme';
import { useStopwatch } from './hooks/useStopwatch';
import { diffInDays, getTodayISO } from './utils/spacedRepetition';
import { exportDatabaseToJson, exportProblemsToCsv } from './utils/exportImport';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { Heatmap90Days } from './components/Heatmap90Days';
import { PatternAnalytics } from './components/PatternAnalytics';
import { ProblemFilters } from './components/ProblemFilters';
import { ProblemTable } from './components/ProblemTable';
import { ProblemCardGrid } from './components/ProblemCardGrid';
import { ProblemFormModal } from './components/ProblemFormModal';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { QuickRevisionModal } from './components/QuickRevisionModal';
import { FlashcardReviewModal } from './components/FlashcardReviewModal';
import { DataSyncModal } from './components/DataSyncModal';
import { StopwatchFloating } from './components/StopwatchFloating';
import { ToastContainer, type ToastMessage, type ToastType } from './components/ToastContainer';
import { CommandPaletteModal } from './components/CommandPaletteModal';

export default function App() {
  const {
    problems,
    addProblem,
    updateProblem,
    deleteProblem,
    logRevision,
    resetToSamples,
    clearAllProblems,
    importProblems,
    isFileSystemSupported,
    syncedFileName,
    fileSyncStatus,
    syncErrorMessage,
    connectNewLocalFile,
    openExistingLocalFile,
    saveCurrentToLocalFile,
    disconnectFile,
  } = useProblems();

  const { isDark, toggleTheme } = useTheme();

  const {
    formattedTime,
    isRunning: isTimerRunning,
    toggle: toggleTimer,
    reset: resetTimer,
    pause: pauseTimer,
    elapsedMinutes,
  } = useStopwatch();

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (title: string, description?: string, type: ToastType = 'success') => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3900);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Filter & View states
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    pattern: '',
    difficulty: '',
    confidence: '',
    status: '',
    platform: '',
    sortBy: 'nextRevision',
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailProblem, setDetailProblem] = useState<Problem | null>(null);
  const [isQuickRevisionOpen, setIsQuickRevisionOpen] = useState<boolean>(false);
  const [quickRevisionProblem, setQuickRevisionProblem] = useState<Problem | null>(null);
  const [isFlashcardsOpen, setIsFlashcardsOpen] = useState<boolean>(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts (Ctrl+K, N, F, T, V, /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        return;
      }

      if (
        isAddEditModalOpen ||
        isDetailModalOpen ||
        isQuickRevisionOpen ||
        isFlashcardsOpen ||
        isDataModalOpen ||
        isCommandPaletteOpen
      ) {
        return;
      }

      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setEditingProblem(null);
        setIsAddEditModalOpen(true);
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsFlashcardsOpen(true);
      } else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
      } else if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setViewMode((prev) => (prev === 'table' ? 'cards' : 'table'));
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isAddEditModalOpen,
    isDetailModalOpen,
    isQuickRevisionOpen,
    isFlashcardsOpen,
    isDataModalOpen,
    isCommandPaletteOpen,
    toggleTheme,
  ]);

  // Filter & Sort Logic
  const filteredProblems = useMemo(() => {
    const today = getTodayISO();

    return problems
      .filter((p) => {
        if (filter.search.trim()) {
          const q = filter.search.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchNumber = p.problemNumber?.toLowerCase().includes(q);
          const matchPatterns = p.patterns.some((pat) => pat.toLowerCase().includes(q));
          const matchIntuition = p.notes.keyIntuition?.toLowerCase().includes(q);
          const matchMistakes = p.notes.mistakes?.toLowerCase().includes(q);
          const matchCode = p.notes.codeSnippet?.toLowerCase().includes(q);

          if (
            !matchTitle &&
            !matchNumber &&
            !matchPatterns &&
            !matchIntuition &&
            !matchMistakes &&
            !matchCode
          ) {
            return false;
          }
        }

        if (filter.pattern && !p.patterns.includes(filter.pattern)) {
          return false;
        }

        if (filter.difficulty && p.difficulty !== filter.difficulty) {
          return false;
        }

        if (filter.confidence && String(p.confidence) !== filter.confidence) {
          return false;
        }

        if (filter.platform && p.platform !== filter.platform) {
          return false;
        }

        if (filter.status) {
          const diff = diffInDays(p.nextRevisionDate, today);
          if (filter.status === 'overdue' && diff >= 0) return false;
          if (filter.status === 'due_today' && diff !== 0) return false;
          if (filter.status === 'upcoming' && diff <= 0) return false;
          if (filter.status === 'mastered' && p.confidence !== 5) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const todayStr = getTodayISO();

        switch (filter.sortBy) {
          case 'nextRevision': {
            const diffA = diffInDays(a.nextRevisionDate, todayStr);
            const diffB = diffInDays(b.nextRevisionDate, todayStr);
            return diffA - diffB;
          }
          case 'confidenceAsc':
            return a.confidence - b.confidence;
          case 'confidenceDesc':
            return b.confidence - a.confidence;
          case 'lastRevision':
            return (b.lastRevisionDate || '').localeCompare(a.lastRevisionDate || '');
          case 'title':
            return a.title.localeCompare(b.title);
          case 'solveTime':
            return (b.solveTimeMinutes || 0) - (a.solveTimeMinutes || 0);
          default:
            return 0;
        }
      });
  }, [problems, filter]);

  const dueCount = useMemo(() => {
    const today = getTodayISO();
    return problems.filter((p) => diffInDays(p.nextRevisionDate, today) <= 0).length;
  }, [problems]);

  const flashcardQueue = useMemo(() => {
    const today = getTodayISO();
    const dueItems = problems.filter((p) => diffInDays(p.nextRevisionDate, today) <= 0);
    return dueItems.length > 0 ? dueItems : problems;
  }, [problems]);

  const availablePatterns = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => p.patterns.forEach((pat) => set.add(pat)));
    return Array.from(set);
  }, [problems]);

  // Action handlers with Toast Notifications
  const handleOpenAddModal = (withTimerMinutes?: number) => {
    setEditingProblem(null);
    setIsAddEditModalOpen(true);
    if (withTimerMinutes) {
      pauseTimer();
    }
  };

  const handleOpenEditModal = (problem: Problem) => {
    setEditingProblem(problem);
    setIsAddEditModalOpen(true);
  };

  const handleSaveProblem = (formData: any) => {
    if (editingProblem) {
      updateProblem(editingProblem.id, formData);
      pushToast('Problem Updated', `"${formData.title}" has been saved to your vault.`);
    } else {
      addProblem(formData);
      pushToast(
        'Problem Added to Vault',
        `"${formData.title}" scheduled for spaced repetition.`
      );
    }
    setIsAddEditModalOpen(false);
    setEditingProblem(null);
  };

  const handleDeleteProblem = (id: string) => {
    const target = problems.find((p) => p.id === id);
    deleteProblem(id);
    pushToast(
      'Problem Removed',
      target ? `"${target.title}" was deleted.` : 'Problem deleted.',
      'warning'
    );
  };

  const handleOpenQuickRevision = (problem: Problem) => {
    setQuickRevisionProblem(problem);
    setIsQuickRevisionOpen(true);
  };

  const handleLogRevision = (
    id: string,
    newConfidence: ConfidenceLevel,
    solveTimeMinutes?: number,
    revisionNote?: string
  ) => {
    const target = problems.find((p) => p.id === id);
    logRevision(id, newConfidence, solveTimeMinutes, revisionNote);
    const confMeta = CONFIDENCE_CONFIG[newConfidence];
    pushToast(
      `Revision Logged (+${confMeta.intervalDays}d)`,
      target
        ? `${target.title} rated Lvl ${newConfidence} (${confMeta.label}).`
        : `Scheduled +${confMeta.intervalDays} days out.`
    );
  };

  const handleOpenDetailModal = (problem: Problem) => {
    setDetailProblem(problem);
    setIsDetailModalOpen(true);
  };

  const handleFilterDueToday = () => {
    setFilter((prev) => ({
      ...prev,
      status: prev.status === 'due_today' || prev.status === 'overdue' ? '' : 'due_today',
    }));
  };

  const handleSelectPattern = (pattern: string) => {
    setFilter((prev) => ({
      ...prev,
      pattern: prev.pattern === pattern ? '' : pattern,
    }));
  };

  const handleResetFilters = () => {
    setFilter({
      search: '',
      pattern: '',
      difficulty: '',
      confidence: '',
      status: '',
      platform: '',
      sortBy: 'nextRevision',
    });
    pushToast('Filters Cleared', 'Showing all problems in your vault.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-600 dark:selection:text-emerald-300 transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        problems={problems}
        isDark={isDark}
        onToggleTheme={() => {
          toggleTheme();
          pushToast(
            isDark ? 'Light Mode Enabled' : 'Dark Mode Enabled',
            'Theme preference saved locally.',
            'info'
          );
        }}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        fileSyncStatus={fileSyncStatus}
        syncedFileName={syncedFileName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">
        {/* Top KPI Cards */}
        <DashboardStats
          problems={problems}
          onOpenFlashcards={() => setIsFlashcardsOpen(true)}
          onFilterDue={handleFilterDueToday}
          onSelectPattern={handleSelectPattern}
        />

        {/* 90-Day Consistency Heatmap */}
        <Heatmap90Days problems={problems} />

        {/* Pattern Weakness Radar & Breakdown */}
        <PatternAnalytics
          problems={problems}
          selectedPattern={filter.pattern}
          onSelectPattern={handleSelectPattern}
        />

        {/* Problem Explorer Section Header */}
        <div id="problem-vault" className="pt-1 sm:pt-2 space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Problem Mastery Vault</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-200/80 dark:bg-zinc-900 border border-slate-300/60 dark:border-zinc-800 text-slate-700 dark:text-zinc-400">
                  {problems.length} total
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Search, filter, inspect full code & notes
                <span className="hidden sm:inline">
                  , or press{' '}
                  <kbd className="px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-zinc-800 font-mono text-[10px]">
                    Ctrl K
                  </kbd>{' '}
                  for instant commands
                </span>
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setIsFlashcardsOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold transition shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                <span>3D Flashcard Deck (F)</span>
              </button>

              <button
                onClick={() => handleOpenAddModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold transition shadow-sm shadow-emerald-500/20"
              >
                <span>+ Add Problem (N)</span>
              </button>
            </div>
          </div>

          {/* Search, Filter Pills & View Mode */}
          <ProblemFilters
            filter={filter}
            onChangeFilter={(updates) => setFilter((prev) => ({ ...prev, ...updates }))}
            onResetFilters={handleResetFilters}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            totalFilteredCount={filteredProblems.length}
            totalCount={problems.length}
            availablePatterns={availablePatterns}
          />

          {/* Table View or Card Grid View */}
          {viewMode === 'table' ? (
            <ProblemTable
              problems={filteredProblems}
              onOpenQuickRevision={handleOpenQuickRevision}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteProblem={handleDeleteProblem}
              onFilterPattern={handleSelectPattern}
              onCopyCodeNotify={(title) =>
                pushToast('Code Copied to Clipboard', `Copied solution for "${title}".`, 'info')
              }
            />
          ) : (
            <ProblemCardGrid
              problems={filteredProblems}
              onOpenQuickRevision={handleOpenQuickRevision}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteProblem={handleDeleteProblem}
              onFilterPattern={handleSelectPattern}
            />
          )}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (< 640px) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-zinc-800/90 px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => {
            document.getElementById('problem-vault')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-[10px] font-bold">Vault</span>
        </button>

        <button
          onClick={() => setIsFlashcardsOpen(true)}
          className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <Layers className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-bold">3D Deck</span>
          {dueCount > 0 && (
            <span className="absolute top-0.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold flex items-center justify-center">
              {dueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center justify-center gap-1 px-3.5 py-2 rounded-2xl bg-emerald-500 active:bg-emerald-600 text-zinc-950 text-xs font-extrabold shadow-md shadow-emerald-500/25 transition"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add</span>
        </button>

        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <Search className="h-4 w-4" />
          <span className="text-[10px] font-bold">Search</span>
        </button>

        <button
          onClick={() => setIsDataModalOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <HardDrive className="h-4 w-4" />
          <span className="text-[10px] font-bold">Sync</span>
        </button>
      </nav>

      {/* Floating Mock Timer Widget */}
      <StopwatchFloating
        formattedTime={formattedTime}
        isRunning={isTimerRunning}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onLogWithTimer={() => handleOpenAddModal(elapsedMinutes)}
      />

      {/* Sleek Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-zinc-900 pt-6 pb-20 sm:pb-6 text-center text-xs text-slate-500 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">
              DSA Mastery & Spaced Repetition Tracker
            </span>
            <span className="hidden sm:inline">•</span>
            <span>100% Local-First Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-zinc-400 font-medium">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center gap-1"
            >
              <Command className="h-3 w-3" />
              <span>Command Bar</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Export / Import Data
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFlashcardsOpen(true)}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              3D Flashcards
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        problems={problems}
        isDark={isDark}
        viewMode={viewMode}
        isTimerRunning={isTimerRunning}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onToggleTheme={() => {
          toggleTheme();
          pushToast(
            isDark ? 'Light Mode Enabled' : 'Dark Mode Enabled',
            'Theme preference saved locally.',
            'info'
          );
        }}
        onChangeViewMode={setViewMode}
        onToggleTimer={toggleTimer}
        onExportJson={() => {
          exportDatabaseToJson(problems);
          pushToast('JSON Backup Exported', `${problems.length} problems saved to disk.`);
        }}
        onExportCsv={() => {
          exportProblemsToCsv(problems);
          pushToast('CSV Spreadsheet Exported', `${problems.length} problems exported.`);
        }}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onFilterDueToday={handleFilterDueToday}
        onResetFilters={handleResetFilters}
        onSelectProblem={handleOpenDetailModal}
        onQuickReviewProblem={handleOpenQuickRevision}
      />

      {isAddEditModalOpen && (
        <ProblemFormModal
          isOpen={isAddEditModalOpen}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingProblem(null);
          }}
          editingProblem={editingProblem}
          onSaveProblem={handleSaveProblem}
          stopwatchElapsedMinutes={elapsedMinutes}
        />
      )}

      {isDetailModalOpen && (
        <ProblemDetailModal
          problem={detailProblem}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setDetailProblem(null);
          }}
          onOpenQuickRevision={handleOpenQuickRevision}
          onOpenEditModal={handleOpenEditModal}
          onDeleteProblem={handleDeleteProblem}
          onCopyCodeNotify={(title) =>
            pushToast('Code Copied to Clipboard', `Copied solution for "${title}".`, 'info')
          }
        />
      )}

      {isQuickRevisionOpen && (
        <QuickRevisionModal
          problem={quickRevisionProblem}
          isOpen={isQuickRevisionOpen}
          onClose={() => {
            setIsQuickRevisionOpen(false);
            setQuickRevisionProblem(null);
          }}
          onLogRevision={handleLogRevision}
        />
      )}

      {isFlashcardsOpen && (
        <FlashcardReviewModal
          isOpen={isFlashcardsOpen}
          onClose={() => setIsFlashcardsOpen(false)}
          queue={flashcardQueue}
          onLogRevision={handleLogRevision}
        />
      )}

      {isDataModalOpen && (
        <DataSyncModal
          isOpen={isDataModalOpen}
          onClose={() => setIsDataModalOpen(false)}
          problems={problems}
          fileSyncStatus={fileSyncStatus}
          syncedFileName={syncedFileName}
          isFileSystemSupported={isFileSystemSupported}
          syncErrorMessage={syncErrorMessage}
          onConnectNewFile={connectNewLocalFile}
          onOpenExistingFile={openExistingLocalFile}
          onSaveToDisk={() => {
            saveCurrentToLocalFile();
            pushToast('Saved to Local File', `Synced with ${syncedFileName || 'disk'}.`);
          }}
          onDisconnectFile={() => {
            disconnectFile();
            pushToast('Local File Disconnected', 'Using browser localStorage.', 'info');
          }}
          onImportProblems={importProblems}
          onResetToSamples={() => {
            resetToSamples();
            pushToast('Sample Data Restored', 'Loaded 5 curated DSA problems.');
          }}
          onClearAll={() => {
            clearAllProblems();
            pushToast('Vault Cleared', 'All tracked problems have been removed.', 'warning');
          }}
          onNotify={(title, desc) => pushToast(title, desc)}
        />
      )}
    </div>
  );
}
