import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  WeeklyChallenge,
  TimeSession,
  Task,
  ScheduledBlock,
  Category,
  Achievement,
  PersonalRecords,
  HistoricalWeek,
  UserProfile,
  ActiveTimerState,
  ToastMessage,
  AppTheme,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_USER_PROFILE,
  generateInitialChallenge,
  generateInitialTasks,
  generateInitialSchedule,
  generateInitialSessions,
  INITIAL_PERSONAL_RECORDS,
  INITIAL_HISTORICAL_WEEKS,
} from '../data/initialData';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsDef';
import { calculateWeeklyMetrics, checkSessionOverlap, calculateCurrentStreak } from '../utils/calculations';
import { formatDateISO } from '../utils/dateUtils';
import { soundManager } from '../utils/audio';

export type NavTab =
  | 'dashboard'
  | 'challenge'
  | 'schedule'
  | 'tasks'
  | 'timer'
  | 'analytics'
  | 'achievements'
  | 'history'
  | 'wellness'
  | 'settings';

interface AppContextType {
  // Navigation
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;

  // Theme
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  // Data Models
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  challenge: WeeklyChallenge;
  updateChallenge: (updates: Partial<WeeklyChallenge>) => void;
  resetChallenge: (newChallenge: Partial<WeeklyChallenge>) => void;

  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  sessions: TimeSession[];
  addSession: (session: Omit<TimeSession, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateSession: (id: string, updates: Partial<TimeSession>) => { success: boolean; error?: string };
  deleteSession: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutes'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  schedule: ScheduledBlock[];
  addScheduleBlock: (block: Omit<ScheduledBlock, 'id'>) => ScheduledBlock;
  updateScheduleBlock: (id: string, updates: Partial<ScheduledBlock>) => void;
  deleteScheduleBlock: (id: string) => void;
  toggleScheduleBlockCompleted: (id: string) => void;

  achievements: Achievement[];
  personalRecords: PersonalRecords;
  historicalWeeks: HistoricalWeek[];

  // Timer & Focus
  activeTimer: ActiveTimerState;
  timerElapsedMs: number;
  breakElapsedMs: number;
  startTimer: (options?: { categoryId?: string; taskId?: string | null; title?: string; notes?: string }) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  toggleBreakMode: () => void;
  stopAndSaveTimer: (finalNotes?: string) => void;
  discardTimer: () => void;
  setFocusMode: (enabled: boolean) => void;
  updateTimerNotes: (notes: string) => void;
  startFocusForTask: (taskId: string) => void;

  // Onboarding & Modals
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (setupData: {
    weeklyTarget: number;
    activeDays: number[];
    dailyTargets: Record<number, number>;
    preferredCategories: string[];
    preferredWorkTime: { start: string; end: string };
  }) => void;

  // Notifications & Toasts
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;

  // Quick Action Modal helpers
  openManualTimeModal: boolean;
  setOpenManualTimeModal: (open: boolean) => void;
  openTaskModal: boolean;
  setOpenTaskModal: (open: boolean) => void;

  // Data management
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; message: string };
  clearAllData: () => void;
  loadDemoData: () => void;
}

const STORAGE_KEYS = {
  PROFILE: 'weekly100_profile_v1',
  CHALLENGE: 'weekly100_challenge_v1',
  CATEGORIES: 'weekly100_categories_v1',
  SESSIONS: 'weekly100_sessions_v1',
  TASKS: 'weekly100_tasks_v1',
  SCHEDULE: 'weekly100_schedule_v1',
  ACHIEVEMENTS: 'weekly100_achievements_v1',
  RECORDS: 'weekly100_records_v1',
  HISTORY: 'weekly100_history_v1',
  TIMER: 'weekly100_timer_state_v1',
};

