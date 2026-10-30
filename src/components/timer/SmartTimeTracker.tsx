import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  Square,
  Coffee,
  Maximize2,
  Sliders,
  CheckCircle2,
  Tag,
  CheckSquare,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { formatDurationHMS } from '../../utils/dateUtils';
import { ProgressBar } from '../common/ProgressBar';

export const SmartTimeTracker: React.FC = () => {
  const {
    activeTimer,
    timerElapsedMs,
    breakElapsedMs,
    startTimer,
    pauseTimer,
    resumeTimer,
    toggleBreakMode,
    stopAndSaveTimer,
    discardTimer,
    setFocusMode,
    updateTimerNotes,
    categories,
    tasks,
    setOpenManualTimeModal,
  } = useApp();

  // Local config before starting or during active
  const [selectedCatId, setSelectedCatId] = useState(activeTimer.categoryId || categories[0]?.id || 'cat-coding');
  const [selectedTaskId, setSelectedTaskId] = useState(activeTimer.taskId || '');
  const [sessionTitle, setSessionTitle] = useState(activeTimer.sessionTitle || '');
  const [preset, setPreset] = useState<'50/10' | '25/5' | 'custom'>('50/10');
  const [customFocusMin, setCustomFocusMin] = useState(60);
  const [customBreakMin, setCustomBreakMin] = useState(15);
  const [sessionNotes, setSessionNotes] = useState(activeTimer.notes || '');

  const handleStart = () => {
    const taskObj = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
    const finalTitle = sessionTitle.trim() || (taskObj ? taskObj.title : 'Deep Focus Session');

    startTimer({
      categoryId: selectedCatId,
      taskId: selectedTaskId || null,
      title: finalTitle,
      notes: sessionNotes,
    });
  };

  const handlePresetSelect = (p: '50/10' | '25/5' | 'custom') => {
    setPreset(p);
  };

  const currentCategory = categories.find((c) => c.id === (activeTimer.isActive ? activeTimer.categoryId : selectedCatId));
  const currentTask = (activeTimer.isActive ? activeTimer.taskId : selectedTaskId)
    ? tasks.find((t) => t.id === (activeTimer.isActive ? activeTimer.taskId : selectedTaskId))
    : null;

  const currentElapsed = activeTimer.isBreak ? breakElapsedMs : timerElapsedMs;
  const currentIntervalMin = activeTimer.isBreak
    ? activeTimer.breakIntervalMinutes
    : preset === '25/5'
    ? 25
    : preset === '50/10'
    ? 50
    : customFocusMin;

  const intervalTargetMs = currentIntervalMin * 60 * 1000;
  const intervalProgress = Math.min(100, Math.round((currentElapsed / intervalTargetMs) * 100));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Smart Time Tracker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Timestamp-precise intentional session logging with break segregation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenManualTimeModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Manual Entry
          </button>
          <button
            onClick={() => setFocusMode(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-brand-600 dark:text-brand-400 font-semibold text-xs border border-brand-500/30 flex items-center gap-1.5 transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen Focus Mode
          </button>
        </div>
      </div>

      {/* Main Digital Clock Card */}
      <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Glow Accent */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: activeTimer.isBreak ? '#f59e0b' : currentCategory?.color || '#6366f1' }}
        />

        {/* Status Pill Top */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono font-medium mb-6">
          <span
            className={`w-2 h-2 rounded-full ${activeTimer.isActive ? 'animate-ping' : ''}`}
            style={{
              backgroundColor: activeTimer.isBreak
                ? '#f59e0b'
                : activeTimer.isActive
                ? '#10b981'
                : '#94a3b8',
            }}
          />
          <span className="text-slate-600 dark:text-slate-300">
            {activeTimer.isActive
              ? activeTimer.isPaused
                ? 'SESSION PAUSED'
                : activeTimer.isBreak
                ? 'BREAK IN PROGRESS (TIME NOT COUNTED AS PRODUCTIVE)'
                : 'FOCUS SESSION ACTIVE'
              : 'TIMER READY'}
          </span>
        </div>

        {/* Digital Time Large Display */}
        <div className="py-4 select-none">
          <div className="text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
            {formatDurationHMS(currentElapsed)}
          </div>
          <div className="text-xs font-mono tracking-widest text-slate-400 mt-2 uppercase">
            {activeTimer.isBreak ? 'REST INTERVAL ELAPSED' : 'INTENTIONAL PRODUCTIVE TIME'}
          </div>
        </div>

        {/* Interval Progress Bar */}
        <div className="max-w-md mx-auto my-6 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-mono">
            <span>Interval Target</span>
            <span>
              {Math.floor(currentElapsed / 60000)} / {currentIntervalMin} min ({intervalProgress}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeTimer.isBreak
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-400'
              }`}
              style={{ width: `${intervalProgress}%` }}
            />
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {!activeTimer.isActive ? (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base flex items-center gap-2 shadow-glow transition-all"
            >
              <Play className="w-5 h-5 fill-white" /> Start Focus Session
            </button>
          ) : (
            <>
              {activeTimer.isPaused ? (
                <button
                  onClick={resumeTimer}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 shadow-glow transition-all"
                >
                  <Play className="w-4 h-4 fill-white" /> Resume
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-3.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm flex items-center gap-2 border border-slate-300 dark:border-slate-700 transition-all"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}

              <button
                onClick={toggleBreakMode}
                className={`px-5 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all ${
                  activeTimer.isBreak
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30'
                }`}
              >
                <Coffee className="w-4 h-4" />
                {activeTimer.isBreak ? 'End Break' : 'Take Break'}
              </button>

              <button
                onClick={() => stopAndSaveTimer(sessionNotes)}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-md"
              >
                <Square className="w-4 h-4 fill-white" /> Stop & Log
              </button>

              <button
                onClick={discardTimer}
                className="p-3.5 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Discard Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Session Metadata & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Category & Task Association */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Tag className="w-4 h-4 text-brand-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Session Association & Category
            </h4>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Focus Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const isSelected = (activeTimer.isActive ? activeTimer.categoryId : selectedCatId) === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={activeTimer.isActive}
                    onClick={() => setSelectedCatId(c.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/10 text-slate-900 dark:text-white font-semibold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    } ${activeTimer.isActive ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-xs truncate">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Associate with Task
            </label>
            <select
              disabled={activeTimer.isActive}
              value={activeTimer.isActive ? activeTimer.taskId || '' : selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">-- No linked task (General focus) --</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Presets & Live Notes */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Interval Presets & Live Notes
            </h4>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Focus / Break Interval Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '50/10', label: '50 / 10', desc: 'Deep Work' },
                { id: '25/5', label: '25 / 5', desc: 'Pomodoro' },
                { id: 'custom', label: 'Custom', desc: `${customFocusMin}/${customBreakMin}` },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id as unknown as typeof preset)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    preset === p.id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs block">{p.label}</span>
                  <span className="text-[10px] block opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Session Notes & Deliverables
            </label>
            <textarea
              rows={3}
              placeholder="Jot down active thoughts, code branches, or outputs..."
              value={activeTimer.isActive ? activeTimer.notes : sessionNotes}
              onChange={(e) => {
                const val = e.target.value;
                setSessionNotes(val);
                if (activeTimer.isActive) updateTimerNotes(val);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

