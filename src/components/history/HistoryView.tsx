import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HistoricalWeek } from '../../types';
import { WeekComparisonModal } from './WeekComparisonModal';
import {
  History,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  GitCompare,
  TrendingUp,
  FolderKanban,
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const HistoryView: React.FC = () => {
  const { historicalWeeks, categories, resetChallenge, setCurrentTab } = useApp();

  const [compareA, setCompareA] = useState<HistoricalWeek | null>(null);
  const [compareB, setCompareB] = useState<HistoricalWeek | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const handleSelectCompare = (week: HistoricalWeek) => {
    if (!compareA) {
      setCompareA(week);
    } else if (!compareB && compareA.id !== week.id) {
      setCompareB(week);
      setShowCompareModal(true);
    } else {
      setCompareA(week);
      setCompareB(null);
    }
  };

  const handleRepeatChallenge = (week: HistoricalWeek) => {
    resetChallenge({
      name: `${week.name} (Re-sprint)`,
      targetHours: week.targetHours,
    });
    setCurrentTab('dashboard');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weekly Challenge History
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse past performance sprints, compare weekly gains, and repeat favorite configurations
          </p>
        </div>

        {compareA && !compareB && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-400">
            <GitCompare className="w-4 h-4" />
            <span>Select a 2nd week to compare against "{compareA.name}"</span>
            <button
              onClick={() => setCompareA(null)}
              className="text-[10px] underline ml-2 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {historicalWeeks.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-medium text-slate-400">
            No archived weekly challenges yet. Your completed weeks will be safely stored here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historicalWeeks.map((week) => {
            const isSelectedA = compareA?.id === week.id;
            const isSelectedB = compareB?.id === week.id;

            return (
              <div
                key={week.id}
                className={`p-6 rounded-3xl border transition-all bg-white dark:bg-surface-900 shadow-sm ${
                  isSelectedA || isSelectedB
                    ? 'border-brand-500 ring-2 ring-brand-500/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {week.name}
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        {week.startDate} to {week.endDate}
                      </span>
                      {week.completionPercentage >= 100 && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Target Achieved
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Hours */}
                    <div className="max-w-md space-y-1.5 pt-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {week.completedHours} / {week.targetHours} Hours
                        </span>
                        <span className="font-mono font-bold text-brand-500">
                          {week.completionPercentage}%
                        </span>
                      </div>
                      <ProgressBar progress={week.completionPercentage} height="sm" />
                    </div>

                    {/* Category Breakdown Badges */}
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                        <FolderKanban className="w-3 h-3" /> Focus:
                      </span>
                      {Object.entries(week.categoryBreakdown || {}).map(([catId, hours]) => {
                        const cat = categories.find((c) => c.id === catId);
                        return (
                          <span
                            key={catId}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                          >
                            {cat ? cat.name : 'Focus'}: {hours}h
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right KPI Stats & Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 block">Sessions</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                          {week.totalSessionsCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 block">Tasks Done</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                          {week.completedTasksCount}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface-850 min-w-[70px]">
                        <span className="text-[10px] text-slate-400 block">Active Days</span>
                        <span className="font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
                          {week.activeDaysCount}d
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectCompare(week)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                          isSelectedA
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-brand-500 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        {isSelectedA ? 'Selected' : 'Compare'}
                      </button>

                      <button
                        onClick={() => handleRepeatChallenge(week)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                        title="Repeat this weekly configuration"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Repeat Target
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Week Comparison Modal */}
      <WeekComparisonModal
        isOpen={showCompareModal}
        onClose={() => {
          setShowCompareModal(false);
          setCompareA(null);
          setCompareB(null);
        }}
        weekA={compareA}
        weekB={compareB}
        categories={categories}
      />
    </div>
  );
};

