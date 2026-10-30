import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateWeeklyMetrics } from '../../utils/calculations';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { SunMedium, Play, CheckCircle2, Moon, Coffee } from 'lucide-react';

export const TodayProgressCard: React.FC = () => {
  const { challenge, sessions, setCurrentTab, activeTimer } = useApp();
  const metrics = calculateWeeklyMetrics(challenge, sessions);

  const statusConfig = {
    not_started: { label: 'Not Started', variant: 'neutral' as const },
    in_progress: { label: 'In Progress', variant: 'primary' as const },
    completed: { label: 'Completed', variant: 'success' as const },
    over_target: { label: 'Over Target', variant: 'success' as const },
    rest_day: { label: 'Rest Day', variant: 'warning' as const },
  };

  const currentStatus = statusConfig[metrics.todayStatus];

  return (
    <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              {metrics.todayStatus === 'rest_day' ? <Coffee className="w-4 h-4" /> : <SunMedium className="w-4 h-4" />}
            </span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daily Focus
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Today's Target
              </h4>
            </div>
          </div>
          <Badge variant={currentStatus.variant} size="sm">
            {currentStatus.label}
          </Badge>
        </div>

        {/* Target vs Completed */}
        <div className="space-y-1 mb-5">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {metrics.todayCompletedHours}
            </span>
            <span className="text-lg font-mono text-slate-400 font-bold">
              / {metrics.todayTargetHours} HOURS
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {metrics.todayStatus === 'rest_day'
              ? 'Today is scheduled as a recovery rest day. Recharge your mind!'
              : metrics.todayRemainingHours > 0
              ? `${metrics.todayRemainingHours} hours remaining to hit daily target.`
              : 'Daily goal reached! Protect your sleep schedule.'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <ProgressBar
            progress={metrics.todayCompletionPercentage}
            height="md"
            showLabel
          />
        </div>
      </div>

      {/* Action / State */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {metrics.todayStatus === 'completed' || metrics.todayStatus === 'over_target' ? (
            <span className="inline-flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Target Achieved
            </span>
          ) : (
            `${Math.round(metrics.todayCompletedHours * 60)}m logged today`
          )}
        </span>

        {!activeTimer.isActive && metrics.todayStatus !== 'rest_day' && (
          <button
            onClick={() => setCurrentTab('timer')}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Play className="w-3 h-3 fill-white" /> Focus Now
          </button>
        )}
      </div>
    </div>
  );
};

