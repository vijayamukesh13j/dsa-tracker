import React, { useRef, useState } from 'react';
import {
  X,
  HardDrive,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Link,
  Unlink,
} from 'lucide-react';
import type { Problem } from '../types/problem';
import { exportDatabaseToJson, exportProblemsToCsv, parseJsonBackupFile } from '../utils/exportImport';
import type { FileSyncStatus } from '../hooks/useProblems';

interface DataSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Problem[];
  fileSyncStatus: FileSyncStatus;
  syncedFileName: string | null;
  isFileSystemSupported: boolean;
  syncErrorMessage: string | null;
  onConnectNewFile: () => void;
  onOpenExistingFile: () => void;
  onSaveToDisk: () => void;
  onDisconnectFile: () => void;
  onImportProblems: (imported: Problem[], mode: 'replace' | 'merge') => void;
  onResetToSamples: () => void;
  onClearAll: () => void;
  onNotify?: (title: string, description?: string) => void;
}

export const DataSyncModal: React.FC<DataSyncModalProps> = ({
  isOpen,
  onClose,
  problems,
  fileSyncStatus,
  syncedFileName,
  isFileSystemSupported,
  syncErrorMessage,
  onConnectNewFile,
  onOpenExistingFile,
  onSaveToDisk,
  onDisconnectFile,
  onImportProblems,
  onResetToSamples,
  onClearAll,
  onNotify,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  if (!isOpen) return null;

  const handleExportJson = () => {
    exportDatabaseToJson(problems);
    if (onNotify) onNotify('JSON Backup Exported', `${problems.length} problems saved to file.`);
  };

  const handleExportCsv = () => {
    exportProblemsToCsv(problems);
    if (onNotify) onNotify('CSV Spreadsheet Exported', `${problems.length} rows exported for Excel/Sheets.`);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await parseJsonBackupFile(file);
    if (res.success && res.problems) {
      onImportProblems(res.problems, importMode);
      const msg = `Imported ${res.problems.length} problems (${
        importMode === 'replace' ? 'replaced database' : 'merged with existing'
      })!`;
      setImportMessage({
        type: 'success',
        text: msg,
      });
      if (onNotify) onNotify('Backup Restored', msg);
    } else {
      setImportMessage({
        type: 'error',
        text: res.error || 'Failed to parse JSON file.',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900 dark:text-zinc-100 relative animate-float-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/80 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-base tracking-tight text-slate-900 dark:text-zinc-100">
                Data Management & Hard Drive Sync
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                100% Local • Zero-Backend • Automatic localStorage + File System Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: File System Access API - Sync directly to Local Hard Drive */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/90 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-emerald-500" />
                  <span>Sync to Local File (Browser File System Access API)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  Link a `.json` file directly on your computer's hard drive. All edits and logged
                  revisions write directly to disk without any backend server!
                </p>
              </div>

              {isFileSystemSupported && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  API Ready
                </span>
              )}
            </div>

            {/* Connection Status Box */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-3 w-3 rounded-full ${
                    fileSyncStatus === 'synced' || fileSyncStatus === 'connected'
                      ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                      : fileSyncStatus === 'saving'
                      ? 'bg-indigo-500 animate-ping'
                      : 'bg-slate-400 dark:bg-zinc-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {syncedFileName ? (
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        Connected: {syncedFileName}
                      </span>
                    ) : (
                      'No local file connected'
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {fileSyncStatus === 'synced'
                      ? 'In sync with local file on disk'
                      : fileSyncStatus === 'saving'
                      ? 'Writing to local file...'
                      : fileSyncStatus === 'error'
                      ? syncErrorMessage || 'Sync error'
                      : 'Data is safely persisted in browser LocalStorage.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {syncedFileName ? (
                  <>
                    <button
                      onClick={onSaveToDisk}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-2xs"
                    >
                      Save Now
                    </button>
                    <button
                      onClick={onDisconnectFile}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-rose-500 transition"
                      title="Disconnect Local File"
                    >
                      <Unlink className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onConnectNewFile}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition shadow-2xs flex items-center gap-1.5"
                    >
                      <Link className="h-3.5 w-3.5" />
                      <span>Create / Select File</span>
                    </button>
                    <button
                      onClick={onOpenExistingFile}
                      className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition"
                    >
                      Open Existing
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!isFileSystemSupported && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  File System Access API is not enabled in this browser. Use the standard JSON Export / Import buttons below to save and load your data anytime!
                </span>
              </div>
            )}
          </div>

          {/* Section 2: One-click Export JSON & CSV */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/90 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-500" />
              <span>One-Click Export Backups</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Download your complete database to transfer across devices or import into spreadsheets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-xs font-bold text-slate-800 dark:text-zinc-200 transition group shadow-2xs"
              >
                <FileJson className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition" />
                <span>Export Full Backup (.json)</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-xs font-bold text-slate-800 dark:text-zinc-200 transition group shadow-2xs"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition" />
                <span>Export to Spreadsheet (.csv)</span>
              </button>
            </div>
          </div>

          {/* Section 3: Import Backup (.json) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/90 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-500" />
              <span>Restore from Backup (.json)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Restore your tracked DSA problems from a previously exported `.json` file.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-zinc-300 font-medium">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>Merge with existing (recommended)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span>Replace entire database</span>
              </label>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500 bg-white dark:bg-zinc-900/60 hover:bg-slate-100/50 dark:hover:bg-zinc-800/60 text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-2 transition"
            >
              <Upload className="h-4 w-4 text-emerald-500" />
              <span>Click to select `.json` backup file</span>
            </button>

            {importMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  importMessage.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {importMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                )}
                <span>{importMessage.text}</span>
              </div>
            )}
          </div>

          {/* Section 4: Sample Data & Reset */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Database Tools</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Load the 5 canonical sample problems or clear your local vault.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Reset to canonical sample problems? This will replace your current list with the 5 curated sample problems.'
                    )
                  ) {
                    onResetToSamples();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                <span>Reset to Samples</span>
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to delete ALL tracked problems? This action cannot be undone unless you have exported a JSON backup!'
                    )
                  ) {
                    onClearAll();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-950/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
            Current records: <strong className="text-slate-800 dark:text-zinc-300">{problems.length} problems</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200/80 hover:bg-slate-300/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
