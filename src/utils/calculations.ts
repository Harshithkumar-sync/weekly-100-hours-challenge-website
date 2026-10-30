// Business Logic and Metric Calculations for WEEKLY 100
import { TimeSession, WeeklyChallenge, ProductivityLevel, ScheduledBlock } from '../types';
import { formatDateISO } from './dateUtils';

export interface WeeklyMetrics {
  targetHours: number;
  completedHours: number;
  remainingHours: number;
  completionPercentage: number;
  activeDaysCount: number;
  elapsedActiveDays: number;
  remainingActiveDays: number;
  averageCompletedPerActiveDay: number;
  requiredAveragePerRemainingDay: number;
  isCompleted: boolean;
  isOverTarget: boolean;
  todayTargetHours: number;
  todayCompletedHours: number;
  todayRemainingHours: number;
  todayCompletionPercentage: number;
  todayStatus: 'not_started' | 'in_progress' | 'completed' | 'rest_day' | 'over_target';
}

/**
 * Calculate weekly metrics given the active challenge, sessions, and today's date
 */
export function calculateWeeklyMetrics(
  challenge: WeeklyChallenge,
  sessions: TimeSession[],
  currentDate = new Date()
): WeeklyMetrics {
  const targetHours = Math.max(0, challenge.targetHours);
  const currentDayOfWeek = currentDate.getDay();
  const todayStr = formatDateISO(currentDate);

  // Filter sessions that belong to the current challenge date range
  const challengeSessions = sessions.filter(
    (s) => s.date >= challenge.startDate && s.date <= challenge.endDate
  );

  // Total completed productive hours
  const totalCompletedMinutes = challengeSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedHours = Math.round((totalCompletedMinutes / 60) * 10) / 10;

  // Remaining hours
  const remainingHours = Math.max(0, Math.round((targetHours - completedHours) * 10) / 10);

  // Percentage (safely avoid division by zero)
  const completionPercentage = targetHours > 0 ? Math.min(1000, Math.round((completedHours / targetHours) * 100)) : 0;

  // Determine elapsed and remaining active days
  // Get active days set
  const activeDaysSet = new Set(challenge.activeDays || []);
  
  // Calculate which days of this challenge have occurred up to today
  const startD = new Date(challenge.startDate + 'T00:00:00');
  const endD = new Date(challenge.endDate + 'T23:59:59');
  
  let elapsedActiveDays = 0;
  let remainingActiveDays = 0;
  
  for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isAct = activeDaysSet.has(dayOfWeek);
    if (!isAct) continue;

    const dStr = formatDateISO(d);
    if (dStr <= todayStr) {
      elapsedActiveDays++;
    } else {
      remainingActiveDays++;
    }
  }

  // Average completed per active day elapsed (at least 1 to avoid div by zero)
  const effectiveElapsedDays = Math.max(1, elapsedActiveDays);
  const averageCompletedPerActiveDay = Math.round((completedHours / effectiveElapsedDays) * 10) / 10;

  // Required average for remaining active days
  const requiredAveragePerRemainingDay =
    remainingActiveDays > 0 ? Math.round((remainingHours / remainingActiveDays) * 10) / 10 : 0;

  // Today's metrics
  const todayTarget = challenge.dailyTargets[currentDayOfWeek] ?? 0;
  const isTodayActive = activeDaysSet.has(currentDayOfWeek);

  const todaySessions = sessions.filter((s) => s.date === todayStr);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayCompletedHours = Math.round((todayMinutes / 60) * 10) / 10;
  const todayRemainingHours = Math.max(0, Math.round((todayTarget - todayCompletedHours) * 10) / 10);
  const todayCompletionPercentage = todayTarget > 0 ? Math.round((todayCompletedHours / todayTarget) * 100) : 0;

  let todayStatus: WeeklyMetrics['todayStatus'] = 'not_started';
  if (!isTodayActive || todayTarget === 0) {
    todayStatus = 'rest_day';
  } else if (todayCompletedHours >= todayTarget) {
    todayStatus = todayCompletedHours > todayTarget ? 'over_target' : 'completed';
  } else if (todayCompletedHours > 0) {
    todayStatus = 'in_progress';
  }

  return {
    targetHours,
    completedHours,
    remainingHours,
    completionPercentage,
    activeDaysCount: challenge.activeDaysCount || challenge.activeDays.length,
    elapsedActiveDays,
    remainingActiveDays,
    averageCompletedPerActiveDay,
    requiredAveragePerRemainingDay,
    isCompleted: completedHours >= targetHours && targetHours > 0,
    isOverTarget: completedHours > targetHours,
    todayTargetHours: todayTarget,
    todayCompletedHours,
    todayRemainingHours,
    todayCompletionPercentage,
    todayStatus,
  };
}

