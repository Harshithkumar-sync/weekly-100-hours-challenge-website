import React from 'react';
import { useApp, NavTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Target,
  Calendar,
  CheckSquare,
  Timer,
  BarChart3,
  Trophy,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, activeTimer } = useApp();

  const mobileNavItems: Array<{ tab: NavTab; label: string; icon: React.ReactNode }> = [
    { tab: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { tab: 'challenge', label: 'Challenge', icon: <Target className="w-5 h-5" /> },
    {
      tab: 'timer',
      label: 'Focus',
      icon: (
        <div className="relative">
          <Timer className="w-5 h-5" />
          {activeTimer.isActive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          )}
        </div>
      ),
    },
    { tab: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { tab: 'schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { tab: 'analytics', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-2 px-3 flex justify-around items-center safe-area-pb">
      {mobileNavItems.map((item) => {
        const isActive = currentTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setCurrentTab(item.tab)}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

