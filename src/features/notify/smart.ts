// ============================================================================
// Smart, adaptive local notifications. Unlike fixed daily reminders, these are
// recomputed from the user's live state every time the app opens (or habits
// change), so the evening nudge only fires when it's actually useful — and its
// wording adapts to the streak the user is about to lose.
// ============================================================================
import { notifications } from '@/platform/notifications';

const EVENING_HOUR = 20; // 20:00 local

export interface StreakNudgeInput {
  /** Habits scheduled today that are still not done. */
  pending: number;
  /** Current overall daily streak. */
  streak: number;
  /** Localised copy for the notification. */
  title: string;
  /** Body when a streak is at stake. Use {n} (streak) and {p} (pending). */
  bodyStreak: string;
  /** Body when there's no streak yet. Use {p} (pending). */
  body: string;
}

/**
 * (Re)schedule the adaptive evening nudge for *today*. Cancels it when the day
 * is already complete or it's too late to be useful. No-op on web.
 */
export async function refreshStreakNudge(input: StreakNudgeInput): Promise<void> {
  const key = 'streak-risk';
  const now = new Date();
  const at = new Date();
  at.setHours(EVENING_HOUR, 0, 0, 0);

  // Nothing pending, or past the nudge time → make sure no stale nudge remains.
  if (input.pending <= 0 || now.getTime() >= at.getTime()) {
    await notifications.cancelKey(key);
    return;
  }

  const body =
    input.streak >= 2
      ? input.bodyStreak.replace('{n}', String(input.streak)).replace('{p}', String(input.pending))
      : input.body.replace('{p}', String(input.pending));

  await notifications.scheduleAt(key, input.title, body, at);
}
