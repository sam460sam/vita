// ============================================================================
// US formatting helpers — USD currency, imperial units, US dates.
// Currency/number via Intl('en-US'); the active locale only affects unit words
// and relative date labels (crew-facing Spanish).
// ============================================================================
import { format, parseISO, isToday, isTomorrow, isYesterday, differenceInCalendarDays } from 'date-fns';
import type { Locale, Unit } from '@/data/types';

export const ISO_DAY = 'yyyy-MM-dd';

let activeLocale: Locale = 'en';
export function setActiveLocale(l: Locale) {
  activeLocale = l;
}

// ---------------------------------------------------------------------------
// Money — always USD, en-US grouping, tabular figures in the UI.
// ---------------------------------------------------------------------------
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function money(amount: number): string {
  return usd.format(amount || 0);
}

/** Whole-dollar money (no cents) — for big glanceable headline figures. */
export function moneyWhole(amount: number): string {
  return usd0.format(amount || 0);
}

/** Signed money for deltas (change orders): +$2,800 / −$800. */
export function moneyDelta(amount: number): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '−' : '';
  return `${sign}${usd.format(Math.abs(amount || 0))}`;
}

// ---------------------------------------------------------------------------
// Units (imperial)
// ---------------------------------------------------------------------------
const UNIT_LABELS: Record<Locale, Record<Unit, string>> = {
  en: { sf: 'SF', sy: 'SY', cy: 'CY', lf: 'LF', ea: 'EA', hr: 'HR', ton: 'TON', ls: 'LS' },
  es: { sf: 'PC', sy: 'YC', cy: 'YD³', lf: 'PL', ea: 'C/U', hr: 'HR', ton: 'TON', ls: 'GL' },
};

const UNIT_NAMES: Record<Unit, string> = {
  sf: 'Square feet',
  sy: 'Square yards',
  cy: 'Cubic yards',
  lf: 'Linear feet',
  ea: 'Each',
  hr: 'Hours',
  ton: 'Tons',
  ls: 'Lump sum',
};

export function unitLabel(u: Unit): string {
  return UNIT_LABELS[activeLocale][u] ?? u.toUpperCase();
}

export function unitName(u: Unit): string {
  return UNIT_NAMES[u] ?? u;
}

/** Quantity with up to 2 decimals, trailing zeros trimmed. */
export function qty(n: number): string {
  return (Math.round((n || 0) * 100) / 100).toString();
}

// ---------------------------------------------------------------------------
// Dates (US format)
// ---------------------------------------------------------------------------
export function todayISO(d: Date = new Date()): string {
  return format(d, ISO_DAY);
}

export function fromISO(date: string): Date {
  return parseISO(date);
}

/** US short date e.g. "Jun 12, 2026". */
export function usDate(d: Date | string = new Date()): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'MMM d, yyyy');
}

/** US date + time e.g. "Jun 12, 2026 · 3:41 PM". */
export function usDateTime(ms: number): string {
  return format(new Date(ms), "MMM d, yyyy · h:mm a");
}

const REL: Record<Locale, { today: string; tomorrow: string; yesterday: string }> = {
  en: { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' },
  es: { today: 'Hoy', tomorrow: 'Mañana', yesterday: 'Ayer' },
};

export function dueLabel(dateISO: string): string {
  const d = parseISO(dateISO);
  const r = REL[activeLocale];
  if (isToday(d)) return r.today;
  if (isTomorrow(d)) return r.tomorrow;
  if (isYesterday(d)) return r.yesterday;
  return usDate(d);
}

export function isPast(dateISO: string): boolean {
  return differenceInCalendarDays(parseISO(dateISO), new Date()) < 0;
}