const defaultTimerState: ActiveTimerState = {
  isActive: false,
  isPaused: false,
  isBreak: false,
  startTime: null,
  accumulatedMs: 0,
  breakStartTime: null,
  breakAccumulatedMs: 0,
  categoryId: 'cat-coding',
  taskId: null,
  sessionTitle: 'Deep Focus Session',
  notes: '',
  focusIntervalMinutes: 50,
  breakIntervalMinutes: 10,
  breakRemindersEnabled: true,
  focusMode: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals for Quick Actions
  const [openManualTimeModal, setOpenManualTimeModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);

  const addToast = useCallback((title: string, message: string, type: ToastMessage['type'] = 'info', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Profile & Settings
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  });

  const [theme, setThemeState] = useState<AppTheme>(profile.preferredTheme || 'dark');

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    setProfile((prev) => ({ ...prev, preferredTheme: newTheme }));
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Sync theme with HTML root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save profile changes
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    });
    addToast('Profile Updated', 'Your profile preferences have been saved.', 'success');
  }, [addToast]);

  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const id = `cat-${Date.now()}`;
    const newCat: Category = { ...cat, id, isCustom: true };
    setCategories((prev) => [...prev, newCat]);
    addToast('Category Added', `Category "${cat.name}" has been created.`, 'success');
    return newCat;
  }, [addToast]);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category Deleted', 'The category was removed.', 'info');
  }, [addToast]);

  // Weekly Challenge
  const [challenge, setChallenge] = useState<WeeklyChallenge>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGE);
      return saved ? JSON.parse(saved) : generateInitialChallenge();
    } catch {
      return generateInitialChallenge();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(challenge));
  }, [challenge]);

  const updateChallenge = useCallback((updates: Partial<WeeklyChallenge>) => {
    setChallenge((prev) => {
      // Prevent target hours exceeding 99
      let cleanUpdates = { ...updates };
      if (typeof cleanUpdates.targetHours === 'number') {
        cleanUpdates.targetHours = Math.min(99, Math.max(1, cleanUpdates.targetHours));
      }
      const updated = { ...prev, ...cleanUpdates };
      localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(updated));
      return updated;
    });
    addToast('Challenge Updated', 'Your weekly target and schedule have been updated.', 'success');
  }, [addToast]);

  const resetChallenge = useCallback((newChallenge: Partial<WeeklyChallenge>) => {
    const fresh = {
      ...generateInitialChallenge(),
      ...newChallenge,
      id: `challenge-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (fresh.targetHours > 99) fresh.targetHours = 99;
    setChallenge(fresh);
    localStorage.setItem(STORAGE_KEYS.CHALLENGE, JSON.stringify(fresh));
    addToast('New Challenge Started', `Ready to conquer ${fresh.targetHours} hours this week!`, 'success');
  }, [addToast]);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : generateInitialTasks();
    } catch {
      return generateInitialTasks();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutes'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualMinutes: 0,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    addToast('Task Created', `"${newTask.title}" added to your workspace.`, 'success');
    return newTask;
  }, [addToast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isCompleting = updates.status === 'completed' && t.status !== 'completed';
          return {
            ...t,
            ...updates,
            completedAt: isCompleting ? new Date().toISOString() : updates.status ? null : t.completedAt,
          };
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast('Task Removed', 'Task was deleted.', 'info');
  }, [addToast]);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'completed';
          const newStatus = isDone ? 'in_progress' : 'completed';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
          };
        }
        return t;
      })
    );
  }, []);

  // Schedule Blocks
  const [schedule, setSchedule] = useState<ScheduledBlock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return saved ? JSON.parse(saved) : generateInitialSchedule();
    } catch {
      return generateInitialSchedule();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  const addScheduleBlock = useCallback((blockData: Omit<ScheduledBlock, 'id'>) => {
    const newBlock: ScheduledBlock = {
      ...blockData,
      id: `sched-${Date.now()}`,
    };
    setSchedule((prev) => [...prev, newBlock]);
    addToast('Schedule Block Added', `Added "${newBlock.title}" to schedule.`, 'success');
    return newBlock;
  }, [addToast]);

  const updateScheduleBlock = useCallback((id: string, updates: Partial<ScheduledBlock>) => {
    setSchedule((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  }, []);

  const deleteScheduleBlock = useCallback((id: string) => {
    setSchedule((prev) => prev.filter((b) => b.id !== id));
    addToast('Schedule Block Deleted', 'Schedule item removed.', 'info');
  }, [addToast]);

  const toggleScheduleBlockCompleted = useCallback((id: string) => {
    setSchedule((prev) => prev.map((b) => (b.id === id ? { ...b, isCompleted: !b.isCompleted } : b)));
  }, []);

  // Time Sessions
  const [sessions, setSessions] = useState<TimeSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : generateInitialSessions();
    } catch {
      return generateInitialSessions();
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  // Historical Weeks
  const [historicalWeeks, setHistoricalWeeks] = useState<HistoricalWeek[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_WEEKS;
    } catch {
      return INITIAL_HISTORICAL_WEEKS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historicalWeeks));
  }, [historicalWeeks]);

  // Personal Records
  const [personalRecords, setPersonalRecords] = useState<PersonalRecords>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : INITIAL_PERSONAL_RECORDS;
    } catch {
      return INITIAL_PERSONAL_RECORDS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(personalRecords));
  }, [personalRecords]);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  // Check achievements and personal records engine
  const evaluateGamification = useCallback(
    (currentSessions: TimeSession[], currentChallenge: WeeklyChallenge, currentTasks: Task[]) => {
      const metrics = calculateWeeklyMetrics(currentChallenge, currentSessions);
      const totalHours = Math.round(currentSessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60 * 10) / 10;
      const completedTasksCount = currentTasks.filter((t) => t.status === 'completed').length;
      const streakDays = calculateCurrentStreak(currentSessions, currentChallenge.activeDays);

      // Check personal records
      setPersonalRecords((prev) => {
        let changed = false;
        const updated = { ...prev };

        // Best daily hours
        const dayTotals: Record<string, number> = {};
        currentSessions.forEach((s) => {
          dayTotals[s.date] = (dayTotals[s.date] || 0) + s.durationMinutes;
        });

        for (const date in dayTotals) {
          const dHours = Math.round((dayTotals[date] / 60) * 10) / 10;
          if (dHours > updated.bestDailyHours.hours) {
            updated.bestDailyHours = { hours: dHours, date };
            changed = true;
          }
        }

        // Longest streak
        if (streakDays > updated.longestConsistencyStreakDays.days) {
          updated.longestConsistencyStreakDays = {
            days: streakDays,
            achievedAt: formatDateISO(new Date()),
          };
          changed = true;
        }

        // Highest weekly hours
        if (metrics.completedHours > updated.highestWeeklyHours.hours) {
          updated.highestWeeklyHours = {
            hours: metrics.completedHours,
            weekLabel: currentChallenge.name,
            achievedAt: formatDateISO(new Date()),
          };
          changed = true;
        }

        // Best completion %
        if (metrics.completionPercentage > updated.bestWeeklyCompletionPercentage.percentage && metrics.completedHours >= 10) {
          updated.bestWeeklyCompletionPercentage = {
            percentage: metrics.completionPercentage,
            weekLabel: currentChallenge.name,
          };
          changed = true;
        }

        return changed ? updated : prev;
      });

      // Check achievements unlock
      setAchievements((prev) => {
        let anyUnlocked = false;
        const updated = prev.map((ach) => {
          if (ach.unlockedAt) return ach; // Already unlocked

          let currentVal = 0;
          let unlocked = false;

          if (ach.id === 'first-session') {
            currentVal = currentSessions.length;
            unlocked = currentVal >= ach.targetValue;
          } else if (ach.id === 'getting-started') {
            currentVal = totalHours;
            unlocked = currentVal >= ach.targetValue;
          } else if (ach.id === 'consistency-builder') {
            // Count days where target was met
            let daysMet = 0;
            const dates = Object.keys(currentChallenge.dailyTargets);
            const dayMinutesMap: Record<number, number> = {};
            currentSessions.forEach((s) => {
              const d = new Date(s.date + 'T00:00:00').getDay();
              dayMinutesMap[d] = (dayMinutesMap[d] || 0) + s.durationMinutes;
            });
            for (const d of dates) {
              const targetH = currentChallenge.dailyTargets[parseInt(d)];
              const actualH = (dayMinutesMap[parseInt(d)] || 0) / 60;
              if (targetH > 0 && actualH >= targetH) {
                daysMet++;
              }
            }
            currentVal = daysMet;
            unlocked = currentVal >= ach.targetValue;
          } else if (ach.id === 'weekly-champion') {
            currentVal = metrics.completionPercentage;
            unlocked = currentVal >= 100;
          } else if (ach.id === 'category-master') {
            const catMap: Record<string, number> = {};
            currentSessions.forEach((s) => {
              catMap[s.categoryId] = (catMap[s.categoryId] || 0) + s.durationMinutes;
            });
            const maxCatHours = Math.round((Math.max(...Object.values(catMap), 0) / 60) * 10) / 10;
            currentVal = maxCatHours;
            unlocked = currentVal >= ach.targetValue;
          } else if (ach.id === 'task-finisher') {
            currentVal = completedTasksCount;
            unlocked = currentVal >= ach.targetValue;
          }

          const progress = Math.min(100, Math.round((currentVal / ach.targetValue) * 100));

          if (unlocked && !ach.unlockedAt) {
            anyUnlocked = true;
            soundManager.playTrophyChime();
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
            addToast('Achievement Unlocked!', `${ach.title}: ${ach.description}`, 'success', 6000);
            return {
              ...ach,
              unlockedAt: new Date().toISOString(),
              progress: 100,
              currentValue: currentVal,
            };
          }

          return {
            ...ach,
            progress,
            currentValue: currentVal,
          };
        });

        return anyUnlocked ? updated : prev;
      });
    },
    [addToast]
  );

  // Add session with duplicate/overlap validation
  const addSession = useCallback(
    (sessionData: Omit<TimeSession, 'id' | 'createdAt'>) => {
      // Validate duration
      if (sessionData.durationMinutes <= 0) {
        return { success: false, error: 'Session duration must be greater than zero.' };
      }
      if (sessionData.endTime <= sessionData.startTime) {
        return { success: false, error: 'End time must be after start time.' };
      }

      // Check overlap
      const overlap = checkSessionOverlap(sessionData.startTime, sessionData.endTime, sessions);
      if (overlap.hasOverlap && overlap.conflictingSession) {
        return {
          success: false,
          error: `Time overlaps with existing session "${overlap.conflictingSession.title}" (${formatDateISO(
            new Date(overlap.conflictingSession.startTime)
          )}).`,
        };
      }

      const newSession: TimeSession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);

      // If linked to task, update task's actual minutes
      if (sessionData.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === sessionData.taskId
              ? { ...t, actualMinutes: (t.actualMinutes || 0) + sessionData.durationMinutes }
              : t
          )
        );
      }

      soundManager.playSessionComplete();
      addToast(
        'Session Logged',
        `Recorded ${Math.round(sessionData.durationMinutes)}m of productive time.`,
        'success'
      );

      // Evaluate gamification
      evaluateGamification(updatedSessions, challenge, tasks);

      return { success: true };
    },
    [sessions, challenge, tasks, addToast, evaluateGamification]
  );

  const updateSession = useCallback(
    (id: string, updates: Partial<TimeSession>) => {
      const existing = sessions.find((s) => s.id === id);
      if (!existing) return { success: false, error: 'Session not found' };

      const proposedStart = updates.startTime ?? existing.startTime;
      const proposedEnd = updates.endTime ?? existing.endTime;

      if (proposedEnd <= proposedStart) {
        return { success: false, error: 'End time must be after start time.' };
      }

      // Check overlap excluding this session
      const overlap = checkSessionOverlap(proposedStart, proposedEnd, sessions, id);
      if (overlap.hasOverlap && overlap.conflictingSession) {
        return {
          success: false,
          error: `Session overlaps with "${overlap.conflictingSession.title}".`,
        };
      }

      const updatedDuration = Math.round((proposedEnd - proposedStart) / 60000);

      const updatedSessions = sessions.map((s) =>
        s.id === id ? { ...s, ...updates, durationMinutes: updatedDuration } : s
      );
      setSessions(updatedSessions);
      addToast('Session Updated', 'Time session updated successfully.', 'success');
      evaluateGamification(updatedSessions, challenge, tasks);
      return { success: true };
    },
    [sessions, challenge, tasks, addToast, evaluateGamification]
  );

  const deleteSession = useCallback(
    (id: string) => {
      const sessionToDelete = sessions.find((s) => s.id === id);
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);

      // Deduct from task if linked
      if (sessionToDelete?.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === sessionToDelete.taskId
              ? { ...t, actualMinutes: Math.max(0, (t.actualMinutes || 0) - sessionToDelete.durationMinutes) }
              : t
          )
        );
      }

      addToast('Session Deleted', 'Session was removed and totals recalculated.', 'info');
      evaluateGamification(updated, challenge, tasks);
    },
    [sessions, challenge, tasks, addToast, evaluateGamification]
  );

  // Active Timer & Focus Mode
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMER);
      return saved ? JSON.parse(saved) : defaultTimerState;
    } catch {
      return defaultTimerState;
    }
  });

  const [timerElapsedMs, setTimerElapsedMs] = useState(0);
  const [breakElapsedMs, setBreakElapsedMs] = useState(0);

  // Tick timer every second using non-drifting epoch timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTimer.isActive) {
        if (!activeTimer.isPaused && !activeTimer.isBreak && activeTimer.startTime) {
          const currentSegment = Date.now() - activeTimer.startTime;
          setTimerElapsedMs(activeTimer.accumulatedMs + currentSegment);
        } else {
          setTimerElapsedMs(activeTimer.accumulatedMs);
        }

        if (activeTimer.isBreak && activeTimer.breakStartTime) {
          const currentBreakSegment = Date.now() - activeTimer.breakStartTime;
          setBreakElapsedMs(activeTimer.breakAccumulatedMs + currentBreakSegment);
        } else {
          setBreakElapsedMs(activeTimer.breakAccumulatedMs);
        }
      } else {
        setTimerElapsedMs(0);
        setBreakElapsedMs(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  // Persist timer state to survive reloads
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMER, JSON.stringify(activeTimer));
  }, [activeTimer]);

  const startTimer = useCallback(
    (options?: { categoryId?: string; taskId?: string | null; title?: string; notes?: string }) => {
      const catId = options?.categoryId || activeTimer.categoryId || categories[0]?.id || 'cat-coding';
      const taskObj = options?.taskId ? tasks.find((t) => t.id === options.taskId) : null;
      const title = options?.title || (taskObj ? taskObj.title : 'Deep Focus Session');

      setActiveTimer({
        isActive: true,
        isPaused: false,
        isBreak: false,
        startTime: Date.now(),
        accumulatedMs: 0,
        breakStartTime: null,
        breakAccumulatedMs: 0,
        categoryId: catId,
        taskId: options?.taskId ?? null,
        sessionTitle: title,
        notes: options?.notes || '',
        focusIntervalMinutes: 50,
        breakIntervalMinutes: 10,
        breakRemindersEnabled: true,
        focusMode: false,
      });

      addToast('Focus Session Started', `Tracking time for ${title}.`, 'info');
    },
    [activeTimer.categoryId, categories, tasks, addToast]
  );

  const pauseTimer = useCallback(() => {
    if (!activeTimer.isActive || activeTimer.isPaused) return;

    if (activeTimer.isBreak && activeTimer.breakStartTime) {
      const segment = Date.now() - activeTimer.breakStartTime;
      setActiveTimer((prev) => ({
        ...prev,
        isPaused: true,
        breakAccumulatedMs: prev.breakAccumulatedMs + segment,
        breakStartTime: null,
      }));
    } else if (activeTimer.startTime) {
      const segment = Date.now() - activeTimer.startTime;
      setActiveTimer((prev) => ({
        ...prev,
        isPaused: true,
        accumulatedMs: prev.accumulatedMs + segment,
        startTime: null,
      }));
    }
  }, [activeTimer]);

  const resumeTimer = useCallback(() => {
    if (!activeTimer.isActive || !activeTimer.isPaused) return;

    if (activeTimer.isBreak) {
      setActiveTimer((prev) => ({
        ...prev,
        isPaused: false,
        breakStartTime: Date.now(),
      }));
    } else {
      setActiveTimer((prev) => ({
        ...prev,
        isPaused: false,
        startTime: Date.now(),
      }));
    }
  }, [activeTimer]);

  const toggleBreakMode = useCallback(() => {
    if (!activeTimer.isActive) return;

    soundManager.playBreakChime();

    if (!activeTimer.isBreak) {
      // Switching to break: pause productive accumulator
      let totalProdMs = activeTimer.accumulatedMs;
      if (!activeTimer.isPaused && activeTimer.startTime) {
        totalProdMs += Date.now() - activeTimer.startTime;
      }
      setActiveTimer((prev) => ({
        ...prev,
        accumulatedMs: totalProdMs,
        startTime: null,
        isBreak: true,
        isPaused: false,
        breakStartTime: Date.now(),
      }));
      addToast('Break Started', 'Step back, hydrate, and stretch. Break time is excluded from productive hours.', 'info');
    } else {
      // Switching back to focus
      let totalBreakMs = activeTimer.breakAccumulatedMs;
      if (!activeTimer.isPaused && activeTimer.breakStartTime) {
        totalBreakMs += Date.now() - activeTimer.breakStartTime;
      }
      setActiveTimer((prev) => ({
        ...prev,
        breakAccumulatedMs: totalBreakMs,
        breakStartTime: null,
        isBreak: false,
        isPaused: false,
        startTime: Date.now(),
      }));
      addToast('Focus Resumed', 'Welcome back to your intentional work sprint.', 'info');
    }
  }, [activeTimer, addToast]);

  const stopAndSaveTimer = useCallback(
    (finalNotes?: string) => {
      if (!activeTimer.isActive) return;

      // Calculate final productive duration
      let totalProdMs = activeTimer.accumulatedMs;
      if (!activeTimer.isPaused && !activeTimer.isBreak && activeTimer.startTime) {
        totalProdMs += Date.now() - activeTimer.startTime;
      }

      const durationMinutes = Math.round(totalProdMs / 60000);

      if (durationMinutes < 1) {
        addToast(
          'Session Too Short',
          'Sessions under 1 minute are not saved to maintain accurate records.',
          'warning'
        );
        setActiveTimer(defaultTimerState);
        return;
      }

      const now = Date.now();
      const startTime = now - totalProdMs;
      const todayStr = formatDateISO(new Date());

      const res = addSession({
        title: activeTimer.sessionTitle || 'Focus Session',
        categoryId: activeTimer.categoryId,
        taskId: activeTimer.taskId,
        startTime,
        endTime: now,
        durationMinutes,
        date: todayStr,
        notes: finalNotes || activeTimer.notes || '',
        isManual: false,
        breakDurationMinutes: Math.round(activeTimer.breakAccumulatedMs / 60000),
      });

      if (res.success) {
        setActiveTimer(defaultTimerState);
      }
    },
    [activeTimer, addSession, addToast]
  );

  const discardTimer = useCallback(() => {
    setActiveTimer(defaultTimerState);
    addToast('Session Cancelled', 'Timer discarded without saving.', 'info');
  }, [addToast]);

  const setFocusMode = useCallback((enabled: boolean) => {
    setActiveTimer((prev) => ({ ...prev, focusMode: enabled }));
  }, []);

  const updateTimerNotes = useCallback((notes: string) => {
    setActiveTimer((prev) => ({ ...prev, notes }));
  }, []);

  const startFocusForTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;
      startTimer({
        taskId: task.id,
        categoryId: task.categoryId,
        title: task.title,
      });
      setCurrentTab('timer');
    },
    [tasks, startTimer]
  );

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!profile.onboardingCompleted);

  const completeOnboarding = useCallback(
    (setupData: {
      weeklyTarget: number;
      activeDays: number[];
      dailyTargets: Record<number, number>;
      preferredCategories: string[];
      preferredWorkTime: { start: string; end: string };
    }) => {
      updateChallenge({
        targetHours: setupData.weeklyTarget,
        activeDays: setupData.activeDays,
        activeDaysCount: setupData.activeDays.length,
        dailyTargets: setupData.dailyTargets,
        challengeCategoryIds: setupData.preferredCategories,
        preferredWorkTime: setupData.preferredWorkTime,
      });

      updateProfile({ onboardingCompleted: true });
      setShowOnboarding(false);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      addToast('Challenge Configured!', 'Your custom weekly productivity sprint is live.', 'success');
    },
    [updateChallenge, updateProfile, addToast]
  );

  // Data Import / Export / Clear
  const exportDataJSON = useCallback(() => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      challenge,
      categories,
      sessions,
      tasks,
      schedule,
      achievements,
      personalRecords,
      historicalWeeks,
    };
    return JSON.stringify(payload, null, 2);
  }, [profile, challenge, categories, sessions, tasks, schedule, achievements, personalRecords, historicalWeeks]);

  const importDataJSON = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed.challenge || !Array.isArray(parsed.sessions)) {
          return { success: false, message: 'Invalid data format. Missing challenge or sessions.' };
        }
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.challenge) setChallenge(parsed.challenge);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.sessions) setSessions(parsed.sessions);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.personalRecords) setPersonalRecords(parsed.personalRecords);
        if (parsed.historicalWeeks) setHistoricalWeeks(parsed.historicalWeeks);

        addToast('Data Imported', 'Your productivity ecosystem has been restored.', 'success');
        return { success: true, message: 'Data successfully restored.' };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'JSON parse failure';
        return { success: false, message: errorMsg };
      }
    },
    [addToast]
  );

  const clearAllData = useCallback(() => {
    localStorage.clear();
    setProfile(DEFAULT_USER_PROFILE);
    setChallenge(generateInitialChallenge());
    setCategories(DEFAULT_CATEGORIES);
    setSessions([]);
    setTasks([]);
    setSchedule([]);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setHistoricalWeeks([]);
    setActiveTimer(defaultTimerState);
    addToast('Data Cleared', 'All stored application data has been wiped.', 'info');
  }, [addToast]);

  const loadDemoData = useCallback(() => {
    setProfile(DEFAULT_USER_PROFILE);
    setChallenge(generateInitialChallenge());
    setCategories(DEFAULT_CATEGORIES);
    setSessions(generateInitialSessions());
    setTasks(generateInitialTasks());
    setSchedule(generateInitialSchedule());
    setAchievements(INITIAL_ACHIEVEMENTS);
    setPersonalRecords(INITIAL_PERSONAL_RECORDS);
    setHistoricalWeeks(INITIAL_HISTORICAL_WEEKS);
    addToast('Demo Data Loaded', 'Sample data with realistic sessions and analytics restored.', 'success');
  }, [addToast]);

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        theme,
        setTheme,
        toggleTheme,
        profile,
        updateProfile,
        challenge,
        updateChallenge,
        resetChallenge,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        sessions,
        addSession,
        updateSession,
        deleteSession,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        schedule,
        addScheduleBlock,
        updateScheduleBlock,
        deleteScheduleBlock,
        toggleScheduleBlockCompleted,
        achievements,
        personalRecords,
        historicalWeeks,
        activeTimer,
        timerElapsedMs,
        breakElapsedMs,
        startTimer,
        pauseTimer,
        resumeTimer,
        toggleBreakMode,
        stopAndSaveTimer,
        discardTimer,
        setFocusMode,
        updateTimerNotes,
        startFocusForTask,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        toasts,
        addToast,
        removeToast,
        openManualTimeModal,
        setOpenManualTimeModal,
        openTaskModal,
        setOpenTaskModal,
        exportDataJSON,
        importDataJSON,
        clearAllData,
        loadDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

