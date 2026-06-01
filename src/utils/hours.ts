import type { DayKey, DayEntry } from '../types/timesheet';

export function parseTime(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatMinutes(m: number): string {
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return `${h}h ${min}m`;
}

export function calcDayMinutes(day: DayEntry): number {
  if (!day.start || !day.finish) return 0;
  const start = parseTime(day.start);
  const finish = parseTime(day.finish);
  let total = finish - start;
  if (total < 0) total += 24 * 60;
  if (day.mealBreak === 'Y') total -= 30;
  return Math.max(0, total);
}

export function calcWeekMinutes(days: Record<DayKey, DayEntry>): number {
  const keys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];
  return keys.reduce((sum, k) => sum + calcDayMinutes(days[k]), 0);
}
