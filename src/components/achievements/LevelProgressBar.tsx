import React from 'react';
import { useApp } from '../../context/AppContext';
import { calculateProductivityLevel, calculateCurrentStreak } from '../../utils/calculations';
import { Award, ShieldCheck, Flame, Sparkles } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const LevelProgressBar: React.FC = () => {
  const { sessions, historicalWeeks, challenge } = useApp();

  const totalHistoricalHours = Math.round(
    sessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60 +
      historicalWeeks.reduce((acc, h) => acc + h.completedHours, 0)
  );

  const streakDays = calculateCurrentStreak(sessions, challenge.activeDays);
  const streakWeeks = Math.floor(streakDays / 7);

  const levelInfo = calculateProductivityLevel(
    totalHistoricalHours,
    streakWeeks,
    sessions.length
  );

  const levelDescriptions: Record<string, string> = {
    Beginner: 'Starting your intentional productivity journey with deliberate scheduling.',
    Explorer: 'Forming positive focus habits and discovering optimal cognitive work windows.',
    Consistent: 'Maintaining reliable weekly targets while honoring scheduled rest days.',
    Focused: 'Delivering deep, uninterrupted flow states on complex engineering and learning.',
    Advanced: 'Remarkable long-term consistency and mastery over distraction.',
    Master: 'Productivity luminary: high intentionality, balanced rest, and sustainable greatness.',
  };

  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand-950/30 via-surface-900 to-surface-950 border border-brand-500/20 p-6 sm:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-glow-lg shrink-0">
            <Award className="w-8 h-8 fill-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Productivity Level
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 font-mono">
                {levelInfo.currentXP} XP
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {levelInfo.level}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed">
              {levelDescriptions[levelInfo.level]}
            </p>
          </div>
        </div>

        {/* Level Stats Badges */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-around">
          <div className="text-center p-3 rounded-2xl bg-slate-100/50 dark:bg-surface-850/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">All-Time Hours</span>
            <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
              {totalHistoricalHours}h
            </span>
          </div>

          <div className="text-center p-3 rounded-2xl bg-slate-100/50 dark:bg-surface-850/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">Consistency Streak</span>
            <span className="text-lg font-mono font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" /> {streakDays}d
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar towards Next Level */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Progress to Next Tier</span>
          <span className="font-mono text-brand-400 font-bold">
            {levelInfo.progressToNext}% ({levelInfo.currentXP} / {levelInfo.nextXP} XP)
          </span>
        </div>

        <ProgressBar progress={levelInfo.progressToNext} height="md" />
      </div>
    </div>
  );
};

