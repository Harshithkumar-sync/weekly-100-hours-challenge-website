import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ScheduledBlock } from '../../types';
import { DAY_NAMES } from '../../utils/dateUtils';
import { Calendar, Clock, Plus, Tag } from 'lucide-react';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBlock?: ScheduledBlock | null;
  defaultDayIndex?: number;
}

export const TimeBlockModal: React.FC<TimeBlockModalProps> = ({
  isOpen,
  onClose,
  initialBlock,
  defaultDayIndex = 1,
}) => {
  const { categories, addScheduleBlock, updateScheduleBlock } = useApp();

  const [title, setTitle] = useState(initialBlock ? initialBlock.title : '');
  const [categoryId, setCategoryId] = useState(initialBlock ? initialBlock.categoryId : categories[0]?.id || 'cat-coding');
  const [dayOfWeek, setDayOfWeek] = useState<number>(initialBlock ? initialBlock.dayOfWeek : defaultDayIndex);
  const [startTime, setStartTime] = useState(initialBlock ? initialBlock.startTime : '09:00');
  const [endTime, setEndTime] = useState(initialBlock ? initialBlock.endTime : '11:00');
  const [isRecurring, setIsRecurring] = useState(initialBlock ? initialBlock.isRecurring : true);
  const [notes, setNotes] = useState(initialBlock?.notes || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a title for this schedule block.');
      return;
    }

    if (endTime <= startTime) {
      setError('End time must be later than start time.');
      return;
    }

    if (initialBlock) {
      updateScheduleBlock(initialBlock.id, {
        title: title.trim(),
        categoryId,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        notes: notes.trim(),
      });
    } else {
      addScheduleBlock({
        title: title.trim(),
        categoryId,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        isCompleted: false,
        notes: notes.trim(),
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBlock ? 'Edit Scheduled Activity' : 'Schedule Focus Block'}
      subtitle="Allocate dedicated time for deep work"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Activity / Block Title
          </label>
          <input
            type="text"
            placeholder="e.g. Algorithms & LeetCode / Project Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Day of Week
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <option key={d} value={d}>
                  {DAY_NAMES[d]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="isRecurring" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            Weekly Recurring Schedule Block
          </label>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Notes / Objectives (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Specific deliverables or topics for this block..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all"
          >
            {initialBlock ? 'Update Block' : 'Add to Schedule'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

