import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Square,
  Coffee,
  CheckCircle2,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { formatDurationHMS } from '../../utils/dateUtils';
import { ProgressBar } from '../common/ProgressBar';

export const FocusModeOverlay: React.FC = () => {
  const {
    activeTimer,
    timerElapsedMs,
    breakElapsedMs,
    pauseTimer,
    resumeTimer,
    toggleBreakMode,
    stopAndSaveTimer,
    setFocusMode,
    categories,
    tasks,
  } = useApp();

  if (!activeTimer.focusMode) return null;

  const currentCategory = categories.find((c) => c.id === activeTimer.categoryId);
  const currentTask = activeTimer.taskId ? tasks.find((t) => t.id === activeTimer.taskId) : null;

  // Target interval progress
  const targetDurationMs = (activeTimer.isBreak ? activeTimer.breakIntervalMinutes : activeTimer.focusIntervalMinutes) * 60 * 1000;
  const currentElapsed = activeTimer.isBreak ? breakElapsedMs : timerElapsedMs;
  const intervalProgress = Math.min(100, Math.round((currentElapsed / targetDurationMs) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-surface-950 flex flex-col justify-between p-6 sm:p-12 text-white animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: activeTimer.isBreak ? '#f59e0b' : currentCategory?.color || '#6366f1' }}
          />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
            {activeTimer.isBreak ? 'REST / BREAK INTERVAL' : 'DEEP WORK FOCUS MODE'}
          </span>
        </div>

        <button
          onClick={() => setFocusMode(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-2 text-xs font-medium"
        >
          <Minimize2 className="w-4 h-4" /> Exit Fullscreen Focus
        </button>
      </div>

      {/* Main Central Distraction-Free Timer Display */}
      <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full space-y-6">
        {/* Linked Task & Category */}
        <div className="space-y-2">
          {currentTask ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-200 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-500" />
              <span>{currentTask.title}</span>
            </div>
          ) : (
            <h3 className="text-xl font-bold text-slate-300 tracking-tight">
              {activeTimer.sessionTitle || 'Intentional Focus Session'}
            </h3>
          )}

          {currentCategory && (
            <div className="text-xs font-medium text-slate-400">
              Category: <span style={{ color: currentCategory.color }}>{currentCategory.name}</span>
            </div>
          )}
        </div>

        {/* Digital Clock Large */}
        <div className="py-6 select-none">
          <div className="text-7xl sm:text-8xl md:text-9xl font-extrabold font-mono tracking-tight text-white drop-shadow-2xl">
            {formatDurationHMS(currentElapsed)}
          </div>
          <div className="text-xs font-mono tracking-widest text-slate-400 mt-3 uppercase">
            {activeTimer.isPaused
              ? 'SESSION PAUSED'
              : activeTimer.isBreak
              ? 'RECOVERY TIME (EXCLUDED FROM TARGET)'
              : 'FOCUS TIMER ACTIVE'}
          </div>
        </div>

        {/* Minimal Interval Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Interval Pace</span>
            <span>
              {Math.floor(currentElapsed / 60000)} /{' '}
              {activeTimer.isBreak ? activeTimer.breakIntervalMinutes : activeTimer.focusIntervalMinutes} min
            </span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-1000 ${
                activeTimer.isBreak
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-500'
              }`}
              style={{ width: `${intervalProgress}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center gap-4 pt-6">
          {activeTimer.isPaused ? (
            <button
              onClick={resumeTimer}
              className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center gap-2.5 shadow-glow transition-all"
            >
              <Play className="w-5 h-5 fill-white" /> Resume
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center gap-2.5 border border-slate-700 transition-all"
            >
              <Pause className="w-5 h-5" /> Pause
            </button>
          )}

          <button
            onClick={toggleBreakMode}
            className={`px-5 py-4 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
              activeTimer.isBreak
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow'
                : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800'
            }`}
          >
            <Coffee className="w-4 h-4" />
            {activeTimer.isBreak ? 'End Break' : 'Take Break'}
          </button>

          <button
            onClick={() => {
              stopAndSaveTimer();
              setFocusMode(false);
            }}
            className="px-6 py-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <Square className="w-4 h-4 fill-white" /> Stop & Log
          </button>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="text-center text-xs text-slate-500 font-medium">
        "Don't just count the hours. Make every hour intentional."
      </div>
    </div>
  );
};

