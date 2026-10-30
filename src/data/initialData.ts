import {
  Category,
  WeeklyChallenge,
  TimeSession,
  Task,
  ScheduledBlock,
  PersonalRecords,
  HistoricalWeek,
  UserProfile,
} from '../types';
import { getWeekBounds, formatDateISO } from '../utils/dateUtils';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-coding', name: 'Coding', color: '#6366f1', targetHours: 15 },
  { id: 'cat-software-dev', name: 'Software Development', color: '#3b82f6', targetHours: 12 },
  { id: 'cat-study', name: 'Study', color: '#8b5cf6', targetHours: 6 },
  { id: 'cat-personal-proj', name: 'Personal Projects', color: '#06b6d4', targetHours: 5 },
  { id: 'cat-reading', name: 'Reading', color: '#10b981', targetHours: 3 },
  { id: 'cat-skill-dev', name: 'Skill Development', color: '#f59e0b', targetHours: 4 },
  { id: 'cat-work', name: 'Work', color: '#ec4899', targetHours: 0 },
  { id: 'cat-fitness-wellness', name: 'Fitness and Personal Development', color: '#14b8a6', targetHours: 3 },
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  username: 'Alex Morgan',
  tagline: 'Mastering Full-Stack & Systems Architecture',
  initials: 'AM',
  productivityGoal: 'Reach 45 intentional hours per week with zero burnout',
  avatarColor: '#6366f1',
  preferredTheme: 'dark',
  timeFormat: '12h',
  weekStartDay: 1, // Monday
  soundEnabled: true,
  notificationsEnabled: true,
  reminders: {
    dailyPlanning: true,
    dailyPlanningTime: '08:00',
    sessionBreakReminder: true,
    weeklyReview: true,
    weeklyReviewTime: '19:00',
    taskDeadlines: true,
  },
  onboardingCompleted: true,
  wellness: {
    targetSleepHours: 8,
    sleepStartTime: '23:00',
    sleepEndTime: '07:00',
    maxDailyProductiveHours: 10,
    breakIntervalMinutes: 50,
    enforceRestDays: true,
    dailyDowntimeTargetHours: 3,
  },
};

// Generate realistic initial challenge for current week
export function generateInitialChallenge(referenceDate = new Date()): WeeklyChallenge {
  const { startDate, endDate } = getWeekBounds(referenceDate, 1);
  return {
    id: `challenge-${formatDateISO(startDate)}`,
    name: 'Weekly 100 Focus Sprint',
    startDate: formatDateISO(startDate),
    endDate: formatDateISO(endDate),
    targetHours: 45,
    activeDaysCount: 6,
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat (Sun is rest)
    dailyTargets: {
      1: 7.5, // Mon
      2: 8.0, // Tue
      3: 7.5, // Wed
      4: 8.0, // Thu
      5: 7.5, // Fri
      6: 6.5, // Sat
      0: 0,   // Sun (Rest)
    },
    preferredWorkTime: {
      start: '08:30',
      end: '18:30',
    },
    challengeCategoryIds: ['cat-coding', 'cat-software-dev', 'cat-study', 'cat-personal-proj'],
    status: 'active',
    notes: 'Aiming for deep work blocks in the morning and project architecture in the afternoon.',
    createdAt: new Date().toISOString(),
  };
}

