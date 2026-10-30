import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Target,
  Calendar,
  CheckSquare,
  Timer,
  BarChart3,
  Trophy,
  History,
  HeartPulse,
  Settings,
  Flame,
  Zap,
} from 'lucide-react';
import { calculateWeeklyMetrics, calculateProductivityLevel, calculateCurrentStreak } from '../../utils/calculations';

interface NavItem {
  tab: NavTab;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, challenge, sessions, tasks, historicalWeeks, activeTimer } = useApp();

  const metrics = calculateWeeklyMetrics(challenge, sessions);
  const totalHistoricalHours = Math.round(
    sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60 +
      historicalWeeks.reduce((acc, h) => acc + h.completedHours, 0)
  );
  const streakDays = calculateCurrentStreak(sessions, challenge.activeDays);
  const levelInfo = calculateProductivityLevel(totalHistoricalHours, Math.floor(streakDays / 7), sessions.length);

  const pendingTasksCount = tasks.filter((t) => t.status !== 'completed').length;

  const navItems: NavItem[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'challenge', label: 'Weekly Challenge', icon: <Target className="w-5 h-5" /> },
    { tab: 'schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    {
      tab: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-5 h-5" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      tab: 'timer',
      label: 'Time Tracker',
      icon: <Timer className="w-5 h-5" />,
      badge: activeTimer.isActive ? (activeTimer.isBreak ? 'Break' : 'Active') : undefined,
    },
    { tab: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { tab: 'achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
    { tab: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { tab: 'wellness', label: 'Rest & Wellness', icon: <HeartPulse className="w-5 h-5" /> },
    { tab: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-surface-900/95 backdrop-blur-md h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-glow">
            <Zap className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                WEEKLY
              </span>
              <span className="font-extrabold text-lg text-brand-500 font-mono tracking-tight">
                100
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Own Your Time • Beat Your Best
            </p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setCurrentTab(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm border border-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    item.tab === 'timer' && activeTimer.isActive
                      ? activeTimer.isBreak
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini Weekly Target & Level Widget */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-surface-850/80 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {streakDays}d Streak
          </span>
          <span className="text-[11px] font-medium text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full">
            {levelInfo.level}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
            <span>Target Progress</span>
            <span className="font-mono font-medium text-slate-900 dark:text-white">
              {metrics.completedHours} / {metrics.targetHours}h ({metrics.completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.completionPercentage)}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

