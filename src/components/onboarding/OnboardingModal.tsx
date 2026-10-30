import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import { DAY_NAMES, DAY_SHORT } from '../../utils/dateUtils';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, completeOnboarding, categories } = useApp();
  const [step, setStep] = useState(1);

  // Configuration state
  const [targetHours, setTargetHours] = useState(40);
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 4, 5, 6]); // Mon-Sat
  const [dailyTargets, setDailyTargets] = useState<Record<number, number>>({
    1: 7,
    2: 7,
    3: 7,
    4: 7,
    5: 6,
    6: 6,
    0: 0,
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([
    'cat-coding',
    'cat-software-dev',
    'cat-study',
    'cat-reading',
  ]);
  const [preferredWorkTime, setPreferredWorkTime] = useState({
    start: '09:00',
    end: '18:00',
  });

  if (!showOnboarding) return null;

  // Distribute targetHours evenly across active days
  const autoDistributeHours = (total: number, days: number[]) => {
    if (days.length === 0) return;
    const base = Math.floor((total / days.length) * 10) / 10;
    let remainder = Math.round((total - base * days.length) * 10) / 10;

    const newDaily: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    days.forEach((d) => {
      let allocated = base;
      if (remainder > 0.05) {
        allocated += 0.5;
        remainder -= 0.5;
      }
      newDaily[d] = Math.round(allocated * 10) / 10;
    });
    setDailyTargets(newDaily);
  };

  const handleTargetChange = (val: number) => {
    const clamped = Math.min(99, Math.max(1, val));
    setTargetHours(clamped);
    autoDistributeHours(clamped, activeDays);
  };

  const toggleDay = (dayIndex: number) => {
    let updated: number[];
    if (activeDays.includes(dayIndex)) {
      if (activeDays.length <= 1) return; // Must have at least 1 active day
      updated = activeDays.filter((d) => d !== dayIndex);
    } else {
      updated = [...activeDays, dayIndex].sort();
    }
    setActiveDays(updated);
    autoDistributeHours(targetHours, updated);
  };

  const handleDailyTargetChange = (dayIndex: number, hours: number) => {
    setDailyTargets((prev) => ({
      ...prev,
      [dayIndex]: Math.min(24, Math.max(0, hours)),
    }));
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      if (selectedCategoryIds.length <= 1) return;
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const totalCalculatedDaily = Object.entries(dailyTargets).reduce((acc, [d, h]) => {
    return activeDays.includes(parseInt(d)) ? acc + (Number(h) || 0) : acc;
  }, 0);

  const handleFinish = () => {
    completeOnboarding({
      weeklyTarget: targetHours,
      activeDays,
      dailyTargets,
      preferredCategories: selectedCategoryIds,
      preferredWorkTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Progress Bar Top */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-brand-600 to-indigo-400 transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-glow-lg">
                <Zap className="w-8 h-8 fill-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Welcome to WEEKLY 100
              </h2>
              <p className="text-brand-600 dark:text-brand-400 font-medium text-sm">
                "Own Your Time. Build Your Consistency. Beat Your Best."
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Take control of your focus. Set a weekly target of fewer than 100 intentional productive hours,
                distribute them sustainably across your days, and track your progress with deep work precision.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center gap-2 shadow-glow transition-all"
                >
                  Configure My Challenge <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Weekly Target (1-99) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 2 of 8</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Choose Your Weekly Target
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  How many intentional productive hours would you like to achieve this week? (Must be below 100 hours).
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-surface-850/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={targetHours}
                    onChange={(e) => handleTargetChange(parseInt(e.target.value, 10) || 1)}
                    className="w-28 text-center text-5xl font-extrabold font-mono text-brand-600 dark:text-brand-400 bg-transparent border-b-2 border-brand-500 focus:outline-none"
                  />
                  <span className="text-2xl font-bold text-slate-600 dark:text-slate-400">HOURS</span>
                </div>

                <div className="flex gap-2 mt-6">
                  {[25, 35, 40, 50, 60].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleTargetChange(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        targetHours === preset
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'border-slate-300 dark:border-slate-700 hover:border-brand-500 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {preset}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Active Days */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 3 of 8</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Select Your Active Days
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Choose which days you will be active. We strongly recommend scheduling at least one dedicated rest day.
                </p>
              </div>

              <div className="grid grid-cols-7 gap-2 py-4">
                {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                  const isSelected = activeDays.includes(dayIdx);
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => toggleDay(dayIdx)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-brand-500/15 border-brand-500 text-brand-500 dark:text-brand-400 font-semibold shadow-sm'
                          : 'bg-slate-50 dark:bg-surface-850/50 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-bold">{DAY_SHORT[dayIdx]}</span>
                      <span className="text-[10px] mt-1 text-slate-500">
                        {isSelected ? 'Active' : 'Rest'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  You have selected <strong className="text-slate-900 dark:text-white">{activeDays.length} active day(s)</strong> and{' '}
                  <strong className="text-slate-900 dark:text-white">{7 - activeDays.length} rest day(s)</strong>.
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: Distribute Hours */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 4 of 8</span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Distribute Daily Hours
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Fine-tune targets for each day. You have full freedom over your daily allocations.
                  </p>
                </div>
                <button
                  onClick={() => autoDistributeHours(targetHours, activeDays)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Balance
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {[1, 2, 3, 4, 5, 6, 0].map((dayIdx) => {
                  const isActive = activeDays.includes(dayIdx);
                  return (
                    <div
                      key={dayIdx}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        isActive
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-850/70'
                          : 'border-slate-200/50 dark:border-slate-800/40 opacity-50 bg-slate-100/50 dark:bg-surface-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white w-24">
                          {DAY_NAMES[dayIdx]}
                        </span>
                        {!isActive && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500">
                            Rest Day
                          </span>
                        )}
                      </div>

                      {isActive ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="24"
                            value={dailyTargets[dayIdx] ?? 0}
                            onChange={(e) => handleDailyTargetChange(dayIdx, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-right font-mono font-bold text-sm bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-500"
                          />
                          <span className="text-xs text-slate-500">hrs</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">0 hrs</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-xs p-3 rounded-xl bg-slate-100 dark:bg-surface-850">
                <span>Sum of Planned Daily Hours:</span>
                <span className={`font-mono font-bold ${totalCalculatedDaily === targetHours ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {totalCalculatedDaily} / {targetHours} hrs {totalCalculatedDaily === targetHours ? '✓' : `(Diff: ${(totalCalculatedDaily - targetHours).toFixed(1)}h)`}
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Categories */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 5 of 8</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Choose Productivity Categories
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select which core categories align with your weekly goals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const isChecked = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isChecked
                          ? 'border-brand-500/50 bg-brand-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                      </div>
                      {isChecked && <Check className="w-4 h-4 text-brand-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Working Hours Window */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 6 of 8</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Preferred Working Window
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Set your typical daily focus window to protect your sleep schedule and encourage healthy boundaries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Start Time
                  </label>
                  <input
                    type="time"
                    value={preferredWorkTime.start}
                    onChange={(e) => setPreferredWorkTime((prev) => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> End Time
                  </label>
                  <input
                    type="time"
                    value={preferredWorkTime.end}
                    onChange={(e) => setPreferredWorkTime((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Review Schedule */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">Step 7 of 8</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Review Your Weekly Blueprint
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Check your planned configuration before launching your challenge.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Weekly Target:</span>
                  <span className="font-bold font-mono text-brand-500 text-base">{targetHours} Hours</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Active Days:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{activeDays.length} Days</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-800 pb-2">
                  <span className="text-slate-500">Average Per Active Day:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {(targetHours / (activeDays.length || 1)).toFixed(1)} hrs/day
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Focus Hours Window:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {preferredWorkTime.start} — {preferredWorkTime.end}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Ready to Launch */}
          {step === 8 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                You're Ready to Begin!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Your Weekly 100 system is configured. Track your sessions, complete tasks, analyze your consistency, and maintain healthy rest.
              </p>
              <div className="pt-4 flex justify-center">
                <button
                  onClick={handleFinish}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-glow transition-all"
                >
                  Start Weekly 100 Challenge
                </button>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            {step > 1 && step < 8 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            ) : (
              <div />
            )}

            {step > 1 && step < 8 && (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

