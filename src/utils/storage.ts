import type { Problem } from '../types/problem';
import { getSampleProblems } from './sampleData';

const STORAGE_KEY = 'dsa_tracker_problems_v1';
const FILE_HANDLE_KEY = 'dsa_tracker_has_file_sync';

export interface StorageData {
  version: number;
  exportedAt: string;
  problems: Problem[];
}

/**
 * Load problems from LocalStorage or initialize with sample data
 */
export function loadProblemsFromStorage(): Problem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSampleProblems();
      saveProblemsToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (parsed && Array.isArray(parsed.problems)) {
      return parsed.problems;
    }
    return getSampleProblems();
  } catch (error) {
    console.error('Failed to load problems from localStorage:', error);
    return getSampleProblems();
  }
}

/**
 * Save problems to LocalStorage
 */
export function saveProblemsToStorage(problems: Problem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (error) {
    console.error('Failed to save problems to localStorage:', error);
  }
}

/**
 * Clear all problem data
 */
export function clearAllProblemsStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// -------------------------------------------------------------
// File System Access API (Sync to Local File on Computer Disk)
// -------------------------------------------------------------

// In-memory reference to the active file handle
let activeFileHandle: any = null;
let activeFileName: string | null = null;

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

export function getActiveSyncedFileName(): string | null {
  return activeFileName;
}

/**
 * Pick or create a local file on computer hard drive to sync with
 */
export async function connectLocalFileHandle(): Promise<{ success: boolean; filename?: string; error?: string }> {
  if (!isFileSystemAccessSupported()) {
    return { success: false, error: 'File System Access API is not supported in this browser. Use Export/Import instead.' };
  }

  try {
    const options = {
      suggestedName: 'dsa_mastery_tracker.json',
      types: [
        {
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
    };

    const handle = await (window as any).showSaveFilePicker(options);
    activeFileHandle = handle;
    activeFileName = handle.name;
    localStorage.setItem(FILE_HANDLE_KEY, handle.name);
    return { success: true, filename: handle.name };
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return { success: false, error: 'File selection cancelled.' };
    }
    return { success: false, error: error.message || 'Failed to select file' };
  }
}

/**
 * Open an existing local file handle to sync from
 */
export async function openLocalFileHandle(): Promise<{
  success: boolean;
  problems?: Problem[];
  filename?: string;
  error?: string;
}> {
  if (!isFileSystemAccessSupported()) {
    return { success: false, error: 'File System Access API is not supported in this browser.' };
  }

  try {
    const options = {
      types: [
        {
          description: 'JSON Files',
          accept: {
            'application/json': ['.json'],
          },
        },
      ],
      multiple: false,
    };

    const [handle] = await (window as any).showOpenFilePicker(options);
    activeFileHandle = handle;
    activeFileName = handle.name;

    const file = await handle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);

    let problems: Problem[] = [];
    if (Array.isArray(parsed)) {
      problems = parsed;
    } else if (parsed && Array.isArray(parsed.problems)) {
      problems = parsed.problems;
    } else {
      throw new Error('Invalid DSA Tracker JSON format.');
    }

    localStorage.setItem(FILE_HANDLE_KEY, handle.name);
    return { success: true, problems, filename: handle.name };
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === 'AbortError') {
      return { success: false, error: 'File selection cancelled.' };
    }
    return { success: false, error: error.message || 'Failed to open local file.' };
  }
}

/**
 * Write current problems data directly to the connected local file handle
 */
export async function saveToLocalFile(problems: Problem[]): Promise<{ success: boolean; error?: string }> {
  if (!activeFileHandle) {
    return { success: false, error: 'No local file connected. Please select or connect a file first.' };
  }

  try {
    const data: StorageData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      problems,
    };

    const writable = await activeFileHandle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
    return { success: true };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, error: error.message || 'Failed to write to local file.' };
  }
}

/**
 * Disconnect local file handle
 */
export function disconnectLocalFile(): void {
  activeFileHandle = null;
  activeFileName = null;
  localStorage.removeItem(FILE_HANDLE_KEY);
}
