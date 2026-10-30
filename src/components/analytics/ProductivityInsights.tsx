import React from 'react';
import { useApp } from '../../context/AppContext';
import { generateProductivityInsights } from '../../utils/insights';
import {
  Trophy,
  Flame,
  TrendingUp,
  Zap,
  PieChart,
  ArrowUpRight,
  Activity,
  CheckSquare,
  AlertTriangle,
  Heart,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const ProductivityInsights: React.FC = () => {
  const { challenge, sessions, categories, tasks, historicalWeeks } = useApp();

  const insights = generateProductivityInsights(
    challenge,
    sessions,
    categories,
    tasks,
    historicalWeeks
  );

  const iconMap: Record<string, React.ReactNode> = {
    Trophy: <Trophy className="w-5 h-5 text-amber-400" />,
    Flame: <Flame className="w-5 h-5 text-rose-400" />,
    TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    Zap: <Zap className="w-5 h-5 text-brand-400" />,
    PieChart: <PieChart className="w-5 h-5 text-indigo-400" />,
    ArrowUpRight: <ArrowUpRight className="w-5 h-5 text-emerald-400" />,
    Activity: <Activity className="w-5 h-5 text-blue-400" />,
    CheckSquare: <CheckSquare className="w-5 h-5 text-teal-400" />,
    AlertTriangle: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    Heart: <Heart className="w-5 h-5 text-rose-400" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-brand-500" />
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Intelligent Productivity Insights
        </h4>
        <span className="text-xs text-slate-400">
          (Computed dynamically from your stored logs)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-surface-850">
                  {iconMap[item.icon] || <Zap className="w-5 h-5 text-brand-400" />}
                </div>
                {item.badge && (
                  <Badge variant={item.type === 'caution' ? 'warning' : 'primary'} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </div>

              <h5 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                {item.title}
              </h5>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            {item.metric && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] font-mono">
                <span className="text-slate-400">Calculated Metric</span>
                <span className="font-bold text-slate-900 dark:text-white">{item.metric}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

