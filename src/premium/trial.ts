// ============================================================================
// Local free-trial clock. The first week of use is free; after that the paywall
// kicks in. Stored locally (first-launch timestamp) — see config.ts note about
// reinstall behaviour.
// ============================================================================
import { TRIAL_DAYS } from './config';

const KEY = 'vita.trialStart';

/** Returns the trial start (first launch) timestamp, initialising it on first call. */
export function ensureTrialStarted(): number {
  try {
    const v = localStorage.getItem(KEY);
    if (v) return Number(v);
    const now = Date.now();
    localStorage.setItem(KEY, String(now));
    return now;
  } catch {
    return Date.now();
  }
}

/** Whole days left in the free week (0 once expired). */
export function trialDaysLeft(): number {
  const elapsedDays = (Date.now() - ensureTrialStarted()) / 86_400_000;
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays));
}

/** True while the free week is still running. */
export function isTrialActive(): boolean {
  return trialDaysLeft() > 0;
}
