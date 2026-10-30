import React from 'react';
import { HistoricalWeek, Category } from '../../types';
import { Modal } from '../common/Modal';
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle, Clock } from 'lucide-react';

interface WeekComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekA: HistoricalWeek | null;
  weekB: HistoricalWeek | null;
  categories: Category[];
}

export const WeekComparisonModal: React.FC<WeekComparisonModalProps> = ({
  isOpen,
  onClose,
  weekA,
  weekB,
  categories,
}) => {
  if (!isOpen || !weekA || !weekB) return null;

  const hoursDiff = Math.round((weekB.completedHours - weekA.completedHours) * 10) / 10;
  const pctDiff = Math.round(weekB.completionPercentage - weekA.completionPercentage);
  const tasksDiff = weekB.completedTasksCount - weekA.completedTasksCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weekly Challenge Comparison"
      subtitle={`Comparing ${weekA.name} vs ${weekB.name}`}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Metric Comparison Table */}
        <div className="grid grid-cols-3 gap-3 text-center border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-850">
            <span className="text-xs text-slate-400 block">{weekA.name}</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
              {weekA.completedHours}h
            </span>
            <span className="text-[10px] text-slate-400">{weekA.completionPercentage}% of {weekA.targetHours}h</span>
          </div>

          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Delta Variance</span>
            <div className="flex items-center gap-1 font-mono font-black text-lg mt-1">
              {hoursDiff > 0 ? (
                <span className="text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-4 h-4" /> +{hoursDiff}h
                </span>
              ) : hoursDiff < 0 ? (
                <span className="text-rose-400 flex items-center">
                  <ArrowDownRight className="w-4 h-4" /> {hoursDiff}h
                </span>
              ) : (
                <span className="text-slate-400 flex items-center">
                  <Minus className="w-4 h-4" /> 0h
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {pctDiff >= 0 ? `+${pctDiff}%` : `${pctDiff}%`} target rate
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-surface-850">
            <span className="text-xs text-slate-400 block">{weekB.name}</span>
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
              {weekB.completedHours}h
            </span>
            <span className="text-[10px] text-slate-400">{weekB.completionPercentage}% of {weekB.targetHours}h</span>
          </div>
        </div>

        {/* Detailed Metrics Comparison List */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Comparative Breakdown
          </h5>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Target Hours Set:</span>
              <div className="font-mono space-x-4">
                <span className="text-slate-400">{weekA.targetHours}h</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-900 dark:text-white font-bold">{weekB.targetHours}h</span>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Completed Focus Sessions:</span>
              <div className="font-mono space-x-4">
                <span className="text-slate-400">{weekA.totalSessionsCount}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-900 dark:text-white font-bold">{weekB.totalSessionsCount}</span>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Completed Tasks:</span>
              <div className="font-mono space-x-4">
                <span className="text-slate-400">{weekA.completedTasksCount}</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {weekB.completedTasksCount} ({tasksDiff >= 0 ? `+${tasksDiff}` : tasksDiff})
                </span>
              </div>
            </div>

            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-400">Active vs Missed Days:</span>
              <div className="font-mono space-x-4">
                <span className="text-slate-400">{weekA.activeDaysCount}d active</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {weekB.activeDaysCount}d active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conclusion Insight */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 leading-relaxed">
          {hoursDiff > 0 ? (
            <p>
              Productivity <strong className="text-emerald-400 font-semibold">increased by {hoursDiff} hours</strong> in{' '}
              {weekB.name}. Your consistency pace and focus depth showed strong upward momentum.
            </p>
          ) : hoursDiff < 0 ? (
            <p>
              Productivity was <strong className="text-slate-200 font-semibold">{Math.abs(hoursDiff)} hours lower</strong> in{' '}
              {weekB.name}. This is normal and healthy during periods of recovery or schedule realignment.
            </p>
          ) : (
            <p>
              Productive output was exactly identical across both weekly sprints ({weekA.completedHours}h).
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </Modal>
  );
};

