import { startOfWeek, startOfMonth, format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Settings, Workout } from '@/data/types';
import type { RingData } from '@/ui';
import { todayISO } from '@/lib/format';

export interface RingsSummary {
  move: { value: number; goal: number };
  exercise: { value: number; goal: number };
  stand: { value: number; goal: number };
}

/**
 * Derive the three daily rings from manually-logged workouts.
 * NOTE (assumption): without passive sensors we approximate:
 *  - Movimento = active kcal logged today
 *  - Allenamento = workout minutes today
 *  - In piedi = distinct clock-hours that contain a workout today
 * Fields & `source` are ready for HealthKit/Health Connect to supply real data.
 */
export function todayRings(workouts: Workout[], settings: Settings): RingsSummary {
  const today = todayISO();
  const todays = workouts.filter((w) => format(new Date(w.startedAt), 'yyyy-MM-dd') === today);
  const move = todays.reduce((s, w) => s + w.activeKcal, 0);
  const exercise = Math.round(todays.reduce((s, w) => s + w.durationSec, 0) / 60);
  const standHours = new Set(todays.map((w) => new Date(w.startedAt).getHours())).size;
  return {
    move: { value: Math.round(move), goal: settings.goals.moveKcal },
    exercise: { value: exercise, goal: settings.goals.exerciseMin },
    stand: { value: standHours, goal: settings.goals.standHours },
  };
}

/**
 * Overlay real Apple Health / Health Connect daily data onto the rings when
 * available: Movimento ← active energy burned, Allenamento ← max(logged, health
 * exercise minutes). Goals and the Stand ring stay as computed. No-op if `hk` is
 * null (web, or not connected), so behaviour is unchanged for everyone else.
 */
export function mergeHealthRings(
  base: RingsSummary,
  hk: { activeKcal: number; exerciseMin: number } | null,
): RingsSummary {
  if (!hk) return base;
  return {
    move: { value: Math.round(hk.activeKcal), goal: base.move.goal },
    exercise: { value: Math.max(base.exercise.value, hk.exerciseMin), goal: base.exercise.goal },
    stand: base.stand,
  };
}

export function ringsToData(s: RingsSummary): [RingData, RingData, RingData] {
  return [
    { value: s.move.value, goal: s.move.goal, color: 'var(--c-activity)' },
    { value: s.exercise.value, goal: s.exercise.goal, color: 'var(--c-habit)' },
    { value: s.stand.value, goal: s.stand.goal, color: 'var(--c-project)' },
  ];
}

export interface PeriodSummary {
  count: number;
  totalMin: number;
  totalKcal: number;
  totalDistanceM: number;
  /** per-day buckets for a small bar chart, oldest..newest */
  daily: { label: string; min: number }[];
}

export function summarize(workouts: Workout[], period: 'week' | 'month'): PeriodSummary {
  const from = period === 'week' ? startOfWeek(new Date(), { weekStartsOn: 1 }) : startOfMonth(new Date());
  const inRange = workouts.filter((w) => w.startedAt >= from.getTime());

  const days = period === 'week' ? 7 : new Date().getDate();
  const buckets: { label: string; min: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    if (d > new Date()) break;
    const key = format(d, 'yyyy-MM-dd');
    const min = inRange
      .filter((w) => format(new Date(w.startedAt), 'yyyy-MM-dd') === key)
      .reduce((s, w) => s + w.durationSec / 60, 0);
    buckets.push({ label: period === 'week' ? format(d, 'EEEEE', { locale: it }) : format(d, 'd'), min: Math.round(min) });
  }

  return {
    count: inRange.length,
    totalMin: Math.round(inRange.reduce((s, w) => s + w.durationSec / 60, 0)),
    totalKcal: Math.round(inRange.reduce((s, w) => s + w.activeKcal, 0)),
    totalDistanceM: inRange.reduce((s, w) => s + (w.distanceM ?? 0), 0),
    daily: buckets,
  };
}