/**
 * Check if a time interval [newStart, newEnd] overlaps with any existing session
 */
export function checkSessionOverlap(
  newStartMs: number,
  newEndMs: number,
  existingSessions: TimeSession[],
  excludeSessionId?: string
): { hasOverlap: boolean; conflictingSession?: TimeSession } {
  for (const s of existingSessions) {
    if (excludeSessionId && s.id === excludeSessionId) continue;
    // Overlap condition: start1 < end2 && start2 < end1
    if (newStartMs < s.endTime && s.startTime < newEndMs) {
      return { hasOverlap: true, conflictingSession: s };
    }
  }
  return { hasOverlap: false };
}

/**
 * Calculate scheduled non-overlapping hours for schedule blocks
 */
export function calculateScheduledHours(blocks: ScheduledBlock[]): number {
  if (blocks.length === 0) return 0;
  
  // Group by day of week
  const byDay: Record<number, Array<{ start: number; end: number }>> = {};
  for (const b of blocks) {
    const startMin = timeStrToMinutes(b.startTime);
    const endMin = timeStrToMinutes(b.endTime);
    if (endMin <= startMin) continue;
    if (!byDay[b.dayOfWeek]) byDay[b.dayOfWeek] = [];
    byDay[b.dayOfWeek].push({ start: startMin, end: endMin });
  }

  let totalMinutes = 0;

  // Merge overlapping intervals on each day
  for (const day in byDay) {
    const intervals = byDay[day].sort((a, b) => a.start - b.start);
    if (intervals.length === 0) continue;

    const merged: Array<{ start: number; end: number }> = [intervals[0]];
    for (let i = 1; i < intervals.length; i++) {
      const current = intervals[i];
      const last = merged[merged.length - 1];
      if (current.start < last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        merged.push(current);
      }
    }

    for (const m of merged) {
      totalMinutes += m.end - m.start;
    }
  }

  return Math.round((totalMinutes / 60) * 10) / 10;
}

export function timeStrToMinutes(str: string): number {
  if (!str) return 0;
  const [h, m] = str.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

/**
 * Determine productivity level based on sustainable consistency
 */
export function calculateProductivityLevel(
  totalHistoricalHours: number,
  consecutiveStreakWeeks: number,
  allSessionsCount: number
): { level: ProductivityLevel; progressToNext: number; currentXP: number; nextXP: number } {
  // Sustainable XP based on consistency, sessions, and steady hours
  const xp = Math.round(totalHistoricalHours * 10 + consecutiveStreakWeeks * 50 + allSessionsCount * 5);

  const levels: Array<{ level: ProductivityLevel; requiredXP: number }> = [
    { level: 'Beginner', requiredXP: 0 },
    { level: 'Explorer', requiredXP: 100 },
    { level: 'Consistent', requiredXP: 300 },
    { level: 'Focused', requiredXP: 700 },
    { level: 'Advanced', requiredXP: 1400 },
    { level: 'Master', requiredXP: 2500 },
  ];

  let currentLevelIndex = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].requiredXP) {
      currentLevelIndex = i;
      break;
    }
  }

  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];

  let progressToNext = 100;
  let nextXP = currentLevel.requiredXP;

  if (nextLevel) {
    const span = nextLevel.requiredXP - currentLevel.requiredXP;
    const earned = xp - currentLevel.requiredXP;
    progressToNext = Math.min(100, Math.max(0, Math.round((earned / span) * 100)));
    nextXP = nextLevel.requiredXP;
  }

  return {
    level: currentLevel.level,
    progressToNext,
    currentXP: xp,
    nextXP,
  };
}

/**
 * Calculate consistency streak in days from session history
 */
export function calculateCurrentStreak(sessions: TimeSession[], activeDays: number[]): number {
  if (sessions.length === 0) return 0;

  const datesWithWork = new Set(sessions.map((s) => s.date));
  const activeDaysSet = new Set(activeDays);

  const cur = new Date();
  let streak = 0;

  // Check today
  const todayStr = formatDateISO(cur);
  if (datesWithWork.has(todayStr)) {
    streak++;
  } else if (activeDaysSet.has(cur.getDay())) {
    // If today is active and not yet worked, allow streak from yesterday
  }

  // Go backwards
  for (let i = 1; i < 90; i++) {
    const prev = new Date();
    prev.setDate(prev.getDate() - i);
    const prevStr = formatDateISO(prev);
    const dayOfWeek = prev.getDay();

    if (!activeDaysSet.has(dayOfWeek)) {
      // Rest day: does not break streak!
      continue;
    }

    if (datesWithWork.has(prevStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

