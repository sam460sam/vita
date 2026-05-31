// ============================================================================
// Apple Health / Google Health Connect wrapper.
// Web/PWA: NOT available (Apple does not expose HealthKit to web). Returns
// `available=false` so the UI shows an explanatory state.
// Native (Capacitor, future): wire a HealthKit plugin (iOS) / Health Connect
// (Android) here. Imported workouts/steps/heart-rate get the proper
// `source: 'healthkit' | 'healthconnect'` already supported by the data model.
//
// To enable on iOS later (in the native build):
//   1) npm i <a capacitor healthkit plugin>  (e.g. @perfood/capacitor-healthkit)
//   2) Add HealthKit capability + usage strings in Xcode
//   3) Implement requestAuthorization() and the read* methods below using it
// No UI changes needed — components already call THIS module.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { createWorkout } from '@/data/repo';
import type { DataSource } from '@/data/types';

const platformName = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'

export interface HealthStatus {
  /** Is a health provider available on this platform at all? */
  available: boolean;
  /** Has the user granted read permission? */
  authorized: boolean;
  provider: 'healthkit' | 'healthconnect' | null;
}

const STORAGE_KEY = 'vita.health.connected';

export const health = {
  status(): HealthStatus {
    const provider = platformName === 'ios' ? 'healthkit' : platformName === 'android' ? 'healthconnect' : null;
    const available = provider !== null && Capacitor.isNativePlatform();
    let authorized = false;
    try {
      authorized = localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* ignore */
    }
    return { available, authorized: available && authorized, provider };
  },

  source(): DataSource {
    return platformName === 'ios' ? 'healthkit' : platformName === 'android' ? 'healthconnect' : 'manual';
  },

  /**
   * Request authorization to read health data.
   * Native: would call the HealthKit/Health Connect plugin. Until the plugin is
   * wired in the native build, this resolves false on web (no provider).
   */
  async connect(): Promise<boolean> {
    const { available } = this.status();
    if (!available) return false;
    // TODO(native): call plugin requestAuthorization() here.
    // Placeholder: mark as connected so the rest of the flow is testable.
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    return true;
  },

  async disconnect(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },

  /**
   * Import recent workouts from the health provider into Vita.
   * Native: read HKWorkout / Health Connect ExerciseSession and map them to
   * createWorkout({ ..., source: this.source() }). Returns the number imported.
   */
  async importRecentWorkouts(): Promise<number> {
    const { authorized } = this.status();
    if (!authorized) return 0;
    // TODO(native): fetch from plugin and persist. Example shape:
    // for (const w of fetched) {
    //   await createWorkout({ sportId: mapType(w.type), startedAt: w.start,
    //     durationSec: w.duration, activeKcal: w.kcal, distanceM: w.distance,
    //     avgHr: w.avgHr, maxHr: w.maxHr, source: this.source() });
    // }
    void createWorkout; // referenced for the native implementation
    return 0;
  },
};
