import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Moon,
  Coffee,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { DAY_NAMES } from '../../utils/dateUtils';
import { calculateWeeklyMetrics } from '../../utils/calculations';

export const RestWellnessView: React.FC = () => {
  const { profile, updateProfile, challenge, sessions } = useApp();
  const metrics = calculateWeeklyMetrics(challenge, sessions);

  const [targetSleepHours, setTargetSleepHours] = useState(profile.wellness.targetSleepHours || 8);
  const [sleepStart, setSleepStart] = useState(profile.wellness.sleepStartTime || '23:00');
  const [sleepEnd, setSleepEnd] = useState(profile.wellness.sleepEndTime || '07:00');
  const [dailyDowntimeHours, setDailyDowntimeHours] = useState(profile.wellness.dailyDowntimeTargetHours || 3);
  const [enforceRestDays, setEnforceRestDays] = useState(profile.wellness.enforceRestDays ?? true);
  const [breakIntervalMin, setBreakIntervalMin] = useState(profile.wellness.breakIntervalMinutes || 50);

  // Active rest days
  const restDayIndices = [0, 1, 2, 3, 4, 5, 6].filter((d) => !challenge.activeDays.includes(d));

  // Compute 24-hour balance calculation
  const plannedAvgProductive = metrics.averageCompletedPerActiveDay || (challenge.targetHours / (challenge.activeDaysCount || 1));
  const committedHours = targetSleepHours + plannedAvgProductive + dailyDowntimeHours;
  const isOvercommitted = committedHours > 24;

  const handleSaveWellness = () => {
    updateProfile({
      wellness: {
        targetSleepHours,
        sleepStartTime: sleepStart,
        sleepEndTime: sleepEnd,
        maxDailyProductiveHours: profile.wellness.maxDailyProductiveHours,
        breakIntervalMinutes: breakIntervalMin,
        enforceRestDays,
        dailyDowntimeTargetHours: dailyDowntimeHours,
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
            Rest & Wellness Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Don't just count the hours. Make every hour intentional." Protect your sleep and downtime.
          </p>
        </div>

        <button
          onClick={handleSaveWellness}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all self-start sm:self-auto"
        >
          Save Wellness Settings
        </button>
      </div>

      {/* Sustainable Productivity Principle Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Sustainable Productivity Oath
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              WEEKLY 100 is a personal planning tool for deep focus — <strong>never a reason to reduce sleep, skip meals, or sacrifice health</strong>. Sleep and break hours are strictly excluded from productive hour totals.
            </p>
          </div>
        </div>
      </div>

      {/* Over-commitment / Health Warning if 24-hour balance violated */}
      {isOvercommitted && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">Schedule Deficit Detected</span>
            <p className="text-amber-200/80 leading-relaxed">
              Your planned sleep ({targetSleepHours}h) + average daily productive target ({plannedAvgProductive.toFixed(1)}h) + downtime ({dailyDowntimeHours}h) equals {committedHours.toFixed(1)} hours, which exceeds 24 hours per day! We strongly recommend reducing your weekly challenge target to maintain mental sharpness and avoid burnout.
            </p>
          </div>
        </div>
      )}

      {/* 24-Hour Balance Visual Bar */}
      <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Daily 24-Hour Balance Allocation
            </h4>
            <p className="text-xs text-slate-400">
              Balanced breakdown of your typical day
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
            24.0 Hours Total
          </span>
        </div>

        {/* Triple segmented balance bar */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {/* Sleep */}
            <div
              style={{ width: `${Math.min(100, (targetSleepHours / 24) * 100)}%` }}
              className="bg-indigo-500 h-full"
              title={`Sleep: ${targetSleepHours}h`}
            />
            {/* Work */}
            <div
              style={{ width: `${Math.min(100, (plannedAvgProductive / 24) * 100)}%` }}
              className="bg-brand-500 h-full"
              title={`Productive Focus: ${plannedAvgProductive.toFixed(1)}h`}
            />
            {/* Downtime */}
            <div
              style={{ width: `${Math.min(100, (dailyDowntimeHours / 24) * 100)}%` }}
              className="bg-emerald-500 h-full"
              title={`Downtime & Meals: ${dailyDowntimeHours}h`}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Sleep ({targetSleepHours}h)
            </span>
            <span className="flex items-center gap-1.5 text-brand-400">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500" /> Focus Target ({plannedAvgProductive.toFixed(1)}h)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Downtime & Family ({dailyDowntimeHours}h)
            </span>
          </div>
        </div>
      </div>

      {/* Wellness Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Planning Card */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Sleep Schedule Planning
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Target Nightly Sleep
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="6"
                  max="10"
                  value={targetSleepHours}
                  onChange={(e) => setTargetSleepHours(parseFloat(e.target.value) || 8)}
                  className="w-16 px-2 py-1 text-right font-mono font-bold text-sm bg-slate-100 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Bedtime Target</label>
                <input
                  type="time"
                  value={sleepStart}
                  onChange={(e) => setSleepStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-400">Wake Time</label>
                <input
                  type="time"
                  value={sleepEnd}
                  onChange={(e) => setSleepEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rest Day & Downtime Tracking */}
        <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Coffee className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Rest-Day & Downtime Tracking
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Daily Non-Screen Downtime Goal
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="8"
                  value={dailyDowntimeHours}
                  onChange={(e) => setDailyDowntimeHours(parseFloat(e.target.value) || 3)}
                  className="w-16 px-2 py-1 text-right font-mono font-bold text-sm bg-slate-100 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Scheduled Weekly Rest Days:
              </span>
              <div className="flex items-center gap-2 pt-1">
                {restDayIndices.length > 0 ? (
                  restDayIndices.map((d) => (
                    <span
                      key={d}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold"
                    >
                      {DAY_NAMES[d]}
                    </span>
                  ))
                ) : (
                  <span className="text-rose-400 font-medium">
                    No rest days scheduled. Adding 1-2 rest days is strongly advised!
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="enforceRest"
                checked={enforceRestDays}
                onChange={(e) => setEnforceRestDays(e.target.checked)}
                className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="enforceRest" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                Protect rest days in streak calculation (taking rest days will not break consistency streak)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

