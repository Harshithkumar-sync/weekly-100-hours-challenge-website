import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LevelProgressBar } from './LevelProgressBar';
import { PersonalRecordsCard } from './PersonalRecordsCard';
import { Achievement } from '../../types';
import {
  Trophy,
  Play,
  Zap,
  CalendarCheck,
  FolderKanban,
  Flame,
  Award,
  Heart,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

export const AchievementsView: React.FC = () => {
  const { achievements } = useApp();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return !!ach.unlockedAt;
    if (filter === 'locked') return !ach.unlockedAt;
    return true;
  });

  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  const iconComponents: Record<string, React.ReactNode> = {
    Play: <Play className="w-5 h-5" />,
    Zap: <Zap className="w-5 h-5" />,
    CalendarCheck: <CalendarCheck className="w-5 h-5" />,
    Trophy: <Trophy className="w-5 h-5" />,
    FolderKanban: <FolderKanban className="w-5 h-5" />,
    Flame: <Flame className="w-5 h-5" />,
    Award: <Award className="w-5 h-5" />,
    Heart: <Heart className="w-5 h-5" />,
    CheckCircle2: <CheckCircle2 className="w-5 h-5" />,
  };

  const tierBadges = {
    bronze: 'border-amber-700/40 text-amber-600 bg-amber-700/10',
    silver: 'border-slate-400/40 text-slate-300 bg-slate-400/10',
    gold: 'border-yellow-500/40 text-yellow-400 bg-yellow-500/10',
    platinum: 'border-indigo-400/40 text-indigo-300 bg-indigo-500/10 shadow-glow',
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Achievements & Gamification
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Motivating sustainable consistency without guilt or extreme burnouts
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'unlocked'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'locked'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Locked ({achievements.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Productivity Level Hero Card */}
      <LevelProgressBar />

      {/* Personal Records Cards */}
      <PersonalRecordsCard />

      {/* Achievements Badges Grid */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">
          Badge Milestones
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;

            return (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isUnlocked
                    ? 'border-brand-500/30 bg-white dark:bg-surface-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-surface-900/50 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-glow'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {iconComponents[ach.iconName] || <Trophy className="w-5 h-5" />}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          tierBadges[ach.tier]
                        }`}
                      >
                        {ach.tier}
                      </span>
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      {ach.title}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Progress / Status */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                    <span>
                      {isUnlocked ? (
                        <span className="text-emerald-500 font-sans font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      ) : (
                        `Req: ${ach.requirement}`
                      )}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isUnlocked ? '100%' : `${ach.progress}%`}
                    </span>
                  </div>

                  <ProgressBar
                    progress={isUnlocked ? 100 : ach.progress}
                    height="sm"
                    color={isUnlocked ? '#10b981' : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

