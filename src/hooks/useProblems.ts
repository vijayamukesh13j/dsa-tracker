import { useCallback, useEffect, useState } from 'react';
import { ConfidenceLevel, Problem, RevisionRecord } from '../types/problem';
import { getSampleProblems } from '../utils/sampleData';
import {
  calculateNextRevisionDate,
  getTodayISO,
} from '../utils/spacedRepetition';
import {
  clearAllProblemsStorage,
  connectLocalFileHandle,
  disconnectLocalFile,
  getActiveSyncedFileName,
  isFileSystemAccessSupported,
  loadProblemsFromStorage,
  openLocalFileHandle,
  saveProblemsToStorage,
  saveToLocalFile,
} from '../utils/storage';

export type FileSyncStatus = 'unconnected' | 'connected' | 'saving' | 'synced' | 'error';

export function useProblems() {
  const [problems, setProblems] = useState<Problem[]>(() => loadProblemsFromStorage());
  const [syncedFileName, setSyncedFileName] = useState<string | null>(() => getActiveSyncedFileName());
  const [fileSyncStatus, setFileSyncStatus] = useState<FileSyncStatus>(() =>
    getActiveSyncedFileName() ? 'connected' : 'unconnected'
  );
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);

  // Sync state to localStorage whenever problems array changes
  const persistProblems = useCallback((updated: Problem[]) => {
    setProblems(updated);
    saveProblemsToStorage(updated);

    // If a local file handle is active, auto-save to disk
    if (getActiveSyncedFileName()) {
      setFileSyncStatus('saving');
      saveToLocalFile(updated).then((res) => {
        if (res.success) {
          setFileSyncStatus('synced');
          setSyncErrorMessage(null);
        } else {
          setFileSyncStatus('error');
          setSyncErrorMessage(res.error || 'Failed to auto-save to local file');
        }
      });
    }
  }, []);

  // Add problem
  const addProblem = useCallback(
    (
      newProblemData: Omit<
        Problem,
        'id' | 'createdAt' | 'updatedAt' | 'revisionHistory' | 'revisionCount'
      > & {
        initialNotes?: string;
        revisionCount?: number;
      }
    ) => {
      const today = getTodayISO();
      const id = 'prob_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

      const nextRev =
        newProblemData.nextRevisionDate ||
        calculateNextRevisionDate(newProblemData.confidence, newProblemData.dateFirstSolved || today);

      const initialHistory: RevisionRecord[] = [
        {
          id: 'rev_' + Date.now(),
          date: newProblemData.dateFirstSolved || today,
          confidence: newProblemData.confidence,
          solveTimeMinutes: newProblemData.solveTimeMinutes,
          notes: newProblemData.initialNotes || 'First solve logged',
        },
      ];

      const problem: Problem = {
        ...newProblemData,
        id,
        revisionCount: newProblemData.revisionCount ?? 1,
        lastRevisionDate: newProblemData.lastRevisionDate || newProblemData.dateFirstSolved || today,
        nextRevisionDate: nextRev,
        revisionHistory: initialHistory,
        createdAt: today,
        updatedAt: today,
      };

      const updated = [problem, ...problems];
      persistProblems(updated);
      return problem;
    },
    [problems, persistProblems]
  );

  // Update existing problem
  const updateProblem = useCallback(
    (id: string, updates: Partial<Problem>) => {
      const today = getTodayISO();
      const updated = problems.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          ...updates,
          updatedAt: today,
        };
      });
      persistProblems(updated);
    },
    [problems, persistProblems]
  );

  // Delete problem
  const deleteProblem = useCallback(
    (id: string) => {
      const updated = problems.filter((p) => p.id !== id);
      persistProblems(updated);
    },
    [problems, persistProblems]
  );

  // Log Spaced Repetition Revision
  const logRevision = useCallback(
    (
      id: string,
      newConfidence: ConfidenceLevel,
      solveTimeMinutes?: number,
      revisionNote?: string
    ) => {
      const today = getTodayISO();
      const nextDate = calculateNextRevisionDate(newConfidence, today);

      const updated = problems.map((p) => {
        if (p.id !== id) return p;

        const newRecord: RevisionRecord = {
          id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          date: today,
          confidence: newConfidence,
          solveTimeMinutes: solveTimeMinutes !== undefined ? solveTimeMinutes : p.solveTimeMinutes,
          notes: revisionNote,
        };

        return {
          ...p,
          confidence: newConfidence,
          lastRevisionDate: today,
          nextRevisionDate: nextDate,
          revisionCount: (p.revisionCount || 0) + 1,
          solveTimeMinutes: solveTimeMinutes !== undefined ? solveTimeMinutes : p.solveTimeMinutes,
          revisionHistory: [...(p.revisionHistory || []), newRecord],
          updatedAt: today,
        };
      });

      persistProblems(updated);
    },
    [problems, persistProblems]
  );

  // Reset to sample data
  const resetToSamples = useCallback(() => {
    const samples = getSampleProblems();
    persistProblems(samples);
  }, [persistProblems]);

  // Clear all problems
  const clearAllProblems = useCallback(() => {
    clearAllProblemsStorage();
    persistProblems([]);
  }, [persistProblems]);

  // Import problems (merge or replace)
  const importProblems = useCallback(
    (imported: Problem[], mode: 'replace' | 'merge') => {
      if (mode === 'replace') {
        persistProblems(imported);
      } else {
        // Merge: keep existing by ID, append new ones
        const existingIds = new Set(problems.map((p) => p.id));
        const newItems = imported.filter((p) => !existingIds.has(p.id));
        persistProblems([...newItems, ...problems]);
      }
    },
    [problems, persistProblems]
  );

  // Local File System Sync actions
  const connectNewLocalFile = async () => {
    const res = await connectLocalFileHandle();
    if (res.success && res.filename) {
      setSyncedFileName(res.filename);
      setFileSyncStatus('saving');
      const saveRes = await saveToLocalFile(problems);
      if (saveRes.success) {
        setFileSyncStatus('synced');
        setSyncErrorMessage(null);
      } else {
        setFileSyncStatus('error');
        setSyncErrorMessage(saveRes.error || 'Failed to save to local file');
      }
    } else if (res.error) {
      setSyncErrorMessage(res.error);
    }
  };

  const openExistingLocalFile = async () => {
    const res = await openLocalFileHandle();
    if (res.success && res.filename) {
      setSyncedFileName(res.filename);
      if (res.problems && res.problems.length > 0) {
        persistProblems(res.problems);
      }
      setFileSyncStatus('synced');
      setSyncErrorMessage(null);
    } else if (res.error) {
      setSyncErrorMessage(res.error);
    }
  };

  const saveCurrentToLocalFile = async () => {
    setFileSyncStatus('saving');
    const res = await saveToLocalFile(problems);
    if (res.success) {
      setFileSyncStatus('synced');
      setSyncErrorMessage(null);
    } else {
      setFileSyncStatus('error');
      setSyncErrorMessage(res.error || 'Failed to write to file.');
    }
  };

  const disconnectFile = () => {
    disconnectLocalFile();
    setSyncedFileName(null);
    setFileSyncStatus('unconnected');
    setSyncErrorMessage(null);
  };

  // Re-read file sync status on mount
  useEffect(() => {
    setSyncedFileName(getActiveSyncedFileName());
  }, []);

  return {
    problems,
    addProblem,
    updateProblem,
    deleteProblem,
    logRevision,
    resetToSamples,
    clearAllProblems,
    importProblems,
    // File Sync API
    isFileSystemSupported: isFileSystemAccessSupported(),
    syncedFileName,
    fileSyncStatus,
    syncErrorMessage,
    connectNewLocalFile,
    openExistingLocalFile,
    saveCurrentToLocalFile,
    disconnectFile,
  };
}
