import { subDays, startOfDay } from 'date-fns';
import type { Habit, HabitLog, JournalEntry, Task, WaterLog, Workout } from '@/data/types';
import { isScheduled } from '@/features/abitudini/logic';
import { todayISO } from '@/lib/format';

export interface WeeklyRecap {
  habitsCompleted: number;
  waterMl: number;
  workouts: number;
  tasksCompleted: number;
  journalEntries: number;
}

/** Aggregate the last 7 days (including today) across modules. */
export function weeklyRecap(
  habits: Habit[],
  logs: HabitLog[],
  tasks: Task[],
  workouts: Workout[],
  waters: WaterLog[],
  journals: JournalEntry[],
): WeeklyRecap {
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = subDays(new Date(), i);
    days.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  const daySet = new Set(days);
  const from = startOfDay(subDays(new Date(), 6)).getTime();

  const habitsCompleted = logs.filter((l) => l.done && daySet.has(l.date) && habits.some((h) => h.id === l.habitId && isScheduled(h, l.date))).length;
  const waterMl = waters.filter((w) => daySet.has(w.date)).reduce((s, w) => s + w.ml, 0);
  const workoutsN = workouts.filter((w) => w.startedAt >= from).length;
  const tasksCompleted = tasks.filter((t) => t.status === 'done' && t.completedAt && t.completedAt >= from).length;
  const journalEntries = journals.filter((j) => daySet.has(j.date)).length;

  return { habitsCompleted, waterMl, workouts: workoutsN, tasksCompleted, journalEntries };
}

export function hasAnyData(r: WeeklyRecap): boolean {
  return r.habitsCompleted + r.waterMl + r.workouts + r.tasksCompleted + r.journalEntries > 0;
}

export { todayISO };
