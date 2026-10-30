// Real-time Productivity Insights Generator calculated strictly from user data
import { TimeSession, WeeklyChallenge, Category, Task, HistoricalWeek } from '../types';
import { DAY_NAMES, formatDateISO } from './dateUtils';
import { calculateWeeklyMetrics } from './calculations';

export interface InsightItem {
  id: string;
  type: 'achievement' | 'trend' | 'focus' | 'task' | 'wellness' | 'caution';
  icon: string;
  title: string;
  description: string;
  metric?: string;
  badge?: string;
}

export function generateProductivityInsights(
  challenge: WeeklyChallenge,
  sessions: TimeSession[],
  categories: Category[],
  tasks: Task[],
  history: HistoricalWeek[]
): InsightItem[] {
  const insights: InsightItem[] = [];
  const metrics = calculateWeeklyMetrics(challenge, sessions);

  // 1. Completion Percentage Insight
  if (metrics.targetHours > 0) {
    if (metrics.completionPercentage >= 100) {
      insights.push({
        id: 'target-achieved',
        type: 'achievement',
        icon: 'Trophy',
        title: 'Weekly Target Conquered!',
        description: `You reached ${metrics.completedHours}h out of your ${metrics.targetHours}h target (${metrics.completionPercentage}%). Outstanding focus!`,
        metric: `${metrics.completionPercentage}%`,
        badge: 'Target Met'
      });
    } else if (metrics.completionPercentage >= 75) {
      insights.push({
        id: 'target-progress-high',
        type: 'trend',
        icon: 'Flame',
        title: 'Strong Weekly Momentum',
        description: `You have completed ${metrics.completedHours}h (${metrics.completionPercentage}% of target) with ${metrics.remainingHours}h remaining.`,
        metric: `${metrics.completionPercentage}%`,
        badge: 'On Track'
      });
    } else if (metrics.completionPercentage > 0) {
      insights.push({
        id: 'target-progress-mid',
        type: 'trend',
        icon: 'TrendingUp',
        title: 'Progress in Motion',
        description: `You have logged ${metrics.completedHours}h so far (${metrics.completionPercentage}% of ${metrics.targetHours}h). Average ${metrics.requiredAveragePerRemainingDay}h/day needed for remaining active days.`,
        metric: `${metrics.remainingHours}h left`,
      });
    }
  }

  // 2. Best-performing Day of this week
  const dayTotals: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const weekSessions = sessions.filter(
    (s) => s.date >= challenge.startDate && s.date <= challenge.endDate
  );

  weekSessions.forEach((s) => {
    try {
      const parts = s.date.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      dayTotals[d.getDay()] += s.durationMinutes;
    } catch {
      // ignore
    }
  });

  let bestDayIndex = -1;
  let maxDayMinutes = 0;
  let activeWorkedDays = 0;

  for (let i = 0; i < 7; i++) {
    if (dayTotals[i] > 0) {
      activeWorkedDays++;
      if (dayTotals[i] > maxDayMinutes) {
        maxDayMinutes = dayTotals[i];
        bestDayIndex = i;
      }
    }
  }

  if (bestDayIndex !== -1 && maxDayMinutes > 0) {
    const bestDayHours = Math.round((maxDayMinutes / 60) * 10) / 10;
    insights.push({
      id: 'best-day',
      type: 'focus',
      icon: 'Zap',
      title: `${DAY_NAMES[bestDayIndex]} was your peak day`,
      description: `You recorded ${bestDayHours}h of intentional focus on ${DAY_NAMES[bestDayIndex]}, your most productive day this week.`,
      metric: `${bestDayHours}h`,
      badge: 'Peak Day'
    });
  }

  // 3. Top Category breakdown
  const categoryTotals: Record<string, number> = {};
  weekSessions.forEach((s) => {
    categoryTotals[s.categoryId] = (categoryTotals[s.categoryId] || 0) + s.durationMinutes;
  });

  let topCatId = '';
  let topCatMinutes = 0;
  for (const catId in categoryTotals) {
    if (categoryTotals[catId] > topCatMinutes) {
      topCatMinutes = categoryTotals[catId];
      topCatId = catId;
    }
  }

  if (topCatId && topCatMinutes > 0) {
    const cat = categories.find((c) => c.id === topCatId);
    const catName = cat ? cat.name : 'Primary Activity';
    const catHours = Math.round((topCatMinutes / 60) * 10) / 10;
    const catPct = metrics.completedHours > 0 ? Math.round((catHours / metrics.completedHours) * 100) : 0;
    
    insights.push({
      id: 'top-category',
      type: 'focus',
      icon: 'PieChart',
      title: `Dominant Focus: ${catName}`,
      description: `You invested ${catHours}h (${catPct}% of your weekly productive time) into ${catName}.`,
      metric: `${catHours}h (${catPct}%)`,
    });
  }

  // 4. Comparison with previous week
  if (history.length > 0) {
    const lastWeek = history[0]; // most recent historical week
    if (lastWeek && lastWeek.completedHours > 0) {
      const diff = Math.round((metrics.completedHours - lastWeek.completedHours) * 10) / 10;
      if (diff > 0) {
        insights.push({
          id: 'prev-week-comparison-up',
          type: 'trend',
          icon: 'ArrowUpRight',
          title: 'Ahead of Last Week',
          description: `You have completed ${metrics.completedHours}h so far compared to ${lastWeek.completedHours}h total last week (+${diff}h increase).`,
          metric: `+${diff}h`,
          badge: 'Growth'
        });
      } else if (metrics.completedHours > 0) {
        insights.push({
          id: 'prev-week-comparison-down',
          type: 'trend',
          icon: 'Activity',
          title: 'Tracking vs Previous Week',
          description: `Last week total was ${lastWeek.completedHours}h. Current week is at ${metrics.completedHours}h.`,
          metric: `${metrics.completedHours}h vs ${lastWeek.completedHours}h`
        });
      }
    }
  }

  // 5. Unfinished & In-Progress Tasks
  const unfinishedTasks = tasks.filter((t) => t.status !== 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const completedThisWeek = tasks.filter((t) => t.status === 'completed');

  if (unfinishedTasks.length > 0) {
    insights.push({
      id: 'task-action',
      type: 'task',
      icon: 'CheckSquare',
      title: `${unfinishedTasks.length} Pending Tasks`,
      description: inProgressTasks.length > 0
        ? `You have ${inProgressTasks.length} active in-progress task(s) and ${unfinishedTasks.length} total pending to complete.`
        : `You have ${unfinishedTasks.length} task(s) awaiting your focus sessions.`,
      metric: `${completedThisWeek.length} finished / ${unfinishedTasks.length} pending`,
    });
  }

  // 6. Wellness & Workload Health Check
  const maxDayHours = Math.round((maxDayMinutes / 60) * 10) / 10;
  if (maxDayHours >= 11) {
    insights.push({
      id: 'wellness-pacing',
      type: 'caution',
      icon: 'AlertTriangle',
      title: 'High Daily Workload Caution',
      description: `You reached ${maxDayHours}h on your peak day. Remember that sustainable productivity requires quality sleep and dedicated downtime.`,
      badge: 'Pacing Check'
    });
  } else if (challenge.activeDaysCount === 7 && metrics.targetHours > 50) {
    insights.push({
      id: 'rest-day-recommendation',
      type: 'wellness',
      icon: 'Heart',
      title: 'Schedule a Dedicated Rest Day',
      description: 'Your current challenge is active 7 days a week. Adding at least one recovery day helps prevent burnout and increases weekly cognitive efficiency.',
      badge: 'Wellness'
    });
  }

  return insights;
}

