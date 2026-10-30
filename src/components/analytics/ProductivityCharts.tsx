import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TimeSession, WeeklyChallenge, Category, HistoricalWeek } from '../../types';
import { DAY_NAMES, DAY_SHORT } from '../../utils/dateUtils';

interface ProductivityChartsProps {
  challenge: WeeklyChallenge;
  sessions: TimeSession[];
  categories: Category[];
  history: HistoricalWeek[];
}

export const ProductivityCharts: React.FC<ProductivityChartsProps> = ({
  challenge,
  sessions,
  categories,
  history,
}) => {
  // 1. Daily Planned vs Actual Hours Data
  const dailyData = [1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
    const planned = challenge.dailyTargets[dayIdx] ?? 0;
    // Sum actual sessions for this day of week in current challenge range
    const daySessions = sessions.filter((s) => {
      try {
        const parts = s.date.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return (
          d.getDay() === dayIdx &&
          s.date >= challenge.startDate &&
          s.date <= challenge.endDate
        );
      } catch {
        return false;
      }
    });

    const completedMin = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const actual = Math.round((completedMin / 60) * 10) / 10;

    return {
      name: DAY_SHORT[dayIdx],
      fullName: DAY_NAMES[dayIdx],
      Planned: planned,
      Actual: actual,
    };
  });

  // 2. Category Distribution Donut Data
  const catMinutes: Record<string, number> = {};
  const weekSessions = sessions.filter(
    (s) => s.date >= challenge.startDate && s.date <= challenge.endDate
  );

  weekSessions.forEach((s) => {
    catMinutes[s.categoryId] = (catMinutes[s.categoryId] || 0) + s.durationMinutes;
  });

  const categoryData = Object.entries(catMinutes)
    .filter(([_, min]) => min > 0)
    .map(([catId, min]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat ? cat.name : 'Other',
        hours: Math.round((min / 60) * 10) / 10,
        color: cat ? cat.color : '#6366f1',
      };
    });

  // Fallback if no categories logged yet
  if (categoryData.length === 0) {
    categoryData.push({ name: 'No sessions yet', hours: 1, color: '#64748b' });
  }

  // 3. Weekly Multi-Week Productivity Trend Data
  const trendData = [
    ...history.slice().reverse().map((h) => ({
      name: h.name.length > 15 ? h.name.slice(0, 15) + '...' : h.name,
      target: h.targetHours,
      completed: h.completedHours,
    })),
    {
      name: 'Current Week',
      target: challenge.targetHours,
      completed: Math.round(weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60 * 10) / 10,
    },
  ];

  // 4. Session Duration Distribution (e.g. <30m, 30-60m, 60-90m, 90-120m, 120m+)
  const durationBuckets = [
    { label: '< 30m', count: 0 },
    { label: '30-60m', count: 0 },
    { label: '60-90m', count: 0 },
    { label: '90-120m', count: 0 },
    { label: '120m+', count: 0 },
  ];

  weekSessions.forEach((s) => {
    const min = s.durationMinutes;
    if (min < 30) durationBuckets[0].count++;
    else if (min <= 60) durationBuckets[1].count++;
    else if (min <= 90) durationBuckets[2].count++;
    else if (min <= 120) durationBuckets[3].count++;
    else durationBuckets[4].count++;
  });

  return (
    <div className="space-y-6">
      {/* Top 2 Charts: Planned vs Actual & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Planned vs Actual Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Planned vs Actual Productive Hours
              </h4>
              <p className="text-xs text-slate-400">
                Daily comparison for the active weekly challenge
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-700" /> Planned
              </span>
              <span className="flex items-center gap-1.5 text-brand-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Actual
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="Planned" fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Actual" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Donut */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Category Time Allocation
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown across your focus categories
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="hours"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} hrs`, 'Focus Time']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-mono font-semibold text-slate-900 dark:text-white shrink-0">
                  {cat.hours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 2 Charts: Weekly Trend Area & Session Duration Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Week Trend */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Productivity Trend
              </h4>
              <p className="text-xs text-slate-400">
                Historical week-over-week intentional hours
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} unit="h" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trendGradient)"
                  name="Completed Hours"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#475569"
                  strokeDasharray="4 4"
                  fill="none"
                  name="Target Goal"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Session Duration Breakdown */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Focus Session Duration Distribution
              </h4>
              <p className="text-xs text-slate-400">
                Count of sessions by length (deep work endurance)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

