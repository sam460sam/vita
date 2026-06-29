// ============================================================================
// Progress / trends — daily · weekly · monthly aggregation across the wellness
// core (habits + water + workouts). Pure functions over Dexie data, reused by
// the Progress page. No network, no side effects.
// ============================================================================
import { subDays } from 'date-fns';
import type { Habit, HabitLog, WaterLog, Workout } from '@/data/types';
import { isScheduled, isDone } from '@/features/abitudini/logic';

export type ProgressPeriod = 'day' | 'week' | 'month';
export const PERIOD_DAYS: Record<ProgressPeriod, number> = { day: 1, week: 7, month: 30 };

/** One day's snapshot used for the trend chart. */
export interface DayPoint {
  date: string;
  /** % of scheduled habits done that day (0–100). */
  habitPct: number;
  waterMl: number;
  metWaterGoal: boolean;
}

export interface ProgressStats {
  habitsDone: number;
  habitsScheduled: number;
  /** Average habit completion over the period (0–100). */
  habitPct: number;
  waterMl: number;
  /** Days that hit the water goal. */
  goalDays: number;
  workouts: number;
  series: DayPoint[];
}

function isoDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = subDays(new Date(), i);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  return out;
}

export function computeProgress(
  period: ProgressPeriod,
  habits: Habit[],
  logs: HabitLog[],
  waters: WaterLog[],
  workouts: Workout[],
  goalMl: number,
): ProgressStats {
  const days = isoDays(PERIOD_DAYS[period]);
  const daySet = new Set(days);
  const active = habits.filter((h) => !h.archived);
  const from = new Date(`${days[0]}T00:00:00`).getTime();

  let habitsDone = 0;
  let habitsScheduled = 0;
  const series: DayPoint[] = days.map((date) => {
    const scheduled = active.filter((h) => isScheduled(h, date));
    const done = scheduled.filter((h) => isDone(logs, h.id, date)).length;
    habitsDone += done;
    habitsScheduled += scheduled.length;
    const ml = waters.filter((w) => w.date === date).reduce((s, w) => s + w.ml, 0);
    return { date, habitPct: scheduled.length ? Math.round((done / scheduled.length) * 100) : 0, waterMl: ml, metWaterGoal: goalMl > 0 && ml >= goalMl };
  });

  const waterMl = waters.filter((w) => daySet.has(w.date)).reduce((s, w) => s + w.ml, 0);
  const goalDays = series.filter((p) => p.metWaterGoal).length;
  const workoutsN = workouts.filter((w) => w.startedAt >= from).length;

  return {
    habitsDone,
    habitsScheduled,
    habitPct: habitsScheduled ? Math.round((habitsDone / habitsScheduled) * 100) : 0,
    waterMl,
    goalDays,
    workouts: workoutsN,
    series,
  };
}
