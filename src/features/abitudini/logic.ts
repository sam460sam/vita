import { subDays, parseISO, format, isAfter, startOfDay } from 'date-fns';
import type { Habit, HabitLog } from '@/data/types';
import { todayISO } from '@/lib/format';

/** Is this habit scheduled on the given weekday/date? */
export function isScheduled(habit: Habit, dateISO: string): boolean {
  const d = parseISO(dateISO);
  const dow = d.getDay(); // 0=Sun
  switch (habit.frequency.type) {
    case 'daily':
      return true;
    case 'specific_days':
      return habit.frequency.days?.includes(dow) ?? false;
    case 'times_per_week':
      return true; // can be done any day; target is weekly count
  }
}

export function isDone(logs: HabitLog[], habitId: string, dateISO: string): boolean {
  return logs.some((l) => l.habitId === habitId && l.date === dateISO && l.done);
}

/** Current consecutive-day streak counting back from today (scheduled days only). */
export function currentStreak(habit: Habit, logs: HabitLog[]): number {
  const doneSet = new Set(logs.filter((l) => l.habitId === habit.id && l.done).map((l) => l.date));
  let streak = 0;
  let cursor = new Date();
  // Allow today to be not-yet-done without breaking the streak.
  if (!doneSet.has(todayISO())) cursor = subDays(cursor, 1);
  for (let i = 0; i < 730; i++) {
    const iso = format(cursor, 'yyyy-MM-dd');
    if (isScheduled(habit, iso)) {
      if (doneSet.has(iso)) streak++;
      else break;
    }
    cursor = subDays(cursor, 1);
  }
  return streak;
}

/** Best/record streak over history. */
export function bestStreak(habit: Habit, logs: HabitLog[]): number {
  const dates = logs
    .filter((l) => l.habitId === habit.id && l.done)
    .map((l) => l.date)
    .sort();
  if (dates.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const cur = parseISO(dates[i]);
    const gap = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    if (gap === 1) run++;
    else run = 1;
    best = Math.max(best, run);
  }
  return best;
}

/** Completion rate over the last N days (scheduled days only). */
export function completionRate(habit: Habit, logs: HabitLog[], days = 30): number {
  const doneSet = new Set(logs.filter((l) => l.habitId === habit.id && l.done).map((l) => l.date));
  let scheduled = 0;
  let done = 0;
  for (let i = 0; i < days; i++) {
    const iso = format(subDays(new Date(), i), 'yyyy-MM-dd');
    if (isScheduled(habit, iso)) {
      scheduled++;
      if (doneSet.has(iso)) done++;
    }
  }
  return scheduled === 0 ? 0 : done / scheduled;
}

/** Heatmap cells for the last `weeks` weeks (oldest..newest), grid of days. */
export function heatmapData(habit: Habit, logs: HabitLog[], days = 119): { date: string; done: boolean; scheduled: boolean }[] {
  const doneSet = new Set(logs.filter((l) => l.habitId === habit.id && l.done).map((l) => l.date));
  const out: { date: string; done: boolean; scheduled: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const iso = format(d, 'yyyy-MM-dd');
    out.push({ date: iso, done: doneSet.has(iso), scheduled: isScheduled(habit, iso) });
  }
  return out;
}

export function frequencyLabel(habit: Habit): string {
  const f = habit.frequency;
  if (f.type === 'daily') return 'Ogni giorno';
  if (f.type === 'times_per_week') return `${f.timesPerWeek ?? 3}× a settimana`;
  const names = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  return (f.days ?? []).map((d) => names[d]).join(' ') || 'Giorni specifici';
}

/** Habits scheduled today that are not yet checked. */
export function pendingToday(habits: Habit[], logs: HabitLog[]): Habit[] {
  const t = todayISO();
  return habits
    .filter((h) => !h.archived && isScheduled(h, t) && !isDone(logs, h.id, t))
    .sort((a, b) => a.order - b.order);
}

export function notFuture(dateISO: string): boolean {
  return !isAfter(startOfDay(parseISO(dateISO)), startOfDay(new Date()));
}
