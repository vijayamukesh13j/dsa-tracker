import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  AlertOctagon,
  Code2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ConfidenceLevel, Problem } from '../types/problem';
import { CONFIDENCE_CONFIG } from '../types/problem';
import { PLATFORM_CONFIG } from '../utils/urlParser';
import { getRelativeRevisionString } from '../utils/spacedRepetition';

interface FlashcardReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Problem[];
  onLogRevision: (
    id: string,
    newConfidence: ConfidenceLevel,
    solveTimeMinutes?: number,
    revisionNote?: string
  ) => void;
}

export const FlashcardReviewModal: React.FC<FlashcardReviewModalProps> = ({
  isOpen,
  onClose,
  queue,
  onLogRevision,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const remainingProblems = queue.filter((p) => !reviewedIds.has(p.id));
  const currentProblem = remainingProblems[currentIndex] || remainingProblems[0];

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex, currentProblem?.id]);

  // Keyboard navigation & rating shortcuts
  useEffect(() => {
    if (!isOpen || sessionCompleted || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const level = parseInt(e.key, 10) as ConfidenceLevel;
        handleRate(level);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, sessionCompleted, currentProblem, isFlipped, remainingProblems.length]);

  if (!isOpen) return null;

  const handleRate = (level: ConfidenceLevel) => {
    if (!currentProblem) return;

    onLogRevision(currentProblem.id, level);

    const nextReviewed = new Set(reviewedIds);
    nextReviewed.add(currentProblem.id);
    setReviewedIds(nextReviewed);

    if (nextReviewed.size >= queue.length) {
      setSessionCompleted(true);
      confetti({
        particleCount: 130,
        spread: 75,
        origin: { y: 0.6 },
      });
    } else {
      setIsFlipped(false);
      if (currentIndex >= remainingProblems.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleNext = () => {
    if (remainingProblems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % remainingProblems.length);
    setIsFlipped(false);
  };

  const handlePrev = () => {
    if (remainingProblems.length <= 1) return;
    setCurrentIndex(
      (prev) => (prev - 1 + remainingProblems.length) % remainingProblems.length
    );
    setIsFlipped(false);
  };

  const resetSession = () => {
    setReviewedIds(new Set());
    setSessionCompleted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden text-slate-900 dark:text-zinc-100 relative animate-float-up">
        {/* Modal Top Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-zinc-100">
                3D Spaced Repetition Deck
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                <span className="sm:hidden">Tap card to flip • Tap 1-5 to rate</span>
                <span className="hidden sm:inline">
                  Press <kbd className="font-mono">Space</kbd> to flip card • <kbd className="font-mono">1-5</kbd> to rate recall
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!sessionCompleted && queue.length > 0 && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                {reviewedIds.size} / {queue.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {sessionCompleted || remainingProblems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-4 my-auto">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              Queue Complete! 🎉
            </h4>
            <p className="text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
              You reviewed {reviewedIds.size} scheduled problems. Next revision dates have been calculated and persisted automatically.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={resetSession}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-700 dark:text-zinc-200 transition"
              >
                Practice Deck Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-sm"
              >
                Finish & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Card Progress & Navigation Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={remainingProblems.length <= 1}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Previous Card (Left Arrow)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-slate-700 dark:text-zinc-200 font-mono">
                  Card {currentIndex + 1} of {remainingProblems.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={remainingProblems.length <= 1}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Next Card (Right Arrow)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  getRelativeRevisionString(currentProblem.nextRevisionDate).color
                }`}
              >
                {getRelativeRevisionString(currentProblem.nextRevisionDate).text}
              </span>
            </div>

            {/* 3D Flip Card Container */}
            <div className="perspective-1000 w-full">
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className={`relative w-full min-h-[310px] transition-transform duration-500 preserve-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT OF FLASHCARD */}
                <div
                  className={`w-full min-h-[310px] rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100/80 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-lg p-6 flex flex-col justify-between backface-hidden ${
                    isFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          PLATFORM_CONFIG[currentProblem.platform || 'other'].bg
                        } ${PLATFORM_CONFIG[currentProblem.platform || 'other'].border} ${
                          PLATFORM_CONFIG[currentProblem.platform || 'other'].color
                        }`}
                      >
                        {PLATFORM_CONFIG[currentProblem.platform || 'other'].name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          currentProblem.difficulty === 'Easy'
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : currentProblem.difficulty === 'Medium'
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}
                      >
                        {currentProblem.difficulty}
                      </span>
                    </div>

                    {currentProblem.solveTimeMinutes && (
                      <div className="flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-zinc-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{currentProblem.solveTimeMinutes}m</span>
                      </div>
                    )}
                  </div>

                  {/* Center Prompt */}
                  <div className="my-auto py-6 text-center space-y-3">
                    <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      Recall Challenge • Rev #{currentProblem.revisionCount}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center justify-center gap-2">
                      <span>{currentProblem.title}</span>
                      {currentProblem.url && (
                        <a
                          href={currentProblem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-emerald-500 transition"
                          title="Open problem on platform"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto">
                      Think through the optimal data structure, key intuition, and time/space complexity before flipping!
                    </p>
                  </div>

                  {/* Footer of Front Card */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200/70 dark:border-zinc-800/80">
                    <div className="flex flex-wrap gap-1.5">
                      {currentProblem.patterns.map((pat) => (
                        <span
                          key={pat}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-slate-200/70 dark:bg-zinc-800 border border-slate-300/60 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-medium"
                        >
                          {pat}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <RotateCw className="h-3.5 w-3.5" />
                      <span>Click or Space to Flip</span>
                    </span>
                  </div>
                </div>

                {/* BACK OF FLASHCARD (Rotated 180deg in 3D space) */}
                <div
                  className={`absolute inset-0 w-full min-h-[310px] rounded-2xl bg-white dark:bg-zinc-950 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl p-5 overflow-y-auto space-y-3.5 backface-hidden rotate-y-180 ${
                    !isFlipped ? 'pointer-events-none' : ''
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {currentProblem.title} — Solution Notes
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                      <RotateCw className="h-3 w-3" />
                      <span>Flip back</span>
                    </span>
                  </div>

                  {/* Key Intuition */}
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Key Intuition / "Aha!" Moment</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                      {currentProblem.notes.keyIntuition || 'No intuition recorded.'}
                    </p>
                  </div>

                  {/* Mistakes */}
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                      <AlertOctagon className="h-3.5 w-3.5" />
                      <span>Mistakes & Edge Cases Missed</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed">
                      {currentProblem.notes.mistakes || 'No mistakes recorded.'}
                    </p>
                  </div>

                  {/* Complexities */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-slate-700 dark:text-zinc-300">
                      Time: <strong className="text-indigo-600 dark:text-indigo-400">{currentProblem.notes.timeComplexity || 'N/A'}</strong>
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-mono text-slate-700 dark:text-zinc-300">
                      Space: <strong className="text-indigo-600 dark:text-indigo-400">{currentProblem.notes.spaceComplexity || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Code Snippet */}
                  {currentProblem.notes.codeSnippet && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-900 dark:bg-zinc-900 overflow-hidden text-xs cursor-auto"
                    >
                      <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                        <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Reference Code</span>
                      </div>
                      <pre className="p-3 font-mono text-zinc-100 overflow-x-auto text-[11px] leading-relaxed max-h-40">
                        <code>{currentProblem.notes.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bottom: Quick 1-5 Confidence Selector Bar */}
        {!sessionCompleted && currentProblem && (
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/90 dark:bg-zinc-950/80">
            <div className="text-center text-xs text-slate-600 dark:text-zinc-400 mb-2.5 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                How well did you recall the solution? (Click or press keys{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-mono text-[10px]">
                  1
                </kbd>{' '}
                to{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-mono text-[10px]">
                  5
                </kbd>
                )
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => {
                const conf = CONFIDENCE_CONFIG[level];
                return (
                  <button
                    key={level}
                    onClick={() => handleRate(level)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all hover:-translate-y-0.5 active:translate-y-0 ${conf.bg} ${conf.border} hover:ring-2 hover:ring-emerald-500/40`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <span className={conf.badgeText}>{level}</span>
                      <span className="text-slate-800 dark:text-zinc-200 hidden sm:inline">
                        {conf.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 font-mono">
                      +{conf.intervalDays}d
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
