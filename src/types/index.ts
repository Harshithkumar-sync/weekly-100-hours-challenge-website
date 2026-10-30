// Core Types for WEEKLY 100 Application

export type ProductivityLevel =
  | 'Beginner'
  | 'Explorer'
  | 'Consistent'
  | 'Focused'
  | 'Advanced'
  | 'Master';

export type TaskPriority = 'low' | 'medium' | 'high' | 'important';
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';
export type AppTheme = 'dark' | 'light';

export interface Category {
  id: string;
  name: string;
  color: string;
  isCustom?: boolean;
  targetHours?: number;
}

export interface DayScheduleTarget {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  targetHours: number;
  isRestDay: boolean;
}

export interface WeeklyChallenge {
  id: string;
  name: string;
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string; // ISO string YYYY-MM-DD
  targetHours: number; // 1 to 99 hours
  activeDaysCount: number; // 1 to 7
  activeDays: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  dailyTargets: Record<number, number>; // dayOfWeek -> targetHours
  preferredWorkTime: {
    start: string; // e.g. "08:00"
    end: string; // e.g. "18:00"
  };
  challengeCategoryIds: string[];
  status: 'active' | 'completed' | 'archived';
  notes?: string;
  createdAt: string;
}

export interface TimeSession {
  id: string;
  title: string;
  categoryId: string;
  taskId?: string | null;
  startTime: number; // epoch timestamp ms
  endTime: number; // epoch timestamp ms
  durationMinutes: number; // computed actual productive duration in minutes
  date: string; // YYYY-MM-DD
  notes: string;
  isManual: boolean;
  breakDurationMinutes?: number;
  createdAt: string;
}

export interface ActiveTimerState {
  isActive: boolean;
  isPaused: boolean;
  isBreak: boolean;
  startTime: number | null; // ms timestamp when current active interval started
  accumulatedMs: number; // productive ms accumulated before pause
  breakStartTime: number | null;
  breakAccumulatedMs: number;
  categoryId: string;
  taskId: string | null;
  sessionTitle: string;
  notes: string;
  focusIntervalMinutes: number; // e.g. 25, 50, custom
  breakIntervalMinutes: number; // e.g. 5, 10
  breakRemindersEnabled: boolean;
  focusMode: boolean; // distraction-free mode
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedMinutes: number;
  actualMinutes: number;
  dueDate: string | null; // YYYY-MM-DD
  createdAt: string;
  completedAt?: string | null;
}

export interface ScheduledBlock {
  id: string;
  title: string;
  categoryId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // "06:00"
  endTime: string; // "07:00"
  isRecurring: boolean;
  isCompleted: boolean;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'starter' | 'streak' | 'volume' | 'mastery' | 'wellness';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt: string | null; // ISO string when unlocked, or null
  progress: number; // 0 to 100
  currentValue: number;
  targetValue: number;
  unit: string;
  requirement: string;
  iconName: string;
}

export interface PersonalRecords {
  highestWeeklyHours: {
    hours: number;
    weekLabel: string;
    achievedAt: string;
  };
  bestDailyHours: {
    hours: number;
    date: string;
  };
  longestConsistencyStreakDays: {
    days: number;
    achievedAt: string;
  };
  mostTasksCompletedInWeek: {
    count: number;
    weekLabel: string;
  };
  bestWeeklyCompletionPercentage: {
    percentage: number;
    weekLabel: string;
  };
}

export interface HistoricalWeek {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  targetHours: number;
  completedHours: number;
  completionPercentage: number;
  activeDaysCount: number;
  missedDaysCount: number;
  completedTasksCount: number;
  totalSessionsCount: number;
  categoryBreakdown: Record<string, number>; // categoryId -> hours
  dailyHours: Record<number, number>; // dayOfWeek -> hours
}

export interface WellnessSettings {
  targetSleepHours: number;
  sleepStartTime: string; // "23:00"
  sleepEndTime: string; // "07:00"
  maxDailyProductiveHours: number; // e.g. 10
  breakIntervalMinutes: number; // e.g. 50
  enforceRestDays: boolean;
  dailyDowntimeTargetHours: number; // e.g. 3
}

export interface UserProfile {
  username: string;
  tagline: string;
  initials: string;
  productivityGoal: string;
  avatarColor: string;
  preferredTheme: AppTheme;
  timeFormat: '12h' | '24h';
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  reminders: {
    dailyPlanning: boolean;
    dailyPlanningTime: string; // "08:00"
    sessionBreakReminder: boolean;
    weeklyReview: boolean;
    weeklyReviewTime: string; // "19:00"
    taskDeadlines: boolean;
  };
  onboardingCompleted: boolean;
  wellness: WellnessSettings;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

