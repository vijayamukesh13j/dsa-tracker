import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ConfidenceLevel, FilterState, Problem } from './types/problem';
import { useProblems } from './hooks/useProblems';
import { useTheme } from './hooks/useTheme';
import { useStopwatch } from './hooks/useStopwatch';
import { diffInDays, getTodayISO } from './utils/spacedRepetition';
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

  // Keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        return;
      }

      if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setEditingProblem(null);
        setIsAddEditModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filter & Sort Logic
  const filteredProblems = useMemo(() => {
    const today = getTodayISO();

    return problems
      .filter((p) => {
        // Full text search
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

        // Pattern filter
        if (filter.pattern && !p.patterns.includes(filter.pattern)) {
          return false;
        }

        // Difficulty filter
        if (filter.difficulty && p.difficulty !== filter.difficulty) {
          return false;
        }

        // Confidence filter
        if (filter.confidence && String(p.confidence) !== filter.confidence) {
          return false;
        }

        // Platform filter
        if (filter.platform && p.platform !== filter.platform) {
          return false;
        }

        // Status filter
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
            // Sort soonest next revision first (most overdue first)
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

  // Flashcards queue: problems due today or overdue
  const flashcardQueue = useMemo(() => {
    const today = getTodayISO();
    const dueItems = problems.filter((p) => diffInDays(p.nextRevisionDate, today) <= 0);
    // If none are due today, allow reviewing any problem
    return dueItems.length > 0 ? dueItems : problems;
  }, [problems]);

  // All distinct patterns for filter dropdown
  const availablePatterns = useMemo(() => {
    const set = new Set<string>();
    problems.forEach((p) => p.patterns.forEach((pat) => set.add(pat)));
    return Array.from(set);
  }, [problems]);

  // Action handlers
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
    } else {
      addProblem(formData);
    }
    setIsAddEditModalOpen(false);
    setEditingProblem(null);
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
    logRevision(id, newConfidence, solveTimeMinutes, revisionNote);
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
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Navigation */}
      <Navbar
        problems={problems}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onOpenFlashcards={() => setIsFlashcardsOpen(true)}
        onFilterDueToday={handleFilterDueToday}
        fileSyncStatus={fileSyncStatus}
        syncedFileName={syncedFileName}
        timerFormatted={formattedTime}
        isTimerRunning={isTimerRunning}
        onToggleTimer={toggleTimer}
        onResetTimer={resetTimer}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
        <div className="pt-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Problem Mastery Vault</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  {problems.length} total
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Search, filter, inspect full code & notes, or log instant spaced revisions
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFlashcardsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Spaced Review Queue</span>
              </button>

              <button
                onClick={() => handleOpenAddModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-xs"
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
              onDeleteProblem={deleteProblem}
              onFilterPattern={handleSelectPattern}
            />
          ) : (
            <ProblemCardGrid
              problems={filteredProblems}
              onOpenQuickRevision={handleOpenQuickRevision}
              onOpenDetailModal={handleOpenDetailModal}
              onOpenEditModal={handleOpenEditModal}
              onDeleteProblem={deleteProblem}
              onFilterPattern={handleSelectPattern}
            />
          )}
        </div>
      </main>

      {/* Floating Mock Timer Widget */}
      <StopwatchFloating
        formattedTime={formattedTime}
        isRunning={isTimerRunning}
        onToggle={toggleTimer}
        onReset={resetTimer}
        onLogWithTimer={() => handleOpenAddModal(elapsedMinutes)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>DSA Mastery & Spaced Repetition Tracker</span>
            <span>•</span>
            <span className="text-zinc-600">Local-First Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Export / Import Data
            </button>
            <span>•</span>
            <button
              onClick={() => setIsFlashcardsOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Flashcard Mode
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenAddModal()}
              className="hover:text-emerald-400 transition"
            >
              New Problem (N)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
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
          onDeleteProblem={deleteProblem}
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
          onSaveToDisk={saveCurrentToLocalFile}
          onDisconnectFile={disconnectFile}
          onImportProblems={importProblems}
          onResetToSamples={resetToSamples}
          onClearAll={clearAllProblems}
        />
      )}
    </div>
  );
}
