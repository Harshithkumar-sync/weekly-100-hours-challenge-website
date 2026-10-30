import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, Heart } from 'lucide-react';
import { DAY_NAMES } from '../../utils/dateUtils';

interface SmartPlanningAssistantProps {
  currentWeeklyTarget: number;
  currentActiveDays: number[];
  onApplyDistribution: (daily: Record<number, number>, targetHours: number) => void;
}

export const SmartPlanningAssistant: React.FC<SmartPlanningAssistantProps> = ({
  currentWeeklyTarget,
  currentActiveDays,
  onApplyDistribution,
}) => {
  const { profile } = useApp();
  const [strategy, setStrategy] = useState<'balanced' | 'front_loaded' | 'weekend_light' | 'deep_bursts'>('balanced');
  const [target, setTarget] = useState(currentWeeklyTarget);

  const activeDaysCount = currentActiveDays.length;

  // Calculate recommendation
  const maxSafeDaily = profile.wellness.maxDailyProductiveHours || 10;
  const maxWeeklySafe = activeDaysCount * maxSafeDaily;
  const isOverSafeLimit = target > maxWeeklySafe;

  const generateDistribution = (): Record<number, number> => {
    const res: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    if (activeDaysCount === 0) return res;

    const daysSorted = [...currentActiveDays].sort();

    if (strategy === 'balanced') {
      const avg = Math.floor((target / activeDaysCount) * 10) / 10;
      let rem = Math.round((target - avg * activeDaysCount) * 10) / 10;

      daysSorted.forEach((d) => {
        let add = avg;
        if (rem > 0.05) {
          add += 0.5;
          rem -= 0.5;
        }
        res[d] = Math.round(add * 10) / 10;
      });
    } else if (strategy === 'front_loaded') {
      // Heavier early week (Mon-Wed), lighter later
      const total = target;
      const count = daysSorted.length;
      let left = total;

      daysSorted.forEach((d, idx) => {
        let proportion = 1.0;
        if (idx < Math.ceil(count / 2)) {
          proportion = 1.25; // higher in first half
        } else {
          proportion = 0.75; // lighter in second half
        }
        let hours = Math.round((total / count) * proportion * 2) / 2;
        hours = Math.min(left, hours);
        res[d] = hours;
        left -= hours;
      });

      // Spread remainder
      if (left > 0) {
        res[daysSorted[0]] = Math.round((res[daysSorted[0]] + left) * 10) / 10;
      }
    } else if (strategy === 'weekend_light') {
      // Lighter on Friday & Saturday, heavy on Mon-Thu
      daysSorted.forEach((d) => {
        if (d === 5 || d === 6) {
          res[d] = Math.max(3, Math.round((target / activeDaysCount) * 0.7 * 2) / 2);
        } else {
          res[d] = Math.round((target / activeDaysCount) * 1.15 * 2) / 2;
        }
      });
      // Adjust total exactly
      const currentSum = Object.values(res).reduce((a, b) => a + b, 0);
      const diff = Math.round((target - currentSum) * 10) / 10;
      if (diff !== 0 && daysSorted.length > 0) {
        res[daysSorted[0]] = Math.max(0, Math.round((res[daysSorted[0]] + diff) * 10) / 10);
      }
    } else {
      // deep_bursts: 3 heavy sprint days, rest moderate
      daysSorted.forEach((d, idx) => {
        if (idx % 2 === 0) {
          res[d] = Math.round((target / activeDaysCount) * 1.3 * 2) / 2;
        } else {
          res[d] = Math.round((target / activeDaysCount) * 0.7 * 2) / 2;
        }
      });
      const currentSum = Object.values(res).reduce((a, b) => a + b, 0);
      const diff = Math.round((target - currentSum) * 10) / 10;
      if (diff !== 0 && daysSorted.length > 0) {
        res[daysSorted[0]] = Math.max(0, Math.round((res[daysSorted[0]] + diff) * 10) / 10);
      }
    }

    return res;
  };

  const previewDaily = generateDistribution();
  const previewSum = Object.values(previewDaily).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand-950/20 via-surface-900 to-surface-950 border border-brand-500/20 p-6 sm:p-7 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="p-2 rounded-xl bg-brand-500/15 text-brand-400">
          <Sparkles className="w-5 h-5" />
        </span>
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Smart Weekly Planning Assistant
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent algorithmic distribution for sustainable cognitive output
          </p>
        </div>
      </div>

      {/* Wellness Warning if target exceeds realistic capacity */}
      {isOverSafeLimit && (
        <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Over-Commitment Advisory</span>
            <p className="text-amber-200/80 leading-relaxed">
              Your target of {target}h across {activeDaysCount} active days requires an average of{' '}
              {(target / activeDaysCount).toFixed(1)}h/day, exceeding your maximum recommended daily limit of{' '}
              {maxSafeDaily}h. We recommend reducing the target to {maxWeeklySafe}h or adding an active day to protect sleep.
            </p>
          </div>
        </div>
      )}

      {/* Strategies Picker */}
      <div className="mt-5 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Select Pacing Strategy
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'balanced', label: 'Balanced', desc: 'Equal daily effort' },
            { id: 'front_loaded', label: 'Front-Loaded', desc: 'Heavy Mon-Wed' },
            { id: 'weekend_light', label: 'Weekend-Light', desc: 'Taper for weekend' },
            { id: 'deep_bursts', label: 'High Sprint', desc: 'Alternating sprints' },
          ].map((strat) => (
            <button
              key={strat.id}
              onClick={() => setStrategy(strat.id as unknown as typeof strategy)}
              className={`p-3 rounded-xl border text-left transition-all ${
                strategy === strat.id
                  ? 'bg-brand-500/20 border-brand-500 text-white font-semibold'
                  : 'bg-slate-100/50 dark:bg-surface-850/50 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold block">{strat.label}</span>
              <span className="text-[10px] opacity-70 block mt-0.5">{strat.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Calculated Distribution */}
      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-slate-400">Suggested Daily Allocation:</span>
          <span className="font-mono font-bold text-brand-400">Total: {previewSum.toFixed(1)}h</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => {
            const isActive = currentActiveDays.includes(d);
            const hours = previewDaily[d] || 0;
            return (
              <div
                key={d}
                className={`p-2.5 rounded-xl text-center border ${
                  isActive
                    ? 'bg-brand-500/10 border-brand-500/30'
                    : 'bg-slate-100/30 dark:bg-surface-850/30 border-transparent opacity-40'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 block">{DAY_NAMES[d].slice(0, 3)}</span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white mt-1 block">
                  {isActive ? `${hours}h` : 'Rest'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onApplyDistribution(previewDaily, target)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all"
        >
          <CheckCircle2 className="w-4 h-4" /> Apply Smart Schedule
        </button>
      </div>
    </div>
  );
};