export function generateInitialTasks(): Task[] {
  const todayStr = formatDateISO(new Date());
  return [
    {
      id: 'task-1',
      title: 'Architect Distributed Caching Engine',
      description: 'Implement Redis cluster failover and test read latency benchmarks.',
      categoryId: 'cat-software-dev',
      priority: 'important',
      status: 'in_progress',
      estimatedMinutes: 240,
      actualMinutes: 180,
      dueDate: todayStr,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Type-Safe WebSocket Protocol Implementation',
      description: 'Define schema validation for real-time events and bidirectional message streams.',
      categoryId: 'cat-coding',
      priority: 'high',
      status: 'completed',
      estimatedMinutes: 180,
      actualMinutes: 195,
      dueDate: todayStr,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Read: Designing Data-Intensive Applications (Ch. 7)',
      description: 'Deep dive into transactions, serializability, and 2-phase commit anomalies.',
      categoryId: 'cat-reading',
      priority: 'medium',
      status: 'completed',
      estimatedMinutes: 90,
      actualMinutes: 90,
      dueDate: todayStr,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Design Microservice Observability Pipeline',
      description: 'Instrument OpenTelemetry traces, Prometheus metrics, and Grafana dashboards.',
      categoryId: 'cat-software-dev',
      priority: 'high',
      status: 'in_progress',
      estimatedMinutes: 300,
      actualMinutes: 150,
      dueDate: todayStr,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task-5',
      title: 'Weekly 100 Mobile Responsiveness Audit',
      description: 'Test touch interactions and fluid layouts on viewport sizes 360px through 1440px.',
      categoryId: 'cat-personal-proj',
      priority: 'medium',
      status: 'not_started',
      estimatedMinutes: 120,
      actualMinutes: 0,
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'Practice Advanced Linear Algebra for ML',
      description: 'Eigenvalues, SVD decomposition proofs and python NumPy vectorization practice.',
      categoryId: 'cat-study',
      priority: 'low',
      status: 'not_started',
      estimatedMinutes: 120,
      actualMinutes: 0,
      dueDate: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

export function generateInitialSchedule(): ScheduledBlock[] {
  return [
    {
      id: 'sched-1',
      title: 'Deep Coding Block: Core Algorithms',
      categoryId: 'cat-coding',
      dayOfWeek: 1, // Mon
      startTime: '08:30',
      endTime: '11:30',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-2',
      title: 'System Architecture & Services',
      categoryId: 'cat-software-dev',
      dayOfWeek: 1,
      startTime: '13:30',
      endTime: '16:30',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-3',
      title: 'System Architecture & Services',
      categoryId: 'cat-software-dev',
      dayOfWeek: 2, // Tue
      startTime: '09:00',
      endTime: '12:00',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-4',
      title: 'Project Engineering Sprint',
      categoryId: 'cat-coding',
      dayOfWeek: 2,
      startTime: '14:00',
      endTime: '18:00',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-5',
      title: 'Deep Coding Block',
      categoryId: 'cat-coding',
      dayOfWeek: 3, // Wed
      startTime: '09:00',
      endTime: '12:30',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-6',
      title: 'Distributed Systems Study & Reading',
      categoryId: 'cat-study',
      dayOfWeek: 3,
      startTime: '14:00',
      endTime: '16:30',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-7',
      title: 'Full Stack Service Optimization',
      categoryId: 'cat-software-dev',
      dayOfWeek: 4, // Thu
      startTime: '09:00',
      endTime: '13:00',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-8',
      title: 'Personal Projects & Experiments',
      categoryId: 'cat-personal-proj',
      dayOfWeek: 4,
      startTime: '14:30',
      endTime: '18:00',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-9',
      title: 'Deep Coding & Code Review',
      categoryId: 'cat-coding',
      dayOfWeek: 5, // Fri (Today)
      startTime: '09:00',
      endTime: '12:30',
      isRecurring: true,
      isCompleted: true,
    },
    {
      id: 'sched-10',
      title: 'Weekly Retrospective & Architecture Review',
      categoryId: 'cat-skill-dev',
      dayOfWeek: 5,
      startTime: '14:00',
      endTime: '17:00',
      isRecurring: true,
      isCompleted: false,
    },
    {
      id: 'sched-11',
      title: 'Weekend Creative Engineering Sprint',
      categoryId: 'cat-personal-proj',
      dayOfWeek: 6, // Sat
      startTime: '10:00',
      endTime: '14:30',
      isRecurring: true,
      isCompleted: false,
    },
  ];
}

// Generate sessions for the current week matching our reference date (2026-10-30)
export function generateInitialSessions(referenceDate = new Date()): TimeSession[] {
  const { startDate } = getWeekBounds(referenceDate, 1);
  const mon = new Date(startDate);
  const tue = new Date(startDate); tue.setDate(startDate.getDate() + 1);
  const wed = new Date(startDate); wed.setDate(startDate.getDate() + 2);
  const thu = new Date(startDate); thu.setDate(startDate.getDate() + 3);
  const fri = new Date(startDate); fri.setDate(startDate.getDate() + 4);

  return [
    // Monday (7.5 hours total = 450 min)
    {
      id: 'sess-1',
      title: 'Core Algorithm Optimization',
      categoryId: 'cat-coding',
      taskId: 'task-2',
      startTime: new Date(`${formatDateISO(mon)}T09:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(mon)}T12:00:00`).getTime(),
      durationMinutes: 180,
      date: formatDateISO(mon),
      notes: 'Profiled query response times. Reduced time complexity from O(N^2) to O(N log N).',
      isManual: false,
      createdAt: new Date(`${formatDateISO(mon)}T12:00:00`).toISOString(),
    },
    {
      id: 'sess-2',
      title: 'Distributed Caching Infrastructure',
      categoryId: 'cat-software-dev',
      taskId: 'task-1',
      startTime: new Date(`${formatDateISO(mon)}T13:30:00`).getTime(),
      endTime: new Date(`${formatDateISO(mon)}T16:30:00`).getTime(),
      durationMinutes: 180,
      date: formatDateISO(mon),
      notes: 'Redis cluster failover integration.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(mon)}T16:30:00`).toISOString(),
    },
    {
      id: 'sess-3',
      title: 'Reading DDIA Transaction Patterns',
      categoryId: 'cat-reading',
      taskId: 'task-3',
      startTime: new Date(`${formatDateISO(mon)}T17:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(mon)}T18:30:00`).getTime(),
      durationMinutes: 90,
      date: formatDateISO(mon),
      notes: 'Notes on snapshot isolation and serializable conflict serialization.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(mon)}T18:30:00`).toISOString(),
    },

    // Tuesday (8.0 hours total = 480 min)
    {
      id: 'sess-4',
      title: 'WebSocket Protocol & Real-time Synchronization',
      categoryId: 'cat-coding',
      taskId: 'task-2',
      startTime: new Date(`${formatDateISO(tue)}T09:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(tue)}T12:30:00`).getTime(),
      durationMinutes: 210,
      date: formatDateISO(tue),
      notes: 'Full bidirectional communication protocol implemented with reconnection logic.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(tue)}T12:30:00`).toISOString(),
    },
    {
      id: 'sess-5',
      title: 'Observability & OpenTelemetry Metrics',
      categoryId: 'cat-software-dev',
      taskId: 'task-4',
      startTime: new Date(`${formatDateISO(tue)}T14:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(tue)}T17:30:00`).getTime(),
      durationMinutes: 210,
      date: formatDateISO(tue),
      notes: 'Configured exporter pipes for telemetry span collector.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(tue)}T17:30:00`).toISOString(),
    },
    {
      id: 'sess-6',
      title: 'Evening Physical Conditioning & Mobility',
      categoryId: 'cat-fitness-wellness',
      startTime: new Date(`${formatDateISO(tue)}T18:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(tue)}T19:00:00`).getTime(),
      durationMinutes: 60,
      date: formatDateISO(tue),
      notes: 'Strength & mobility routine.',
      isManual: true,
      createdAt: new Date(`${formatDateISO(tue)}T19:00:00`).toISOString(),
    },

    // Wednesday (7.5 hours total = 450 min)
    {
      id: 'sess-7',
      title: 'Microservices Communication Layer',
      categoryId: 'cat-software-dev',
      taskId: 'task-4',
      startTime: new Date(`${formatDateISO(wed)}T09:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(wed)}T12:30:00`).getTime(),
      durationMinutes: 210,
      date: formatDateISO(wed),
      notes: 'gRPC stubs generation and request interceptor chain.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(wed)}T12:30:00`).toISOString(),
    },
    {
      id: 'sess-8',
      title: 'Advanced Linear Algebra Proofs',
      categoryId: 'cat-study',
      startTime: new Date(`${formatDateISO(wed)}T14:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(wed)}T16:30:00`).getTime(),
      durationMinutes: 150,
      date: formatDateISO(wed),
      notes: 'Eigenvalue properties and singular value decomposition matrices.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(wed)}T16:30:00`).toISOString(),
    },
    {
      id: 'sess-9',
      title: 'Weekly UI Design & Component Exploration',
      categoryId: 'cat-personal-proj',
      startTime: new Date(`${formatDateISO(wed)}T17:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(wed)}T18:30:00`).getTime(),
      durationMinutes: 90,
      date: formatDateISO(wed),
      notes: 'Designed reusable card states and progress meters.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(wed)}T18:30:00`).toISOString(),
    },

    // Thursday (8.0 hours total = 480 min)
    {
      id: 'sess-10',
      title: 'Backend Database Optimization & Indexing',
      categoryId: 'cat-software-dev',
      startTime: new Date(`${formatDateISO(thu)}T09:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(thu)}T13:00:00`).getTime(),
      durationMinutes: 240,
      date: formatDateISO(thu),
      notes: 'Added composite btree indexes for time-series range lookups.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(thu)}T13:00:00`).toISOString(),
    },
    {
      id: 'sess-11',
      title: 'Weekly 100 Core State Logic',
      categoryId: 'cat-coding',
      startTime: new Date(`${formatDateISO(thu)}T14:30:00`).getTime(),
      endTime: new Date(`${formatDateISO(thu)}T18:30:00`).getTime(),
      durationMinutes: 240,
      date: formatDateISO(thu),
      notes: 'Implemented non-drifting epoch time tracking and calculations.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(thu)}T18:30:00`).toISOString(),
    },

    // Friday (Today: 4.5 hours completed so far = 270 min)
    {
      id: 'sess-12',
      title: 'Morning Focus: Responsive UI Systems',
      categoryId: 'cat-coding',
      startTime: new Date(`${formatDateISO(fri)}T09:00:00`).getTime(),
      endTime: new Date(`${formatDateISO(fri)}T12:00:00`).getTime(),
      durationMinutes: 180,
      date: formatDateISO(fri),
      notes: 'Built dark theme layout and desktop/mobile navigations.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(fri)}T12:00:00`).toISOString(),
    },
    {
      id: 'sess-13',
      title: 'Distributed System Resiliency Test',
      categoryId: 'cat-software-dev',
      taskId: 'task-1',
      startTime: new Date(`${formatDateISO(fri)}T13:30:00`).getTime(),
      endTime: new Date(`${formatDateISO(fri)}T15:00:00`).getTime(),
      durationMinutes: 90,
      date: formatDateISO(fri),
      notes: 'Simulated network partition and verified quorum behavior.',
      isManual: false,
      createdAt: new Date(`${formatDateISO(fri)}T15:00:00`).toISOString(),
    },
  ];
}

export const INITIAL_PERSONAL_RECORDS: PersonalRecords = {
  highestWeeklyHours: {
    hours: 46.5,
    weekLabel: 'Week 42 (Oct 12 - Oct 18)',
    achievedAt: '2026-10-18',
  },
  bestDailyHours: {
    hours: 8.5,
    date: '2026-10-15',
  },
  longestConsistencyStreakDays: {
    days: 19,
    achievedAt: '2026-10-22',
  },
  mostTasksCompletedInWeek: {
    count: 14,
    weekLabel: 'Week 41 (Oct 05 - Oct 11)',
  },
  bestWeeklyCompletionPercentage: {
    percentage: 103,
    weekLabel: 'Week 42 (Oct 12 - Oct 18)',
  },
};

export const INITIAL_HISTORICAL_WEEKS: HistoricalWeek[] = [
  {
    id: 'hist-w43',
    name: 'Full Stack Architecture Sprint',
    startDate: '2026-10-19',
    endDate: '2026-10-25',
    targetHours: 42,
    completedHours: 41.5,
    completionPercentage: 99,
    activeDaysCount: 6,
    missedDaysCount: 0,
    completedTasksCount: 11,
    totalSessionsCount: 16,
    categoryBreakdown: {
      'cat-coding': 16.5,
      'cat-software-dev': 13.0,
      'cat-study': 5.0,
      'cat-reading': 3.5,
      'cat-personal-proj': 3.5,
    },
    dailyHours: { 1: 7.0, 2: 7.5, 3: 7.0, 4: 7.5, 5: 6.5, 6: 6.0, 0: 0 },
  },
  {
    id: 'hist-w42',
    name: 'Distributed Systems & Data Pipelines',
    startDate: '2026-10-12',
    endDate: '2026-10-18',
    targetHours: 45,
    completedHours: 46.5,
    completionPercentage: 103,
    activeDaysCount: 6,
    missedDaysCount: 0,
    completedTasksCount: 13,
    totalSessionsCount: 18,
    categoryBreakdown: {
      'cat-coding': 18.0,
      'cat-software-dev': 15.5,
      'cat-study': 6.0,
      'cat-reading': 4.0,
      'cat-fitness-wellness': 3.0,
    },
    dailyHours: { 1: 7.5, 2: 8.5, 3: 8.0, 4: 8.0, 5: 8.0, 6: 6.5, 0: 0 },
  },
  {
    id: 'hist-w41',
    name: 'Foundation & Algorithm Foundations',
    startDate: '2026-10-05',
    endDate: '2026-10-11',
    targetHours: 40,
    completedHours: 39.0,
    completionPercentage: 98,
    activeDaysCount: 6,
    missedDaysCount: 0,
    completedTasksCount: 14,
    totalSessionsCount: 15,
    categoryBreakdown: {
      'cat-coding': 15.0,
      'cat-software-dev': 12.0,
      'cat-study': 7.0,
      'cat-reading': 3.0,
      'cat-fitness-wellness': 2.0,
    },
    dailyHours: { 1: 6.5, 2: 7.0, 3: 6.5, 4: 7.0, 5: 6.5, 6: 5.5, 0: 0 },
  },
];

