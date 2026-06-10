// ============================================================================
// Apple Health (HealthKit) / Google Health Connect wrapper.
//
// Native (iOS/Android via Capacitor): backed by the `capacitor-health` plugin.
//   • connect()                → request read authorization
//   • importRecentWorkouts()   → pull HKWorkout/ExerciseSession into Vita
//   • todaySummary()           → today's active energy + steps (feeds the rings)
// Web/PWA: HealthKit isn't exposed to the browser, so everything degrades to a
// no-op and the UI shows an explanatory state.
//
// iOS native build requirements (done in the iOS project, see NATIVE.md):
//   • HealthKit capability + entitlement
//   • Info.plist: NSHealthShareUsageDescription / NSHealthUpdateUsageDescription
// ============================================================================
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Health, type HealthPermission } from 'capacitor-health';
import { db } from '@/data/db';
import { createWorkout } from '@/data/repo';
import { toSportId } from '@/features/attivita/importWorkouts';
import type { DataSource } from '@/data/types';

const platformName = Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
const isNative = Capacitor.isNativePlatform();
const STORAGE_KEY = 'vita.health.connected';

const READ_PERMISSIONS: HealthPermission[] = [
  'READ_WORKOUTS',
  'READ_ACTIVE_CALORIES',
  'READ_STEPS',
  'READ_DISTANCE',
  'READ_HEART_RATE',
];

export interface HealthStatus {
  available: boolean;
  authorized: boolean;
  provider: 'healthkit' | 'healthconnect' | null;
}

export interface HealthSummary {
  /** Active energy burned today (kcal) — Apple "Move". */
  activeKcal: number;
  /** Steps today. */
  steps: number;
  /** Exercise minutes today (sum of workout durations) — Apple "Exercise". */
  exerciseMin: number;
}

const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

function readFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export const health = {
  /** Synchronous best-effort status for first paint (true availability is async). */
  status(): HealthStatus {
    const provider = platformName === 'ios' ? 'healthkit' : platformName === 'android' ? 'healthconnect' : null;
    const available = provider !== null && isNative;
    return { available, authorized: available && readFlag(), provider };
  },

  source(): DataSource {
    return platformName === 'ios' ? 'healthkit' : platformName === 'android' ? 'healthconnect' : 'manual';
  },

  /** Request read authorization from HealthKit / Health Connect. */
  async connect(): Promise<boolean> {
    if (!isNative) return false;
    try {
      const { available } = await Health.isHealthAvailable();
      if (!available) return false;
      await Health.requestHealthPermissions({ permissions: READ_PERMISSIONS });
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      return true;
    } catch {
      return false;
    }
  },

  async disconnect(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  },

  /**
   * Import workouts from the last `days` days into Vita. De-dupes against
   * previously imported health workouts by start time. Returns the count added.
   */
  async importRecentWorkouts(days = 30): Promise<number> {
    if (!isNative || !readFlag()) return 0;
    try {
      const start = new Date();
      start.setDate(start.getDate() - days);
      const { workouts } = await Health.queryWorkouts({
        startDate: start.toISOString(),
        endDate: new Date().toISOString(),
        includeHeartRate: true,
        includeRoute: false,
        includeSteps: false,
      });

      // Existing start times in range (startedAt is indexed), to avoid duplicates.
      const existing = await db.workouts.where('startedAt').aboveOrEqual(start.getTime()).toArray();
      const seen = new Set(existing.map((w) => w.startedAt));

      let added = 0;
      for (const w of workouts) {
        const startedAt = Date.parse(w.startDate);
        if (!Number.isFinite(startedAt) || seen.has(startedAt)) continue;
        const hr = w.heartRate ?? [];
        const avgHr = hr.length ? Math.round(hr.reduce((s, p) => s + p.bpm, 0) / hr.length) : undefined;
        const maxHr = hr.length ? Math.max(...hr.map((p) => p.bpm)) : undefined;
        await createWorkout({
          sportId: toSportId(w.workoutType ?? ''),
          startedAt,
          durationSec: Math.round(w.duration || (Date.parse(w.endDate) - startedAt) / 1000),
          activeKcal: Math.round(w.calories || 0),
          distanceM: w.distance ? Math.round(w.distance) : undefined,
          avgHr,
          maxHr,
          source: this.source(),
        });
        seen.add(startedAt);
        added++;
      }
      return added;
    } catch {
      return 0;
    }
  },

  /** Today's active energy + steps from the health provider (null if unavailable). */
  async todaySummary(): Promise<HealthSummary | null> {
    if (!isNative || !readFlag()) return null;
    try {
      const startDate = startOfTodayISO();
      const endDate = new Date().toISOString();
      const sum = async (dataType: 'active-calories' | 'steps') => {
        const { aggregatedData } = await Health.queryAggregated({ startDate, endDate, dataType, bucket: 'day' });
        return aggregatedData.reduce((s, a) => s + (a.value || 0), 0);
      };
      const [activeKcal, steps] = await Promise.all([sum('active-calories'), sum('steps')]);

      // Apple "Exercise" minutes aren't exposed cross-platform; derive from today's workouts.
      const { workouts } = await Health.queryWorkouts({
        startDate,
        endDate,
        includeHeartRate: false,
        includeRoute: false,
        includeSteps: false,
      });
      const exerciseMin = Math.round(workouts.reduce((s, w) => s + (w.duration || 0), 0) / 60);

      return { activeKcal: Math.round(activeKcal), steps: Math.round(steps), exerciseMin };
    } catch {
      return null;
    }
  },
};

/**
 * Today's health summary as reactive state. Returns `null` until loaded or when
 * unavailable. Refreshes when the app returns to the foreground.
 */
export function useHealthSummary(): HealthSummary | null {
  const [summary, setSummary] = useState<HealthSummary | null>(null);

  useEffect(() => {
    if (!isNative) return;
    let alive = true;
    const load = () => {
      void health.todaySummary().then((s) => {
        if (alive) setSummary(s);
      });
    };
    load();
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return summary;
}
