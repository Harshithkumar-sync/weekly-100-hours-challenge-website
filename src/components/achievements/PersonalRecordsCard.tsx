import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Trophy, Calendar, CheckSquare, Zap, Star } from 'lucide-react';

export const PersonalRecordsCard: React.FC = () => {
  const { personalRecords } = useApp();

  const records = [
    {
      label: 'Highest Weekly Productive Hours',
      value: `${personalRecords.highestWeeklyHours.hours} Hours`,
      sub: personalRecords.highestWeeklyHours.weekLabel,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/20 bg-amber-500/5',
    },
    {
      label: 'Best Daily Performance',
      value: `${personalRecords.bestDailyHours.hours} Hours`,
      sub: `Recorded on ${personalRecords.bestDailyHours.date}`,
      icon: <Zap className="w-5 h-5 text-brand-400" />,
      color: 'border-brand-500/20 bg-brand-500/5',
    },
    {
      label: 'Longest Consistency Streak',
      value: `${personalRecords.longestConsistencyStreakDays.days} Days`,
      sub: 'Consecutive active target days',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: 'border-rose-500/20 bg-rose-500/5',
    },
    {
      label: 'Most Tasks Finished in 1 Week',
      value: `${personalRecords.mostTasksCompletedInWeek.count} Tasks`,
      sub: personalRecords.mostTasksCompletedInWeek.weekLabel,
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/20 bg-emerald-500/5',
    },
    {
      label: 'Highest Target Completion Rate',
      value: `${personalRecords.bestWeeklyCompletionPercentage.percentage}%`,
      sub: personalRecords.bestWeeklyCompletionPercentage.weekLabel,
      icon: <Star className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/20 bg-indigo-500/5',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Personal All-Time Records
        </h4>
        <span className="text-xs text-slate-400">
          (Honoring consistent, sustainable mastery)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {records.map((rec) => (
          <div
            key={rec.label}
            className={`p-5 rounded-2xl border ${rec.color} flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                {rec.label}
              </span>
              <div className="p-2 rounded-xl bg-black/10 dark:bg-white/10 shrink-0">
                {rec.icon}
              </div>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                {rec.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {rec.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

