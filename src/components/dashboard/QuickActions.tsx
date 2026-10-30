import React from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Plus, CheckSquare, Calendar, Sliders } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const {
    setCurrentTab,
    setOpenManualTimeModal,
    setOpenTaskModal,
    activeTimer,
  } = useApp();

  const actions = [
    {
      label: activeTimer.isActive ? 'Open Live Timer' : 'Start Focus Session',
      description: activeTimer.isActive ? 'Session in progress' : 'Begin deep work session',
      icon: <Play className="w-5 h-5 fill-current" />,
      onClick: () => setCurrentTab('timer'),
      color: 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow',
    },
    {
      label: 'Add Time Manually',
      description: 'Log offline or past session',
      icon: <Plus className="w-5 h-5" />,
      onClick: () => setOpenManualTimeModal(true),
      color: 'bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800',
    },
    {
      label: 'Create Task',
      description: 'Add new work item',
      icon: <CheckSquare className="w-5 h-5" />,
      onClick: () => setOpenTaskModal(true),
      color: 'bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800',
    },
    {
      label: 'View Schedule',
      description: 'Time blocks & plan',
      icon: <Calendar className="w-5 h-5" />,
      onClick: () => setCurrentTab('schedule'),
      color: 'bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800',
    },
    {
      label: 'Edit Weekly Target',
      description: 'Rebalance hours & days',
      icon: <Sliders className="w-5 h-5" />,
      onClick: () => setCurrentTab('challenge'),
      color: 'bg-slate-100 hover:bg-slate-200 dark:bg-surface-850 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Quick Actions
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => (
          <button
            key={act.label}
            onClick={act.onClick}
            className={`p-4 rounded-2xl flex flex-col justify-between text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${act.color}`}
          >
            <div className="mb-3 p-2 rounded-xl bg-black/10 dark:bg-white/10 w-fit">
              {act.icon}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm block leading-tight">
                {act.label}
              </span>
              <span className="text-[11px] opacity-70 block mt-0.5">
                {act.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

