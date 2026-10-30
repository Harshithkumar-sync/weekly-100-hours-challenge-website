import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TimeBlockModal } from './TimeBlockModal';
import { ScheduledBlock } from '../../types';
import { DAY_NAMES, DAY_SHORT, formatTimeString } from '../../utils/dateUtils';
import { calculateScheduledHours } from '../../utils/calculations';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const DailyScheduler: React.FC = () => {
  const {
    schedule,
    deleteScheduleBlock,
    toggleScheduleBlockCompleted,
    categories,
    startTimer,
    setCurrentTab,
    challenge,
    sessions,
  } = useApp();

  const [activeDayIndex, setActiveDayIndex] = useState<number>(new Date().getDay());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ScheduledBlock | null>(null);

  // Total scheduled non-overlapping hours across the whole week
  const totalScheduledHours = calculateScheduledHours(schedule);

  // Blocks for active selected day
  const dayBlocks = schedule
    .filter((b) => b.dayOfWeek === activeDayIndex)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Actual tracked hours for this day of week
  const daySessions = sessions.filter((s) => {
    try {
      const parts = s.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return (
        d.getDay() === activeDayIndex &&
        s.date >= challenge.startDate &&
        s.date <= challenge.endDate
      );
    } catch {
      return false;
    }
  });

  const actualTrackedDayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const actualTrackedDayHours = Math.round((actualTrackedDayMinutes / 60) * 10) / 10;
  const plannedDayTarget = challenge.dailyTargets[activeDayIndex] ?? 0;
  const scheduledDayBlocksHours = calculateScheduledHours(dayBlocks);

  const handleOpenAdd = () => {
    setEditingBlock(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (block: ScheduledBlock) => {
    setEditingBlock(block);
    setModalOpen(true);
  };

  const handleStartBlockSession = (block: ScheduledBlock) => {
    startTimer({
      categoryId: block.categoryId,
      title: block.title,
    });
    setCurrentTab('timer');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Daily Scheduler & Time Blocking
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Structure your days with dedicated focus blocks. Non-overlapping hours automatically merged.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Focus Block
        </button>
      </div>

      {/* Week Planner Banner: Planned vs Scheduled vs Actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Weekly Challenge Target
          </span>
          <span className="text-2xl font-extrabold font-mono text-brand-500 mt-1 block">
            {challenge.targetHours} Hours
          </span>
          <span className="text-[11px] text-slate-400">Total intentional goal</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Total Scheduled Blocks
          </span>
          <span className="text-2xl font-extrabold font-mono text-indigo-400 mt-1 block">
            {totalScheduledHours} Hours
          </span>
          <span className="text-[11px] text-slate-400">Merged non-overlapping blocks</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            Selected Day Tracked
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 block">
            {actualTrackedDayHours}h / {plannedDayTarget}h
          </span>
          <span className="text-[11px] text-slate-400">{DAY_NAMES[activeDayIndex]} performance</span>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[1, 2, 3, 4, 5, 6, 0].map((d) => {
          const isSelected = activeDayIndex === d;
          const blocksCount = schedule.filter((b) => b.dayOfWeek === d).length;
          const isRest = !challenge.activeDays.includes(d);

          return (
            <button
              key={d}
              onClick={() => setActiveDayIndex(d)}
              className={`px-4 py-3 rounded-2xl border transition-all text-center min-w-[100px] shrink-0 ${
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-glow'
                  : 'bg-white dark:bg-surface-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs gap-1">
                <span className="font-bold">{DAY_SHORT[d]}</span>
                {isRest ? (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Rest
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                    {challenge.dailyTargets[d] ?? 0}h
                  </span>
                )}
              </div>
              <span className={`text-[10px] block mt-1 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                {blocksCount} {blocksCount === 1 ? 'block' : 'blocks'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Time Blocks List */}
      <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {DAY_NAMES[activeDayIndex]} Focus Blocks
            </h3>
            <p className="text-xs text-slate-400">
              {scheduledDayBlocksHours}h scheduled • Planned target: {plannedDayTarget}h
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Block
          </button>
        </div>

        {dayBlocks.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              No time blocks scheduled for {DAY_NAMES[activeDayIndex]}.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-surface-850 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-brand-500"
            >
              + Create First Block
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {dayBlocks.map((block) => {
              const cat = categories.find((c) => c.id === block.categoryId);

              return (
                <div
                  key={block.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    block.isCompleted
                      ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                      : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-surface-850/60 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      onClick={() => toggleScheduleBlockCompleted(block.id)}
                      className="mt-0.5 sm:mt-0 text-slate-400 hover:text-emerald-500 transition-colors"
                      title={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {block.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            block.isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {block.title}
                        </span>

                        {cat && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}

                        {block.isRecurring && (
                          <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                            recurring
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {formatTimeString(block.startTime)} — {formatTimeString(block.endTime)}
                        </span>
                        {block.notes && (
                          <>
                            <span>•</span>
                            <span className="font-sans text-slate-500 truncate max-w-xs">{block.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {!block.isCompleted && (
                      <button
                        onClick={() => handleStartBlockSession(block)}
                        className="px-3 py-1.5 rounded-xl bg-brand-600/15 hover:bg-brand-600 text-brand-600 hover:text-white dark:text-brand-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Track
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEdit(block)}
                      className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit block"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteScheduleBlock(block.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <TimeBlockModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialBlock={editingBlock}
        defaultDayIndex={activeDayIndex}
      />
    </div>
  );
};

