// ============================================================================
// Local notifications — opt-in care reminders ("cleanse/recharge your
// crystals") and an optional daily "Stone of the Day" nudge (BUILD-SPEC §2.8).
// Native only; web is a no-op (the preference is still stored).
// ============================================================================
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

const ID_CARE = 9001;
const ID_STONE_OF_DAY = 9002;

export const notifications = {
  supported(): boolean {
    return isNative;
  },

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

  /** Weekly "cleanse & recharge your crystals" reminder at HH:mm (Sunday). */
  async setCareReminder(enabled: boolean, time = '10:00'): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: ID_CARE }] });
      if (!enabled) return;
      const [hh, mm] = time.split(':').map(Number);
      await LocalNotifications.schedule({
        notifications: [
          {
            id: ID_CARE,
            title: 'Geode',
            body: 'Time to cleanse & recharge your crystals ✨',
            schedule: { on: { weekday: 1, hour: hh, minute: mm }, repeats: true },
          },
        ],
      });
    } catch {
      /* unavailable */
    }
  },

  /** Daily "Stone of the Day" nudge at 09:00. */
  async setStoneOfDay(enabled: boolean): Promise<void> {
    if (!isNative) return;
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.cancel({ notifications: [{ id: ID_STONE_OF_DAY }] });
      if (!enabled) return;
      await LocalNotifications.schedule({
        notifications: [
          {
            id: ID_STONE_OF_DAY,
            title: 'Stone of the Day',
            body: 'A new crystal is waiting in Geode 🔮',
            schedule: { on: { hour: 9, minute: 0 }, repeats: true },
          },
        ],
      });
    } catch {
      /* unavailable */
    }
  },
};
