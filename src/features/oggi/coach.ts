// ============================================================================
// Panda coach — Vita's mascot speaks. Contextual one-liners (encouragement,
// streak praise, gentle nudges) plus a rotating daily affirmation. All copy is
// i18n keys, picked deterministically by the day so it feels intentional, not
// random-spammy.
// ============================================================================
import type { Momentum } from './momentum';

/** Day-of-year index for deterministic daily rotation. */
function dayIndex(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

const AFFIRMATIONS = [
  'affirm.1',
  'affirm.2',
  'affirm.3',
  'affirm.4',
  'affirm.5',
  'affirm.6',
  'affirm.7',
  'affirm.8',
  'affirm.9',
  'affirm.10',
] as const;

/** Today's affirmation key (stable for the whole day). */
export function dailyAffirmation(): string {
  return AFFIRMATIONS[dayIndex() % AFFIRMATIONS.length];
}

export interface CoachLine {
  key: string;
  vars?: Record<string, string | number>;
}

/**
 * What the panda says on the dashboard, based on the moment.
 * Priority: big streak → completed day → momentum bands → first-steps.
 */
export function pandaLine(m: Momentum, streak: number): CoachLine {
  if (streak >= 7) return { key: 'panda.streak.big', vars: { n: streak } };
  if (m.score >= 80) return { key: 'panda.great' };
  if (streak >= 2) return { key: 'panda.streak', vars: { n: streak } };
  if (m.score >= 45) return { key: 'panda.good' };
  if (m.score >= 15) return { key: 'panda.start' };
  return { key: 'panda.hello' };
}
