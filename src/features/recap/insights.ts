// ============================================================================
// Personalised weekly insights — short, encouraging observations comparing the
// last 7 days with the previous 7. Each insight is an i18n key + variables so
// it renders in the active language.
// ============================================================================
import { subDays, startOfDay } from 'date-fns';
import type { LifeData } from '@/features/gamification/logic';
import { mostConsistentWeekday } from '@/features/gamification/logic';
import { isScheduled } from '@/features/abitudini/logic';
import { todayISO } from '@/lib/format';

export interface Insight {
  key: string; // i18n key
  vars?: Record<string, string | number>;
  tone: 'up' | 'down' | 'info';
}

function daySet(offset: number): Set<string> {
  const set = new Set<string>();
  for (let i = 0; i < 7; i++) set.add(todayISO(subDays(new Date(), i + offset)));
  return set;
}

function pct(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export function weeklyInsights(d: LifeData): Insight[] {
  const out: Insight[] = [];
  const thisWeek = daySet(0);
  const lastWeek = daySet(7);
  const thisFrom = startOfDay(subDays(new Date(), 6)).getTime();
  const lastFrom = startOfDay(subDays(new Date(), 13)).getTime();

  // Habits completion
  const habitsNow = d.logs.filter((l) => l.done && thisWeek.has(l.date) && d.habits.some((h) => h.id === l.habitId && isScheduled(h, l.date))).length;
  const habitsPrev = d.logs.filter((l) => l.done && lastWeek.has(l.date) && d.habits.some((h) => h.id === l.habitId && isScheduled(h, l.date))).length;
  if (habitsNow > 0 || habitsPrev > 0) {
    const delta = pct(habitsNow, habitsPrev);
    if (delta >= 10) out.push({ key: 'insight.habits.up', vars: { n: Math.abs(delta) }, tone: 'up' });
    else if (delta <= -10) out.push({ key: 'insight.habits.down', vars: { n: Math.abs(delta) }, tone: 'down' });
    else out.push({ key: 'insight.habits.steady', vars: { n: habitsNow }, tone: 'info' });
  }

  // Water
  const waterNow = d.waters.filter((w) => thisWeek.has(w.date)).reduce((s, w) => s + w.ml, 0);
  const waterPrev = d.waters.filter((w) => lastWeek.has(w.date)).reduce((s, w) => s + w.ml, 0);
  if (waterNow > 0 || waterPrev > 0) {
    const delta = pct(waterNow, waterPrev);
    if (delta >= 10) out.push({ key: 'insight.water.up', vars: { n: Math.abs(delta) }, tone: 'up' });
    else out.push({ key: 'insight.water.total', vars: { l: (waterNow / 1000).toFixed(1) }, tone: 'info' });
  }

  // Workouts
  const woNow = d.workouts.filter((w) => w.startedAt >= thisFrom).length;
  const woPrev = d.workouts.filter((w) => w.startedAt >= lastFrom && w.startedAt < thisFrom).length;
  if (woNow > woPrev && woNow > 0) out.push({ key: 'insight.workouts.up', vars: { n: woNow }, tone: 'up' });
  else if (woNow > 0) out.push({ key: 'insight.workouts.count', vars: { n: woNow }, tone: 'info' });

  // Most consistent weekday
  const wd = mostConsistentWeekday(d);
  if (wd !== null) out.push({ key: 'insight.weekday', vars: { day: `weekday.${wd}` }, tone: 'info' });

  return out.slice(0, 4);
}
