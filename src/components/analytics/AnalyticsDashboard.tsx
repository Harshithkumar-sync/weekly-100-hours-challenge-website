import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProductivityCharts } from './ProductivityCharts';
import { ProductivityInsights } from './ProductivityInsights';
import { calculateWeeklyMetrics } from '../../utils/calculations';
import { DAY_NAMES, formatDurationHMS } from '../../utils/dateUtils';
import {
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Award,
  Filter,
  Download,
  CheckCircle2,
  TrendingDown,
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { challenge, sessions, categories, historicalWeeks, exportDataJSON } = useApp();

  const [timeFilter, setTimeFilter] = useState<'this_week' | 'last_week' | 'last_4_weeks' | 'all'>('this_week');

  const metrics = calculateWeeklyMetrics(challenge, sessions);

  // Filter sessions according to time range
  const filteredSessions = sessions.filter((s) => {
    if (timeFilter === 'this_week') {
      return s.date >= challenge.startDate && s.date <= challenge.endDate;
    }
    return true;
  });

  const totalMin = filteredSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = Math.round((totalMin / 60) * 10) / 10;
  const avgSessionMin = filteredSessions.length > 0 ? Math.round(totalMin / filteredSessions.length) : 0;

  // Best day and lowest day
  const dayMinutes: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  filteredSessions.forEach((s) => {
    try {
      const parts = s.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dayMinutes[d.getDay()] += s.durationMinutes;
    } catch {
      // ignore
    }
  });

  let bestDayIdx = -1;
  let lowestDayIdx = -1;
  let maxMin = -1;
  let minMin = 999999;

  for (let i = 0; i < 7; i++) {
    if (dayMinutes[i] > maxMin) {
      maxMin = dayMinutes[i];
      bestDayIdx = i;
    }
    if (dayMinutes[i] < minMin && challenge.activeDays.includes(i)) {
      minMin = dayMinutes[i];
      lowestDayIdx = i;
    }
  }

  const bestDayStr = bestDayIdx !== -1 && maxMin > 0 ? `${DAY_NAMES[bestDayIdx]} (${(maxMin / 60).toFixed(1)}h)` : 'N/A';
  const lowestDayStr = lowestDayIdx !== -1 ? `${DAY_NAMES[lowestDayIdx]} (${(minMin / 60).toFixed(1)}h)` : 'N/A';

  const handleDownloadBackup = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-100-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced Analytics & Statistics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empirical data visualizations, session distributions, and performance intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-semibold">
            {[
              { id: 'this_week', label: 'This Week' },
              { id: 'all', label: 'All Time' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTimeFilter(f.id as unknown as typeof timeFilter)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeFilter === f.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadBackup}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-900 text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Export Report JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards (Section 7 Weekly Analytics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Planned</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {metrics.targetHours}h
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Completed</span>
          <span className="text-lg font-bold font-mono text-brand-500 mt-1 block">
            {totalHours}h
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Target %</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
            {metrics.completionPercentage}%
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Daily Avg</span>
          <span className="text-lg font-bold font-mono text-indigo-400 mt-1 block">
            {metrics.averageCompletedPerActiveDay}h
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Peak Day</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">
            {bestDayStr}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Lowest Day</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">
            {lowestDayStr}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Sessions</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {filteredSessions.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Duration</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {avgSessionMin}m
          </span>
        </div>
      </div>

      {/* Recharts Analytics Charts Component */}
      <ProductivityCharts
        challenge={challenge}
        sessions={filteredSessions}
        categories={categories}
        history={historicalWeeks}
      />

      {/* Calculated Productivity Insights */}
      <ProductivityInsights />
    </div>
  );
};

