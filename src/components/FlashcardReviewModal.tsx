import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  AlertOctagon,
  Code2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ConfidenceLevel,
  CONFIDENCE_CONFIG,
  Problem,
} from '../types/problem';
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
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  // Filter problems in current queue that haven't been reviewed in this modal session yet
  const remainingProblems = queue.filter((p) => !reviewedIds.has(p.id));
  const currentProblem = remainingProblems[currentIndex] || remainingProblems[0];

  useEffect(() => {
    setIsRevealed(false);
  }, [currentIndex, currentProblem?.id]);

  // Keyboard navigation & rating shortcuts
  useEffect(() => {
    if (!isOpen || sessionCompleted || !currentProblem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === ' ' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
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
  }, [isOpen, sessionCompleted, currentProblem, isRevealed, remainingProblems.length]);

  if (!isOpen) return null;

  const handleRate = (level: ConfidenceLevel) => {
    if (!currentProblem) return;

    onLogRevision(currentProblem.id, level);

    const nextReviewed = new Set(reviewedIds);
    nextReviewed.add(currentProblem.id);
    setReviewedIds(nextReviewed);

    // If that was the last remaining problem, complete!
    if (nextReviewed.size >= queue.length) {
      setSessionCompleted(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setIsRevealed(false);
      // Keep index in bound
      if (currentIndex >= remainingProblems.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleNext = () => {
    if (remainingProblems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % remainingProblems.length);
    setIsRevealed(false);
  };

  const handlePrev = () => {
    if (remainingProblems.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + remainingProblems.length) % remainingProblems.length);
    setIsRevealed(false);
  };

  const resetSession = () => {
    setReviewedIds(new Set());
    setSessionCompleted(false);
    setCurrentIndex(0);
    setIsRevealed(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100 relative">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-tight text-zinc-100">
              Spaced Repetition Flashcard Mode
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {!sessionCompleted && queue.length > 0 && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                {reviewedIds.size} of {queue.length} reviewed
              </span>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {sessionCompleted || remainingProblems.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-4 my-auto">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <h4 className="text-2xl font-extrabold text-zinc-100">
              All Caught Up for Today! 🎉
            </h4>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              You reviewed {reviewedIds.size} scheduled problems. Next revision dates have been automatically recalculated and saved to your database!
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={resetSession}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
              >
                Review Again
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-sm"
              >
                Done & Return
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Card Progress / Navigation Header */}
            <div className="flex items-center justify-between text-xs text-zinc-400 pb-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={remainingProblems.length <= 1}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Previous Card (Left Arrow)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-semibold text-zinc-200">
                  Card {currentIndex + 1} of {remainingProblems.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={remainingProblems.length <= 1}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Next Card (Right Arrow)"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                    getRelativeRevisionString(currentProblem.nextRevisionDate).color
                  }`}
                >
                  {getRelativeRevisionString(currentProblem.nextRevisionDate).text}
                </span>
              </div>
            </div>

            {/* Main Flashcard Front */}
            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      PLATFORM_CONFIG[currentProblem.platform || 'other'].bg
                    } ${PLATFORM_CONFIG[currentProblem.platform || 'other'].border} ${
                      PLATFORM_CONFIG[currentProblem.platform || 'other'].color
                    }`}
                  >
                    {PLATFORM_CONFIG[currentProblem.platform || 'other'].name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      currentProblem.difficulty === 'Easy'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : currentProblem.difficulty === 'Medium'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}
                  >
                    {currentProblem.difficulty}
                  </span>
                </div>

                {currentProblem.solveTimeMinutes && (
                  <div className="flex items-center gap-1 font-mono text-xs text-zinc-400">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span>{currentProblem.solveTimeMinutes}m</span>
                  </div>
                )}
              </div>

              {/* Title & External Link */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                  <span>{currentProblem.title}</span>
                  {currentProblem.url && (
                    <a
                      href={currentProblem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-emerald-400 transition"
                      title="Open problem in new tab"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </h3>
              </div>

              {/* Pattern tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentProblem.patterns.map((pat) => (
                  <span
                    key={pat}
                    className="px-2 py-0.5 rounded-md text-xs bg-zinc-800/80 border border-zinc-700/60 text-zinc-300"
                  >
                    {pat}
                  </span>
                ))}
              </div>
            </div>

            {/* Reveal Notes Button */}
            <div className="text-center">
              <button
                onClick={() => setIsRevealed((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-100 transition shadow-sm"
              >
                {isRevealed ? (
                  <>
                    <EyeOff className="h-4 w-4 text-zinc-400" />
                    <span>Hide Notes (Press Space)</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-emerald-400" />
                    <span>Reveal Intuition & Mistakes (Press Space)</span>
                  </>
                )}
              </button>
            </div>

            {/* Revealed Back Side */}
            {isRevealed && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Key Intuition */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Key Intuition / "Aha!" Moment</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    {currentProblem.notes.keyIntuition || 'No intuition recorded.'}
                  </p>
                </div>

                {/* Mistakes */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                    <AlertOctagon className="h-4 w-4" />
                    <span>Mistakes & Edge Cases Missed</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    {currentProblem.notes.mistakes || 'No mistakes recorded.'}
                  </p>
                </div>

                {/* Complexities */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300">
                    Time: <strong className="text-blue-400">{currentProblem.notes.timeComplexity || 'N/A'}</strong>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-300">
                    Space: <strong className="text-blue-400">{currentProblem.notes.spaceComplexity || 'N/A'}</strong>
                  </div>
                </div>

                {/* Code Snippet */}
                {currentProblem.notes.codeSnippet && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden text-xs">
                    <div className="px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Code Snippet</span>
                    </div>
                    <pre className="p-3.5 font-mono text-zinc-200 overflow-x-auto text-[11px] leading-relaxed max-h-52">
                      <code>{currentProblem.notes.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Bottom: Quick 1-5 Confidence Selector Bar */}
        {!sessionCompleted && currentProblem && (
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/80">
            <div className="text-center text-xs text-zinc-400 mb-2 font-medium">
              Rate your recall today (Click or press keys <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono">5</kbd>):
            </div>

            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => {
                const conf = CONFIDENCE_CONFIG[level];
                return (
                  <button
                    key={level}
                    onClick={() => handleRate(level)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all hover:scale-[1.02] ${conf.bg} ${conf.border} hover:ring-1 hover:ring-emerald-500/50`}
                  >
                    <div className="flex items-center gap-1 font-bold text-xs">
                      <span className={conf.badgeText}>{level}</span>
                      <span className="text-zinc-200 hidden sm:inline">{conf.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-0.5 font-mono">
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
