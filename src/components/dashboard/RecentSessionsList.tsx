import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trash2, Clock, CheckCircle, Tag, ArrowUpRight } from 'lucide-react';
import { formatDurationHMS, getRelativeDayLabel } from '../../utils/dateUtils';

export const RecentSessionsList: React.FC = () => {
  const { sessions, categories, tasks, deleteSession, setCurrentTab, setOpenManualTimeModal } = useApp();

  const recent = sessions.slice(0, 5);

  return (
    <div className="rounded-3xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Focus Sessions
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest tracked productive work segments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenManualTimeModal(true)}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500"
          >
            + Log Session
          </button>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            onClick={() => setCurrentTab('analytics')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {recent.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No sessions recorded yet this week. Click "Start Focus" to begin!
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recent.map((sess) => {
            const cat = categories.find((c) => c.id === sess.categoryId);
            const linkedTask = sess.taskId ? tasks.find((t) => t.id === sess.taskId) : null;
            const hoursDec = (sess.durationMinutes / 60).toFixed(1);

            return (
              <div
                key={sess.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-surface-850/30 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-2.5 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: cat?.color || '#6366f1' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {sess.title || 'Focus Session'}
                      </span>
                      {cat && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          {cat.name}
                        </span>
                      )}
                      {linkedTask && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          Task: {linkedTask.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>{getRelativeDayLabel(sess.date)}</span>
                      <span>•</span>
                      <span>{sess.notes ? sess.notes : 'Deep work session'}</span>
                      {sess.isManual && (
                        <span className="text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded font-mono">
                          manual
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {hoursDec}h
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {sess.durationMinutes}m
                    </span>
                  </div>

                  <button
                    onClick={() => deleteSession(sess.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Delete session record"
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
  );
};

