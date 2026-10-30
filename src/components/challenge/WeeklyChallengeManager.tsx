import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateWeeklyMetrics } from '../../utils/calculations';
import { SmartPlanningAssistant } from './SmartPlanningAssistant';
import { DAY_NAMES, DAY_SHORT, formatDateISO } from '../../utils/dateUtils';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  Sliders,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const WeeklyChallengeManager: React.FC = () => {
  const { challenge, updateChallenge, resetChallenge, categories, addCategory, deleteCategory, sessions } = useApp();
  const metrics = calculateWeeklyMetrics(challenge, sessions);

  // Form State
  const [challengeName, setChallengeName] = useState(challenge.name);
  const [targetHours, setTargetHours] = useState(challenge.targetHours);
  const [activeDays, setActiveDays] = useState<number[]>(challenge.activeDays);
  const [dailyTargets, setDailyTargets] = useState<Record<number, number>>(challenge.dailyTargets);
  const [workStartTime, setWorkStartTime] = useState(challenge.preferredWorkTime.start);
  const [workEndTime, setWorkEndTime] = useState(challenge.preferredWorkTime.end);
  const [selectedCats, setSelectedCats] = useState<string[]>(challenge.challengeCategoryIds || []);

  // Category addition modal state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [showAddCat, setShowAddCat] = useState(false);

  // Confirmation modal for resetting challenge
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Toggle day active/rest
  const toggleDay = (dayIdx: number) => {
    let updated: number[];
    if (activeDays.includes(dayIdx)) {
      if (activeDays.length <= 1) return;
      updated = activeDays.filter((d) => d !== dayIdx);
    } else {
      updated = [...activeDays, dayIdx].sort();
    }
    setActiveDays(updated);
  };

  const handleDailyTargetChange = (dayIdx: number, val: number) => {
    setDailyTargets((prev) => ({
      ...prev,
      [dayIdx]: Math.min(24, Math.max(0, val)),
    }));
  };

  const totalPlannedSum = Object.entries(dailyTargets).reduce((acc, [d, h]) => {
    return activeDays.includes(parseInt(d)) ? acc + (Number(h) || 0) : acc;
  }, 0);

  const handleApplySmartDistribution = (suggested: Record<number, number>, newTarget: number) => {
    setDailyTargets(suggested);
    setTargetHours(newTarget);
    updateChallenge({
      dailyTargets: suggested,
      targetHours: newTarget,
    });
  };

  const handleSaveAll = () => {
    updateChallenge({
      name: challengeName,
      targetHours: Math.min(99, Math.max(1, targetHours)),
      activeDays,
      activeDaysCount: activeDays.length,
      dailyTargets,
      preferredWorkTime: { start: workStartTime, end: workEndTime },
      challengeCategoryIds: selectedCats,
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const cat = addCategory({ name: newCatName.trim(), color: newCatColor });
    setSelectedCats((prev) => [...prev, cat.id]);
    setNewCatName('');
    setShowAddCat(false);
  };

  const toggleCategorySelection = (catId: string) => {
    if (selectedCats.includes(catId)) {
      if (selectedCats.length <= 1) return;
      setSelectedCats(selectedCats.filter((id) => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weekly Challenge System
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure intentional targets (under 100 hours), distribute days, and manage categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Challenge
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      {/* Real-time Metric Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Weekly Target</span>
          <span className="text-xl font-bold font-mono text-brand-500 mt-1 block">
            {targetHours}h
          </span>
          <span className="text-[10px] text-slate-400">Max limit: 99 hours</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Planned Daily Sum</span>
          <span className={`text-xl font-bold font-mono mt-1 block ${totalPlannedSum === targetHours ? 'text-emerald-500' : 'text-amber-500'}`}>
            {totalPlannedSum.toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-400">
            {totalPlannedSum === targetHours ? 'Balanced' : `Diff: ${(totalPlannedSum - targetHours).toFixed(1)}h`}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Active Days</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {activeDays.length} of 7
          </span>
          <span className="text-[10px] text-slate-400">{7 - activeDays.length} rest day(s)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Avg per Active Day</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {(targetHours / (activeDays.length || 1)).toFixed(1)}h
          </span>
          <span className="text-[10px] text-slate-400">Planned pacing</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Hours Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">
            {metrics.completedHours}h
          </span>
          <span className="text-[10px] text-slate-400">{metrics.completionPercentage}% achieved</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Remaining Hours</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {metrics.remainingHours}h
          </span>
          <span className="text-[10px] text-slate-400">{metrics.remainingActiveDays} active day(s) left</span>
        </div>
      </div>

      {/* Smart Planning Assistant Component */}
      <SmartPlanningAssistant
        currentWeeklyTarget={targetHours}
        currentActiveDays={activeDays}
        onApplyDistribution={handleApplySmartDistribution}
      />

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Target & Active Days */}
        <div className="space-y-6 rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Sliders className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Target & Schedule Parameters
            </h3>
          </div>

          {/* Challenge Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Weekly Challenge Name
            </label>
            <input
              type="text"
              value={challengeName}
              onChange={(e) => setChallengeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand-500"
              placeholder="e.g. Sprint to Mastery"
            />
          </div>

          {/* Weekly Target Hours Slider / Input */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Weekly Target (1–99 Hours)
              </label>
              <div className="flex items-baseline gap-1">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={targetHours}
                  onChange={(e) => setTargetHours(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 text-right font-mono font-bold text-lg text-brand-600 dark:text-brand-400 bg-slate-100 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
                <span className="text-xs text-slate-400">hrs</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={99}
              value={targetHours}
              onChange={(e) => setTargetHours(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>1 hr</span>
              <span>25 hrs</span>
              <span>50 hrs</span>
              <span>75 hrs</span>
              <span>99 hrs (Max)</span>
            </div>
          </div>

          {/* Active Days Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Active Days vs Rest Days
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const isAct = activeDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`py-3 px-1 rounded-xl border text-center transition-all ${
                      isAct
                        ? 'bg-brand-500/15 border-brand-500 text-brand-500 dark:text-brand-400 font-bold'
                        : 'bg-slate-50 dark:bg-surface-850/50 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-xs block">{DAY_SHORT[d]}</span>
                    <span className="text-[9px] block mt-1 opacity-70">
                      {isAct ? 'Active' : 'Rest'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Working Hours Window */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Preferred Daily Study / Focus Window
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Daily Hours Distribution & Categories */}
        <div className="space-y-6 rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Daily Hours Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400">Custom Allocation</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const isAct = activeDays.includes(d);
              return (
                <div
                  key={d}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isAct
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-850/60'
                      : 'border-slate-200/50 dark:border-slate-800/40 opacity-40 bg-slate-100/40 dark:bg-surface-900/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white w-24">
                      {DAY_NAMES[d]}
                    </span>
                    {!isAct && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-400">
                        Scheduled Rest
                      </span>
                    )}
                  </div>

                  {isAct ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={dailyTargets[d] ?? 0}
                        onChange={(e) => handleDailyTargetChange(d, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-right font-mono font-bold text-sm bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-brand-500"
                      />
                      <span className="text-xs text-slate-400">hrs</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">0.0 hrs</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Categories Management Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Challenge Categories ({selectedCats.length} active)
              </label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Category
              </button>
            </div>

            {/* Custom Category Form */}
            {showAddCat && (
              <form onSubmit={handleCreateCategory} className="p-3 mb-3 rounded-xl bg-slate-50 dark:bg-surface-850 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-surface-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold"
                >
                  Add
                </button>
              </form>
            )}

            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCats.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => toggleCategorySelection(cat.id)}
                    className={`cursor-pointer flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-brand-500/40 bg-brand-500/10 text-slate-900 dark:text-white font-medium'
                        : 'border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    {cat.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(cat.id);
                        }}
                        className="p-1 hover:text-rose-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Challenge */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-lg font-bold">Reset Weekly Challenge?</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              This will create a fresh challenge configuration. Your historical session records will remain safely preserved in History and Analytics.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetChallenge({ targetHours: 40 });
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

