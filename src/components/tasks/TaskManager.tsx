import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskModal } from './TaskModal';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { formatDateISO, getRelativeDayLabel } from '../../utils/dateUtils';
import {
  CheckSquare,
  Plus,
  Play,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Search,
  Flag,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    deleteTask,
    toggleTaskStatus,
    categories,
    startFocusForTask,
    openTaskModal,
    setOpenTaskModal,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'this_week' | 'in_progress' | 'completed'>('all');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todayStr = formatDateISO(new Date());

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCatFilter !== 'all' && t.categoryId !== selectedCatFilter) {
      return false;
    }

    // Tab Filters
    if (activeFilter === 'today') {
      return t.dueDate === todayStr;
    }
    if (activeFilter === 'this_week') {
      return t.status !== 'completed';
    }
    if (activeFilter === 'in_progress') {
      return t.status === 'in_progress';
    }
    if (activeFilter === 'completed') {
      return t.status === 'completed';
    }

    return true;
  });

  const priorityStyles: Record<TaskPriority, { label: string; variant: 'neutral' | 'primary' | 'warning' | 'danger' }> = {
    low: { label: 'Low', variant: 'neutral' },
    medium: { label: 'Medium', variant: 'primary' },
    high: { label: 'High', variant: 'warning' },
    important: { label: 'Important', variant: 'danger' },
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setOpenTaskModal(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setOpenTaskModal(true);
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Task Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize deep work items, link tasks to live focus sessions, and monitor actual effort
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Task
        </button>
      </div>

      {/* Task KPI Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Total Tasks</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {tasks.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">In Progress</span>
          <span className="text-xl font-bold font-mono text-brand-500 mt-1 block">
            {inProgressCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Completed</span>
          <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">
            {completedCount}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 block">Completion Rate</span>
          <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
            {tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Controls Bar: Filters & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Due Today' },
            { id: 'this_week', label: 'Pending' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as unknown as typeof activeFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium text-slate-400">
              No tasks match the active filters.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              + Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const cat = categories.find((c) => c.id === task.categoryId);
            const pri = priorityStyles[task.priority];
            const isDone = task.status === 'completed';
            const estHours = (task.estimatedMinutes / 60).toFixed(1);
            const actHours = ((task.actualMinutes || 0) / 60).toFixed(1);
            const timeProgress =
              task.estimatedMinutes > 0
                ? Math.min(100, Math.round(((task.actualMinutes || 0) / task.estimatedMinutes) * 100))
                : 0;

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-900 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Left check and title */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="mt-1 text-slate-400 hover:text-emerald-500 transition-colors shrink-0"
                    title={isDone ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-bold text-sm sm:text-base leading-snug truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </span>

                      <Badge variant={pri.variant} size="sm">
                        {pri.label}
                      </Badge>

                      {cat && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.name}
                        </span>
                      )}

                      <span className="text-[10px] uppercase font-mono text-slate-400 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata: Due Date & Estimated Time */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1 flex-wrap">
                      {task.dueDate && (
                        <span>Due: {getRelativeDayLabel(task.dueDate)}</span>
                      )}
                      <span>•</span>
                      <span className="font-mono">
                        Time: {actHours}h tracked / {estHours}h est.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Progress & Actions */}
                <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                  {/* Time Progress Bar */}
                  <div className="w-28 space-y-1 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Effort</span>
                      <span>{timeProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${timeProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Start Focus Session for Task */}
                  {!isDone && (
                    <button
                      onClick={() => startFocusForTask(task.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Focus
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={openTaskModal}
        onClose={() => setOpenTaskModal(false)}
        initialTask={editingTask}
      />
    </div>
  );
};

