import React, { useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StopwatchFloatingProps {
  formattedTime: string;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onLogWithTimer: () => void;
}

export const StopwatchFloating: React.FC<StopwatchFloatingProps> = ({
  formattedTime,
  isRunning,
  onToggle,
  onReset,
  onLogWithTimer,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  return (
    <aside
      aria-label="Mock Interview Timer"
      className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 backdrop-blur-md overflow-hidden text-slate-900 dark:text-zinc-100 transition-all">
        {/* Top Mini Bar */}
        <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-zinc-950/60 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
            <Clock
              className={`h-3.5 w-3.5 ${
                isRunning ? 'text-emerald-500 animate-spin' : 'text-slate-400 dark:text-zinc-500'
              }`}
            />
            <span>Solve Timer</span>
          </div>

          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            className="p-0.5 rounded hover:bg-slate-200/70 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition"
            title={isMinimized ? 'Expand Timer' : 'Minimize Timer'}
          >
            {isMinimized ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Expanded View */}
        {!isMinimized ? (
          <div className="p-3.5 space-y-3">
            <div className="text-center font-mono font-black text-2xl tracking-wider text-slate-900 dark:text-zinc-100 py-0.5">
              {formattedTime}
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={onToggle}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                  isRunning
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                    : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    <span>Start</span>
                  </>
                )}
              </button>

              <button
                onClick={onReset}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                title="Reset Timer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={onLogWithTimer}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition"
                title="Log new problem with this elapsed time"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Log</span>
              </button>
            </div>
          </div>
        ) : (
          /* Minimized pill */
          <div
            onClick={() => setIsMinimized(false)}
            className="px-3.5 py-1.5 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition flex items-center gap-2"
          >
            <span>{formattedTime}</span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-sans font-normal">
              {isRunning ? 'Running' : 'Paused'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
