import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDateISO } from '../../utils/dateUtils';
import { CheckSquare, Tag, Flag, Clock } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  initialTask,
}) => {
  const { categories, addTask, updateTask } = useApp();

  const [title, setTitle] = useState(initialTask ? initialTask.title : '');
  const [description, setDescription] = useState(initialTask ? initialTask.description : '');
  const [categoryId, setCategoryId] = useState(initialTask ? initialTask.categoryId : categories[0]?.id || 'cat-coding');
  const [priority, setPriority] = useState<TaskPriority>(initialTask ? initialTask.priority : 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialTask ? initialTask.status : 'not_started');
  const [estimatedHours, setEstimatedHours] = useState<number>(
    initialTask ? Math.round((initialTask.estimatedMinutes / 60) * 10) / 10 : 2
  );
  const [dueDate, setDueDate] = useState<string>(initialTask?.dueDate || formatDateISO(new Date()));
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const estimatedMinutes = Math.round(Math.max(0.1, estimatedHours) * 60);

    if (initialTask) {
      updateTask(initialTask.id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        status,
        estimatedMinutes,
        dueDate: dueDate || null,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority,
        status,
        estimatedMinutes,
        dueDate: dueDate || null,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create Productivity Task'}
      subtitle="Define actionable work linked to your weekly focus challenge"
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
            Task Title
          </label>
          <input
            type="text"
            placeholder="e.g. Implement WebSocket reconnection protocol"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description / Requirements
          </label>
          <textarea
            rows={2}
            placeholder="Provide context, acceptance criteria, or key steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="important">Important (Critical)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Estimated Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-surface-850 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
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
            {initialTask ? 'Update Task' : 'Save Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

