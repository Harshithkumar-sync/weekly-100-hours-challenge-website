import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateWeeklyMetrics, calculateCurrentStreak } from '../../utils/calculations';
import { DAY_NAMES } from '../../utils/dateUtils';
import { Clock, Flame, Zap, Award, FolderKanban, Timer } from 'lucide-react';

export const ProductivitySummary: React.FC = () => {
  const { challenge, sessions, categories } = useApp();
  const metrics = calculateWeeklyMetrics(challenge, sessions);
  const streak = calculateCurrentStreak(sessions, challenge.activeDays);

  // Filter sessions for current challenge
  const weekSessions = sessions.filter(
    (s) => s.date >= challenge.startDate && s.date <= challenge.endDate
  );

  // Best day this week
  const dayMinutes: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  weekSessions.forEach((s) => {
    try {
      const parts = s.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dayMinutes[d.getDay()] += s.durationMinutes;
    } catch {
      // ignore
    }
  });

  let bestDayIndex = -1;
  let maxDayMin = 0;
  for (let i = 0; i < 7; i++) {
    if (dayMinutes[i] > maxDayMin) {
      maxDayMin = dayMinutes[i];
      bestDayIndex = i;
    }
  }

  const bestDayLabel = bestDayIndex !== -1 ? `${DAY_NAMES[bestDayIndex]} (${(maxDayMin / 60).toFixed(1)}h)` : 'None yet';

  // Most productive category
  const catMinutes: Record<string, number> = {};
  weekSessions.forEach((s) => {
    catMinutes[s.categoryId] = (catMinutes[s.categoryId] || 0) + s.durationMinutes;
  });

  let topCatId = '';
  let topCatMin = 0;
  for (const catId in catMinutes) {
    if (catMinutes[catId] > topCatMin) {
      topCatMin = catMinutes[catId];
      topCatId = catId;
    }
  }

  const topCategoryObj = categories.find((c) => c.id === topCatId);
  const topCategoryLabel = topCategoryObj
    ? `${topCategoryObj.name} (${(topCatMin / 60).toFixed(1)}h)`
    : 'None yet';

  const summaryCards = [
    {
      label: 'Total Productive Time',
      value: `${metrics.completedHours} hrs`,
      sub: `${Math.round(metrics.completedHours * 60)} minutes recorded`,
      icon: <Clock className="w-4 h-4 text-brand-500" />,
    },
    {
      label: 'Total Focus Sessions',
      value: `${weekSessions.length}`,
      sub: `${weekSessions.filter((s) => !s.isManual).length} live / ${weekSessions.filter((s) => s.isManual).length} logged`,
      icon: <Timer className="w-4 h-4 text-emerald-500" />,
    },
    {
      label: 'Average Daily Output',
      value: `${metrics.averageCompletedPerActiveDay} hrs/day`,
      sub: `Across ${metrics.elapsedActiveDays} active day(s) so far`,
      icon: <Zap className="w-4 h-4 text-blue-500" />,
    },
    {
      label: 'Best Performing Day',
      value: bestDayLabel,
      sub: 'Peak focus duration',
      icon: <Award className="w-4 h-4 text-purple-500" />,
    },
    {
      label: 'Dominant Category',
      value: topCategoryLabel,
      sub: topCategoryObj ? 'Highest invested focus' : 'No data yet',
      icon: <FolderKanban className="w-4 h-4 text-amber-500" />,
    },
    {
      label: 'Consistency Streak',
      value: `${streak} Days`,
      sub: 'Active target streak maintained',
      icon: <Flame className="w-4 h-4 text-rose-500" />,
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Productivity Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                {card.icon}
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white truncate">
              {card.value}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {card.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

