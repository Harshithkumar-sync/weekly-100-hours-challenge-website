import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { formatDateISO } from '../../utils/dateUtils';
import { Clock, Plus, Tag, Calendar, AlertCircle } from 'lucide-react';

export const ManualTimeEntryModal: React.FC = () => {
  const {
    openManualTimeModal,
    setOpenManualTimeModal,
    categories,
    tasks,
    addSession,
    addToast,
  } = useApp();

  const todayStr = formatDateISO(new Date());

  const [date, setDate] = useState(todayStr);
  const [startTimeStr, setStartTimeStr] = useState('09:00');
  const [endTimeStr, setEndTimeStr] = useState('11:00');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-coding');
  const [taskId, setTaskId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!openManualTimeModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Parse start and end timestamps
    const startEpoch = new Date(`${date}T${startTimeStr}:00`).getTime();
    const endEpoch = new Date(`${date}T${endTimeStr}:00`).getTime();

    if (isNaN(startEpoch) || isNaN(endEpoch)) {
      setErrorMessage('Please select valid start and end times.');
      return;
    }

    if (endEpoch <= startEpoch) {
      setErrorMessage('End time must be later than start time.');
      return;
    }

    const durationMinutes = Math.round((endEpoch - startEpoch) / 60000);
    if (durationMinutes <= 0) {
      setErrorMessage('Duration must be at least 1 minute.');
      return;
    }

    const linkedTaskObj = taskId ? tasks.find((t) => t.id === taskId) : null;
    const finalTitle = title.trim() || (linkedTaskObj ? linkedTaskObj.title : 'Manual Productivity Session');

    const result = addSession({
      title: finalTitle,
      categoryId,
      taskId: taskId || null,
      startTime: startEpoch,
      endTime: endEpoch,
      durationMinutes,
      date,
      notes: notes.trim(),
      isManual: true,
    });

    if (result.success) {
      setOpenManualTimeModal(false);
      setTitle('');
      setNotes('');
      setTaskId('');
      setErrorMessage('');
    } else {
      setErrorMessage(result.error || 'Could not log session.');
    }
  };

  return (
    <Modal
      isOpen={openManualTimeModal}
      onClose={() => setOpenManualTimeModal(false)}
      title="Log Productivity Session"
      subtitle="Manually add intentional work completed offline"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Session Title
          </label>
          <input
            type="text"
            placeholder="e.g. System Design Spec / Algorithm Practice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Date & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
              required
            />
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

        {/* Start & End Times */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Start Time
            </label>
            <input
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
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
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
              required
            />
          </div>
        </div>

        {/* Linked Task (Optional) */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Link to Task (Optional)
          </label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
          >
            <option value="">-- No specific task --</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.status})
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Notes & Key Outputs
          </label>
          <textarea
            rows={2}
            placeholder="What did you build, read, or accomplish during this focus block?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setOpenManualTimeModal(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Session
          </button>
        </div>
      </form>
    </Modal>
  );
};

