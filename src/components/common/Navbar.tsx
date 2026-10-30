import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sun,
  Moon,
  Play,
  Plus,
  Timer as TimerIcon,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { formatDurationHMS, getRelativeDayLabel, formatDateISO } from '../../utils/dateUtils';

export const Navbar: React.FC = () => {
  const {
    challenge,
    theme,
    toggleTheme,
    profile,
    activeTimer,
    timerElapsedMs,
    breakElapsedMs,
    setCurrentTab,
    categories,
    setOpenManualTimeModal,
  } = useApp();

  const activeCategory = categories.find((c) => c.id === activeTimer.categoryId);
  const todayStr = formatDateISO(new Date());

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Challenge Title & Today's Date */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
              {challenge.name}
            </h2>
            <span className="hidden sm:inline-flex text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
              {challenge.targetHours}h Goal
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {getRelativeDayLabel(todayStr)} • Week of {challenge.startDate}
          </span>
        </div>
      </div>

      {/* Middle: Active Running Timer Pill (Visible on all tabs when timer is active!) */}
      {activeTimer.isActive && (
        <div
          onClick={() => setCurrentTab('timer')}
          className={`cursor-pointer flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-full border transition-all hover:scale-105 shadow-sm ${
            activeTimer.isBreak
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-brand-500/10 border-brand-500/30 text-brand-400'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeTimer.isBreak ? 'bg-amber-400' : 'bg-brand-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                activeTimer.isBreak ? 'bg-amber-500' : 'bg-brand-500'
              }`}
            />
          </span>

          <div className="flex items-center gap-1.5">
            {activeTimer.isBreak ? <Coffee className="w-3.5 h-3.5" /> : <TimerIcon className="w-3.5 h-3.5" />}
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider">
              {formatDurationHMS(activeTimer.isBreak ? breakElapsedMs : timerElapsedMs)}
            </span>
          </div>

          {activeCategory && (
            <span
              className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${activeCategory.color}25`, color: activeCategory.color }}
            >
              {activeCategory.name}
            </span>
          )}
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Log Session Button */}
        <button
          onClick={() => setOpenManualTimeModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Manually log past session"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Time</span>
        </button>

        {/* Start Focus Button if timer inactive */}
        {!activeTimer.isActive && (
          <button
            onClick={() => setCurrentTab('timer')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Start Focus</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Profile Avatar */}
        <button
          onClick={() => setCurrentTab('settings')}
          className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Profile & Settings"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
            style={{ backgroundColor: profile.avatarColor || '#6366f1' }}
          >
            {profile.initials || 'AM'}
          </div>
        </button>
      </div>
    </header>
  );
};

