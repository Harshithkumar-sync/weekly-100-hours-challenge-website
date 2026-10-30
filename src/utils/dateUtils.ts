// Date and Time utility functions for WEEKLY 100

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the start and end Date of the current week based on weekStartDay (0 = Sunday, 1 = Monday)
 */
export function getWeekBounds(referenceDate = new Date(), weekStartDay: 0 | 1 = 1): { startDate: Date; endDate: Date } {
  const d = new Date(referenceDate);
  d.setHours(0, 0, 0, 0);
  const currentDay = d.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  
  // Calculate difference to reach weekStartDay
  let diff = currentDay - weekStartDay;
  if (diff < 0) {
    diff += 7;
  }
  
  const startDate = new Date(d);
  startDate.setDate(d.getDate() - diff);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

/**
 * Get list of 7 days for the week with dates
 */
export function getDaysOfWeek(startDate: Date): Array<{ dayIndex: number; name: string; short: string; dateStr: string; dateObj: Date }> {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(startDate);
    cur.setDate(startDate.getDate() + i);
    const dayIndex = cur.getDay();
    days.push({
      dayIndex,
      name: DAY_NAMES[dayIndex],
      short: DAY_SHORT[dayIndex],
      dateStr: formatDateISO(cur),
      dateObj: cur,
    });
  }
  return days;
}

/**
 * Format milliseconds into HH:MM:SS
 */
export function formatDurationHMS(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format minutes into readable "Xh Ym" or "X.Y hrs"
 */
export function formatMinutesHuman(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0h';
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format decimal hours to readable e.g. 7.5 -> "7h 30m" or "7.5h"
 */
export function formatDecimalHours(hours: number): string {
  if (hours === 0) return '0h';
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  if (minutes === 0) return `${wholeHours}h`;
  if (wholeHours === 0) return `${minutes}m`;
  return `${wholeHours}h ${minutes}m`;
}

/**
 * Format a 24h time string (e.g. "14:30") to 12h ("2:30 PM") or leave as 24h
 */
export function formatTimeString(timeStr: string, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '';
  if (format === '24h') return timeStr;
  
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return timeStr;
  
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Check if a date string is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === formatDateISO(new Date());
}

/**
 * Get human readable day label (e.g. "Today", "Tomorrow", "Yesterday", or "Oct 30")
 */
export function getRelativeDayLabel(dateStr: string): string {
  const today = formatDateISO(new Date());
  if (dateStr === today) return 'Today';
  
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (dateStr === formatDateISO(yest)) return 'Yesterday';

  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  if (dateStr === formatDateISO(tom)) return 'Tomorrow';

  // Format as "Mon, Oct 30"
  try {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

