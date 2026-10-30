import React from 'react';
import { useApp } from '../../context/AppContext';
import { getDaysOfWeek, formatDateISO, isToday } from '../../utils/dateUtils';
import { Check, Clock, Coffee, AlertCircle, Play } from 'lucide-react';

export const WeeklyOverviewBar: React.FC = () => {
  const { challenge, sessions, setCurrentTab } = useApp();

  const startD = new Date(challenge.startDate + 'T00:00:00');
  const days = getDaysOfWeek(startD);
  const todayISO = formatDateISO(new Date());

  // Aggregate sessions by date
  const dateTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    dateTotals[s.date] = (dateTotals[s.date] || 0) + s.durationMinutes;
  });

  return (
    <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Weekly Schedule & Daily Performance
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Planned target vs actual logged hours across all 7 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Rest Day
          </span>
        </div>
      </div>

      {/* 7-Day Horizontal Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const target = challenge.dailyTargets[day.dayIndex] ?? 0;
          const isRest = !challenge.activeDays.includes(day.dayIndex) || target === 0;
          const completedMin = dateTotals[day.dateStr] || 0;
          const completedHours = Math.round((completedMin / 60) * 10) / 10;
          const remainingHours = Math.max(0, Math.round((target - completedHours) * 10) / 10);
          const isDayToday = day.dateStr === todayISO;
          const isPast = day.dateStr < todayISO;
          const isFuture = day.dateStr > todayISO;

          let stateType: 'completed' | 'in_progress' | 'upcoming' | 'rest_day' | 'missed' = 'upcoming';

          if (isRest) {
            stateType = 'rest_day';
          } else if (completedHours >= target && target > 0) {
            stateType = 'completed';
          } else if (isDayToday) {
            stateType = completedHours > 0 ? 'in_progress' : 'upcoming';
          } else if (isPast) {
            stateType = completedHours >= target ? 'completed' : completedHours > 0 ? 'in_progress' : 'missed';
          } else {
            stateType = 'upcoming';
          }

          // Card Styles by state
          const cardStyles = {
            completed: 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10',
            in_progress: 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-500/10 shadow-glow',
            upcoming: 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-850/40',
            rest_day: 'border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5',
            missed: 'border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/5',
          };

          const indicatorBadges = {
            completed: (
              <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-500">
                <Check className="w-3.5 h-3.5" />
              </span>
            ),
            in_progress: (
              <span className="p-1 rounded-full bg-brand-500/20 text-brand-500 animate-pulse">
                <Clock className="w-3.5 h-3.5" />
              </span>
            ),
            upcoming: (
              <span className="text-[10px] font-medium text-slate-400">
                Plan
              </span>
            ),
            rest_day: (
              <span className="p-1 rounded-full bg-amber-500/20 text-amber-500">
                <Coffee className="w-3.5 h-3.5" />
              </span>
            ),
            missed: (
              <span className="p-1 rounded-full bg-rose-500/20 text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
            ),
          };

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between transition-all ${
                cardStyles[stateType]
              } ${isDayToday ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-white dark:ring-offset-surface-900' : ''}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {day.short}
                    </span>
                    {isDayToday && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-brand-600 text-white">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {day.dateStr.slice(5)}
                  </span>
                </div>
                {indicatorBadges[stateType]}
              </div>

              {/* Planned vs Completed */}
              <div className="my-2 space-y-1">
                {isRest ? (
                  <div className="py-2 text-center">
                    <span className="text-xs font-semibold text-amber-500 block">Rest Day</span>
                    <span className="text-[10px] text-slate-400">0h planned</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-400 text-[11px]">Logged:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {completedHours}h
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-slate-400 text-[11px]">Target:</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {target}h
                      </span>
                    </div>

                    {/* Progress Bar Mini */}
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completedHours >= target
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-brand-600 to-indigo-400'
                        }`}
                        style={{
                          width: `${target > 0 ? Math.min(100, (completedHours / target) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Status Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between items-center">
                <span>{stateType === 'rest_day' ? 'Recovery' : `${remainingHours}h remaining`}</span>
                {isDayToday && !isRest && (
                  <button
                    onClick={() => setCurrentTab('timer')}
                    className="text-brand-500 hover:text-brand-400 font-bold"
                    title="Track today"
                  >
                    Track
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

