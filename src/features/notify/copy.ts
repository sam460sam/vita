import type { TKey } from '@/i18n';

type T = (k: TKey, v?: Record<string, string | number>) => string;

/** How many body variants exist per reminder kind (body, body2, body3…). */
const BODY_VARIANTS: Record<string, number> = {
  water: 3,
  workout: 3,
  journal: 3,
  weight: 3,
  evening: 3,
  motivation: 1,
};

/** Pick a random localized body for a reminder kind, so the copy varies each
 *  time a reminder is (re)scheduled instead of always being identical. */
export function reminderBody(t: T, kind: string): string {
  const n = BODY_VARIANTS[kind] ?? 1;
  const i = Math.floor(Math.random() * n); // 0 → 'body', 1 → 'body2', …
  const key = (i === 0 ? `reminder.${kind}.body` : `reminder.${kind}.body${i + 1}`) as TKey;
  return t(key);
}
