// ============================================================================
// Local notifications wrapper for habit reminders.
// Native (Capacitor): schedules real local notifications.
// Web: no-op for now (a future enhancement could use the Notifications API +
// service worker). The UI stores the reminder time regardless.
// ============================================================================
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/** Stable numeric id derived from a habit's string id (notifications need ints). */
function notifId(habitId: string): number {
  let h = 0;
  for (let i = 0; i < habitId.length; i++) h = (h * 31 + habitId.charCodeAt(i)) | 0;
  return Math.abs(h) % 2_000_000_000;
}

export const notifications = {
  supported(): boolean {
    return isNative;
  },

  /** Ask for permission (returns true if granted). */
  async requestPermission(): Promise<boolean> {
    if (!isNative) return false;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedule (or reschedule) a daily reminder for a habit at HH:mm.
   * Pass an empty/undefined time to cancel.
   */
  async scheduleHabitReminder(habitId: string, name: string, time?: string): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const id = notifId(habitId);
      await LocalNotifications.cancel({ notifications: [{ id }] });
      if (!time) return;
      const [hh, mm] = time.split(':').map(Number);
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title: 'Vita',
            body: `Promemoria: ${name}`,
            schedule: { on: { hour: hh, minute: mm }, repeats: true },
          },
        ],
      });
    } catch {
      /* notifications unavailable */
    }
  },

  async cancelHabitReminder(habitId: string): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: notifId(habitId) }] });
    } catch {
      /* noop */
    }
  },

  /**
   * Schedule (or cancel) a named daily reminder (water / workout / journal).
   * Stable id per kind so re-scheduling replaces the previous one.
   */
  async setDailyReminder(kind: 'water' | 'workout' | 'journal', title: string, body: string, time?: string): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const id = notifId(`reminder:${kind}`);
      await LocalNotifications.cancel({ notifications: [{ id }] });
      if (!time) return;
      const [hh, mm] = time.split(':').map(Number);
      await LocalNotifications.schedule({
        notifications: [{ id, title, body, schedule: { on: { hour: hh, minute: mm }, repeats: true } }],
      });
    } catch {
      /* notifications unavailable */
    }
  },
};
