import React from 'react';
import { useApp } from '../../context/AppContext';
import { CircularProgress } from '../common/CircularProgress';
import { calculateWeeklyMetrics } from '../../utils/calculations';
import { Target, CheckCircle2, Clock, Flame, ArrowUpRight } from 'lucide-react';

export const WeeklyProgressCard: React.FC = () => {
  const { challenge, sessions, setCurrentTab } = useApp();
  const metrics = calculateWeeklyMetrics(challenge, sessions);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/80 transition-all">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Stats Column */}
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <Target className="w-5 h-5" />
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weekly Challenge
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {challenge.name}
              </h3>
            </div>
          </div>

          {/* Main Huge Stats */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {metrics.completedHours}
              </span>
              <span className="text-xl sm:text-2xl font-mono text-slate-400 dark:text-slate-500 font-bold">
                / {metrics.targetHours} HOURS
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-bold font-mono text-brand-600 dark:text-brand-400">
                {metrics.completionPercentage}% COMPLETED
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {metrics.remainingHours > 0 ? `${metrics.remainingHours}h remaining` : 'Target Exceeded!'}
              </span>
            </div>
          </div>

          {/* Active Days Breakdown Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-850/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Daily Completed Avg
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {metrics.averageCompletedPerActiveDay} hrs/day
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-850/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Required Remaining Avg
              </span>
              <span className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400">
                {metrics.requiredAveragePerRemainingDay} hrs/day
              </span>
            </div>

            <div className="hidden sm:block p-3 rounded-xl bg-slate-50 dark:bg-surface-850/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                Remaining Active Days
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                {metrics.remainingActiveDays} of {metrics.activeDaysCount} days
              </span>
            </div>
          </div>

          {/* Quick link to Challenge Details */}
          <div className="pt-1">
            <button
              onClick={() => setCurrentTab('challenge')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 inline-flex items-center gap-1"
            >
              Adjust weekly distribution <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Circular Gauge */}
        <div className="flex flex-col items-center justify-center p-2">
          <CircularProgress
            percentage={metrics.completionPercentage}
            size={170}
            strokeWidth={13}
            primaryValue={`${metrics.completionPercentage}%`}
            subLabel={metrics.isCompleted ? 'GOAL MET' : 'WEEKLY PROGRESS'}
          />
          <div className="mt-3 text-center">
            {metrics.isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved!
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Challenge Ends Sunday
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

