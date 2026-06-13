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
   * Schedule a ONE-OFF notification at a specific moment (used by the "smart"
   * adaptive nudges). Re-scheduling with the same key replaces the previous one;
   * a past `at` simply cancels it.
   */
  async scheduleAt(key: string, title: string, body: string, at: Date): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const id = notifId(`once:${key}`);
      await LocalNotifications.cancel({ notifications: [{ id }] });
      if (at.getTime() <= Date.now()) return;
      await LocalNotifications.schedule({
        notifications: [{ id, title, body, schedule: { at } }],
      });
    } catch {
      /* notifications unavailable */
    }
  },

  /** Cancel a one-off notification scheduled with {@link scheduleAt}. */
  async cancelKey(key: string): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: notifId(`once:${key}`) }] });
    } catch {
      /* noop */
    }
  },

  /**
   * Schedule repeating "drink water" reminders every `everyMin` minutes between
   * 08:00 and 22:00. Pass undefined/0 to turn them off. Uses a dedicated id
   * range so it never clashes with the other reminders.
   */
  async setWaterInterval(everyMin?: number, messages?: string[]): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const base = notifId('reminder:water-interval');
      // Clear up to 24 previously-scheduled slots.
      const old = Array.from({ length: 24 }, (_, i) => ({ id: (base + i) % 2_000_000_000 }));
      await LocalNotifications.cancel({ notifications: old });
      if (!everyMin || everyMin < 15) return;
      const slots: { hour: number; minute: number }[] = [];
      for (let mins = 8 * 60; mins <= 22 * 60 && slots.length < 24; mins += everyMin) {
        slots.push({ hour: Math.floor(mins / 60), minute: mins % 60 });
      }
      // Rotate through the catchy messages so consecutive pings differ.
      const pool = messages && messages.length ? messages : ['💧'];
      await LocalNotifications.schedule({
        notifications: slots.map((s, i) => ({
          id: (base + i) % 2_000_000_000,
          title: 'Vyta',
          body: pool[i % pool.length],
          schedule: { on: { hour: s.hour, minute: s.minute }, repeats: true },
        })),
      });
    } catch {
      /* notifications unavailable */
    }
  },

  /** Current permission state without prompting. */
  async hasPermission(): Promise<boolean> {
    if (!isNative) return false;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      const res = await LocalNotifications.checkPermissions();
      return res.display === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Schedule (or cancel) a named daily reminder (water / workout / journal).
   * Stable id per kind so re-scheduling replaces the previous one.
   */
  async setDailyReminder(kind: 'water' | 'workout' | 'journal' | 'weight' | 'evening' | 'motivation', title: string, body: string, time?: string): Promise<void> {
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
