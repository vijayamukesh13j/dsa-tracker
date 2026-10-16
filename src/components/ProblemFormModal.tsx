import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  Link as LinkIcon,
  Clock,
  Lightbulb,
  AlertOctagon,
  Code2,
  Check,
  Plus,
} from 'lucide-react';
import {
  type ConfidenceLevel,
  CONFIDENCE_CONFIG,
  type Difficulty,
  type Platform,
  type Problem,
  STANDARD_PATTERNS,
} from '../types/problem';
import { extractProblemInfoFromUrl } from '../utils/urlParser';
import {
  calculateNextRevisionDate,
  getTodayISO,
} from '../utils/spacedRepetition';

interface ProblemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProblem?: Problem | null;
  onSaveProblem: (data: any) => void;
  stopwatchElapsedMinutes?: number;
}

export const ProblemFormModal: React.FC<ProblemFormModalProps> = ({
  isOpen,
  onClose,
  editingProblem,
  onSaveProblem,
  stopwatchElapsedMinutes,
}) => {
  const [title, setTitle] = useState<string>('');
  const [problemNumber, setProblemNumber] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [platform, setPlatform] = useState<Platform>('leetcode');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState<string>('');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(3);
  const [dateFirstSolved, setDateFirstSolved] = useState<string>(getTodayISO());
  const [nextRevisionDate, setNextRevisionDate] = useState<string>('');
  const [solveTime, setSolveTime] = useState<string>('');

  const [keyIntuition, setKeyIntuition] = useState<string>('');
  const [mistakes, setMistakes] = useState<string>('');
  const [timeComplexity, setTimeComplexity] = useState<string>('O(N)');
  const [spaceComplexity, setSpaceComplexity] = useState<string>('O(1)');
  const [codeSnippet, setCodeSnippet] = useState<string>('');
  const [language, setLanguage] = useState<string>('python');

  useEffect(() => {
    if (editingProblem) {
      setTitle(editingProblem.title);
      setProblemNumber(editingProblem.problemNumber || '');
      setUrl(editingProblem.url);
      setPlatform(editingProblem.platform);
      setDifficulty(editingProblem.difficulty);
      setSelectedPatterns(editingProblem.patterns);
      setConfidence(editingProblem.confidence);
      setDateFirstSolved(editingProblem.dateFirstSolved);
      setNextRevisionDate(editingProblem.nextRevisionDate);
      setSolveTime(
        editingProblem.solveTimeMinutes ? String(editingProblem.solveTimeMinutes) : ''
      );
      setKeyIntuition(editingProblem.notes.keyIntuition || '');
      setMistakes(editingProblem.notes.mistakes || '');
      setTimeComplexity(editingProblem.notes.timeComplexity || 'O(N)');
      setSpaceComplexity(editingProblem.notes.spaceComplexity || 'O(1)');
      setCodeSnippet(editingProblem.notes.codeSnippet || '');
      setLanguage(editingProblem.notes.language || 'python');
    } else {
      const today = getTodayISO();
      setTitle('');
      setProblemNumber('');
      setUrl('');
      setPlatform('leetcode');
      setDifficulty('Medium');
      setSelectedPatterns([]);
      setCustomTagInput('');
      setConfidence(3);
      setDateFirstSolved(today);
      setNextRevisionDate(calculateNextRevisionDate(3, today));
      setSolveTime(
        stopwatchElapsedMinutes && stopwatchElapsedMinutes > 0
          ? String(stopwatchElapsedMinutes)
          : ''
      );
      setKeyIntuition('');
      setMistakes('');
      setTimeComplexity('O(N)');
      setSpaceComplexity('O(1)');
      setCodeSnippet('');
      setLanguage('python');
    }
  }, [editingProblem, isOpen, stopwatchElapsedMinutes]);

  const handleConfidenceChange = (newConf: ConfidenceLevel) => {
    setConfidence(newConf);
    setNextRevisionDate(calculateNextRevisionDate(newConf, dateFirstSolved || getTodayISO()));
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!newUrl.trim()) return;

    const info = extractProblemInfoFromUrl(newUrl);
    setPlatform(info.platform);

    if (info.extractedTitle && (!title || title.trim() === '')) {
      setTitle(info.extractedTitle);
    }
    if (info.problemNumber && (!problemNumber || problemNumber.trim() === '')) {
      setProblemNumber(info.problemNumber);
    }
  };

  const togglePattern = (pattern: string) => {
    setSelectedPatterns((prev) =>
      prev.includes(pattern) ? prev.filter((p) => p !== pattern) : [...prev, pattern]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag && !selectedPatterns.includes(tag)) {
      setSelectedPatterns((prev) => [...prev, tag]);
      setCustomTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      problemNumber: problemNumber.trim() || undefined,
      url: url.trim(),
      platform,
      difficulty,
      patterns: selectedPatterns.length > 0 ? selectedPatterns : ['General DSA'],
      confidence,
      dateFirstSolved: dateFirstSolved || getTodayISO(),
      nextRevisionDate: nextRevisionDate || calculateNextRevisionDate(confidence, dateFirstSolved),
      solveTimeMinutes: solveTime ? parseInt(solveTime, 10) : undefined,
      notes: {
        keyIntuition: keyIntuition.trim(),
        mistakes: mistakes.trim(),
        timeComplexity: timeComplexity.trim(),
        spaceComplexity: spaceComplexity.trim(),
        codeSnippet: codeSnippet.trim(),
        language,
      },
    };

    onSaveProblem(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-zinc-100 relative animate-float-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <h3 className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
              {editingProblem ? 'Edit DSA Problem' : 'Track New DSA Problem'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* URL & Platform Auto-detection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-emerald-500" />
                <span>Problem URL (Paste LeetCode / NeetCode / GFG link)</span>
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                Auto-extracts title & platform!
              </span>
            </div>
            <input
              type="url"
              placeholder="https://leetcode.com/problems/lru-cache/description/"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Title & Platform Badge Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Problem Title & Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 146. LRU Cache"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="leetcode">LeetCode</option>
                <option value="neetcode">NeetCode</option>
                <option value="gfg">GeeksforGeeks</option>
                <option value="codeforces">Codeforces</option>
                <option value="hackerrank">HackerRank</option>
                <option value="other">Custom / Other</option>
              </select>
            </div>
          </div>

          {/* Difficulty & Solve Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((diff) => (
                  <button
                    type="button"
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      difficulty === diff
                        ? diff === 'Easy'
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                          : diff === 'Medium'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400'
                        : 'bg-slate-50 dark:bg-zinc-950/60 border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Solve Time (mins)
                </label>
                {stopwatchElapsedMinutes && stopwatchElapsedMinutes > 0 && (
                  <button
                    type="button"
                    onClick={() => setSolveTime(String(stopwatchElapsedMinutes))}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    <span>Use timer ({stopwatchElapsedMinutes}m)</span>
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="300"
                placeholder="e.g. 25"
                value={solveTime}
                onChange={(e) => setSolveTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Core Pattern / Topic Tags Multi-select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Core DSA Patterns & Topics
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80">
              {STANDARD_PATTERNS.map((pat) => {
                const isSelected = selectedPatterns.includes(pat);
                return (
                  <button
                    type="button"
                    key={pat}
                    onClick={() => togglePattern(pat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                        : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {pat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Or type a custom pattern / tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          {/* Confidence Level (1-5) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
              Initial Recall Confidence (determines repetition interval)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as ConfidenceLevel[]).map((level) => {
                const conf = CONFIDENCE_CONFIG[level];
                const isSelected = confidence === level;
                return (
                  <button
                    type="button"
                    key={level}
                    onClick={() => handleConfidenceChange(level)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? `${conf.bg} ${conf.border} ring-2 ring-emerald-500/40`
                        : 'bg-slate-50 dark:bg-zinc-950/40 border-slate-200 dark:border-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-xs font-bold ${conf.badgeText}`}>
                        {level} - {conf.label}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold">
                        +{conf.intervalDays}d
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                      {conf.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Date First Solved
              </label>
              <input
                type="date"
                value={dateFirstSolved}
                onChange={(e) => setDateFirstSolved(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">
                Next Revision Date (auto-calculated)
              </label>
              <input
                type="date"
                value={nextRevisionDate}
                onChange={(e) => setNextRevisionDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Structured Notes */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              <span>Structured Notes & Learnings</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                Key Intuition / "Aha!" Moment (1-2 sentences on the trick)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Always advance the pointer with the smaller boundary height because that smaller height is the true bottleneck."
                value={keyIntuition}
                onChange={(e) => setKeyIntuition(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                <span>Mistakes & Edge Cases Missed (What went wrong initially?)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Missed edge case where array length < 3. Off-by-one error when advancing left pointer."
                value={mistakes}
                onChange={(e) => setMistakes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Time Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(N) or O(N log N)"
                  value={timeComplexity}
                  onChange={(e) => setTimeComplexity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Space Complexity
                </label>
                <input
                  type="text"
                  placeholder="e.g. O(1) or O(N)"
                  value={spaceComplexity}
                  onChange={(e) => setSpaceComplexity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-slate-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Code Snippet / Pseudocode</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] rounded-md px-2 py-0.5 focus:outline-none"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="go">Go</option>
                  <option value="pseudocode">Pseudocode</option>
                </select>
              </div>
              <textarea
                rows={6}
                placeholder="def solve(nums):&#10;    # Write or paste your clean solution here"
                value={codeSnippet}
                onChange={(e) => setCodeSnippet(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-950 border border-slate-800 dark:border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500 transition leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-zinc-950 text-xs font-extrabold transition shadow-md shadow-emerald-500/20"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>{editingProblem ? 'Save Changes' : 'Add Problem to Vault'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
