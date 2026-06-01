import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Settings, WeightLog } from '@/data/types';

export const KG_TO_LB = 2.20462;

export function toDisplay(kg: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? kg * KG_TO_LB : kg;
}
export function fromDisplay(v: number, unit: 'kg' | 'lb'): number {
  return unit === 'lb' ? v / KG_TO_LB : v;
}

export interface BmiInfo {
  value: number;
  category: 'under' | 'healthy' | 'over' | 'obese';
}

export function bmi(weightKg: number, heightCm?: number): BmiInfo | null {
  if (!heightCm || heightCm <= 0) return null;
  const m = heightCm / 100;
  const v = weightKg / (m * m);
  const category = v < 18.5 ? 'under' : v < 25 ? 'healthy' : v < 30 ? 'over' : 'obese';
  return { value: Math.round(v * 10) / 10, category };
}

/** Sorted oldest→newest. */
export function sortLogs(logs: WeightLog[]): WeightLog[] {
  return [...logs].sort((a, b) => a.date.localeCompare(b.date));
}

export function latest(logs: WeightLog[]): WeightLog | null {
  const s = sortLogs(logs);
  return s.length ? s[s.length - 1] : null;
}

/** % progress from start → goal based on current weight (0..1, can clamp). */
export function goalProgress(s: Settings, currentKg: number): number {
  const start = s.body.startWeightKg;
  const goal = s.body.goalWeightKg;
  if (start == null || goal == null || start === goal) return 0;
  const p = (currentKg - start) / (goal - start);
  return Math.max(0, Math.min(1, p));
}

/** Change over the last N days (display unit), or null if not enough data. */
export function changeOver(logs: WeightLog[], days: number, unit: 'kg' | 'lb'): number | null {
  const s = sortLogs(logs);
  if (s.length < 2) return null;
  const last = s[s.length - 1];
  const cutoff = differenceInCalendarDays(parseISO(last.date), parseISO(s[0].date));
  if (cutoff < 1) return null;
  // find the earliest log that is at least `days` before the last one
  const target = s.filter((l) => differenceInCalendarDays(parseISO(last.date), parseISO(l.date)) >= days);
  const base = target.length ? target[target.length - 1] : s[0];
  return toDisplay(last.weightKg - base.weightKg, unit);
}

/** Simple ETA to goal from recent rate (last ~30 days). */
export function projectedGoalDate(logs: WeightLog[], goalKg?: number): Date | null {
  if (goalKg == null) return null;
  const s = sortLogs(logs);
  if (s.length < 2) return null;
  const last = s[s.length - 1];
  const ref = s.find((l) => differenceInCalendarDays(parseISO(last.date), parseISO(l.date)) <= 30) ?? s[0];
  const days = differenceInCalendarDays(parseISO(last.date), parseISO(ref.date));
  if (days < 1) return null;
  const ratePerDay = (last.weightKg - ref.weightKg) / days; // kg/day
  if (ratePerDay === 0) return null;
  const remaining = goalKg - last.weightKg;
  // moving the wrong way → no ETA
  if (Math.sign(remaining) !== Math.sign(ratePerDay)) return null;
  const daysLeft = remaining / ratePerDay;
  if (daysLeft <= 0 || daysLeft > 3650) return null;
  const d = new Date();
  d.setDate(d.getDate() + Math.round(daysLeft));
  return d;
}
