import { format, parseISO, isToday, isTomorrow, isYesterday, differenceInCalendarDays } from 'date-fns';
import { it as dfnIt, enUS as dfnEn } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export const ISO_DAY = 'yyyy-MM-dd';

// ---------------------------------------------------------------------------
// Active locale — kept in sync by the I18nProvider so plain (non-React) format
// helpers below produce dates in the current UI language.
// ---------------------------------------------------------------------------
type LangCode = 'it' | 'en';
let activeLang: LangCode = 'it';
let activeLocale: Locale = dfnIt;

const REL_LABELS: Record<LangCode, { today: string; tomorrow: string; yesterday: string }> = {
  it: { today: 'Oggi', tomorrow: 'Domani', yesterday: 'Ieri' },
  en: { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday' },
};

export function setActiveLang(lang: LangCode) {
  activeLang = lang;
  activeLocale = lang === 'it' ? dfnIt : dfnEn;
}

/** Current UI language for plain (non-React) modules (e.g. demo seed copy). */
export function getActiveLang(): LangCode {
  return activeLang;
}

/** Today as ISO yyyy-MM-dd in local time. */
export function todayISO(d: Date = new Date()): string {
  return format(d, ISO_DAY);
}

export function fromISO(date: string): Date {
  return parseISO(date);
}

/** Long human date, e.g. "Sabato 30 maggio" / "Saturday 30 May". */
export function longDate(d: Date = new Date()): string {
  const s = format(d, 'EEEE d MMMM', { locale: activeLocale });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Relative due-date label in the active language. */
export function dueLabel(dateISO: string): string {
  const d = fromISO(dateISO);
  const rel = REL_LABELS[activeLang];
  if (isToday(d)) return rel.today;
  if (isTomorrow(d)) return rel.tomorrow;
  if (isYesterday(d)) return rel.yesterday;
  const diff = differenceInCalendarDays(d, new Date());
  if (diff > 0 && diff <= 7) return format(d, 'EEEE', { locale: activeLocale });
  return format(d, 'd MMM', { locale: activeLocale });
}

export function isOverdue(dateISO?: string): boolean {
  if (!dateISO) return false;
  return differenceInCalendarDays(fromISO(dateISO), new Date()) < 0;
}

/** Format seconds as H:MM:SS or MM:SS. */
export function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.floor(totalSec % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Format minutes nicely, e.g. 90 -> "1h 30min". */
export function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

export function formatPace(secPerKm: number): string {
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${s.toString().padStart(2, '0')}"/km`;
}

export function formatMoney(amount: number, currency = 'EUR'): string {
  const loc = activeLang === 'it' ? 'it-IT' : 'en-US';
  return new Intl.NumberFormat(loc, { style: 'currency', currency }).format(amount);
}

export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7); // yyyy-MM
}

export function currentMonthKey(d: Date = new Date()): string {
  return format(d, 'yyyy-MM');
}

/** date-fns Locale for the active language (for components formatting dates). */
export function activeDfnLocale(): Locale {
  return activeLocale;
}
