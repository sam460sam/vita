// ============================================================================
// Home/Lock-Screen widget bridge. The native WidgetKit extension can't read the
// app's IndexedDB, so we mirror the few values the widgets need into a shared
// App Group (via @capacitor/preferences `group`). The Swift widget reads the
// same suite/key. No-op on the web.
//
// Native setup (see WIDGETS.md): add a Widget Extension target + App Group
// "group.app.vita.lifeos" to both the app and the widget.
// ============================================================================
import { Capacitor, registerPlugin } from '@capacitor/core';

export const WIDGET_APP_GROUP = 'group.app.vita.lifeos';
export const WIDGET_KEY = 'vyta_widget';
/** Widget → app channel: ml the user logged from the widget, pending apply. */
export const WIDGET_INBOX_KEY = 'vyta_widget_inbox';

/** Native bridge that reads/writes the real App Group suite (see WidgetBridge.swift).
 *  Required because @capacitor/preferences `group` does NOT use a UserDefaults
 *  suite — it prefixes the key in standard defaults, which the widget can't read. */
interface WidgetBridgePlugin {
  set(options: { key: string; value: string }): Promise<void>;
  get(options: { key: string }): Promise<{ value: string | null }>;
  remove(options: { key: string }): Promise<void>;
}
const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export interface WidgetReminder {
  label: string;
  time: string; // HH:mm
}

export interface WidgetTask {
  title: string;
  due?: string; // ISO yyyy-MM-dd
}

/** Per-day state used by the habit widgets: 0 = not scheduled, 1 = scheduled
 *  but not done, 2 = done. */
export interface WidgetHabit {
  name: string;
  color: string; // hex (or CSS var, ignored by the widget)
  week: number[]; // 7 values, Monday..Sunday of the current week
  heat: number[]; // last 49 days, oldest→newest (heatmap)
}

export interface WidgetPayload {
  water: { ml: number; goalMl: number; glassMl: number };
  reminders: WidgetReminder[];
  tasks: WidgetTask[];
  habits: WidgetHabit[];
  /** Daily cross-life Momentum score (0–100) + a short message. */
  momentum?: { score: number; message: string };
  updatedAt: number;
}

/** Write a value into the shared App Group via the native bridge (real suite).
 *  Falls back to @capacitor/preferences so older builds don't crash. */
async function appGroupSet(key: string, value: string): Promise<void> {
  try {
    await WidgetBridge.set({ key, value });
    return;
  } catch {
    /* bridge not present — fall back (won't reach the widget, but harmless) */
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.configure({ group: WIDGET_APP_GROUP });
    await Preferences.set({ key, value });
  } catch {
    /* widgets unavailable */
  }
}

/** Read a value from the shared App Group via the native bridge. */
async function appGroupGet(key: string): Promise<string | null> {
  try {
    const { value } = await WidgetBridge.get({ key });
    return value ?? null;
  } catch {
    /* fall through */
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.configure({ group: WIDGET_APP_GROUP });
    const { value } = await Preferences.get({ key });
    return value ?? null;
  } catch {
    return null;
  }
}

/** Remove a value from the shared App Group via the native bridge. */
async function appGroupRemove(key: string): Promise<void> {
  try {
    await WidgetBridge.remove({ key });
    return;
  } catch {
    /* fall through */
  }
  try {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.configure({ group: WIDGET_APP_GROUP });
    await Preferences.remove({ key });
  } catch {
    /* noop */
  }
}

/** Mirror the latest water + reminders into the shared App Group for widgets. */
export async function syncWidgetData(data: Omit<WidgetPayload, 'updatedAt'>): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const payload: WidgetPayload = { ...data, updatedAt: Date.now() };
  await appGroupSet(WIDGET_KEY, JSON.stringify(payload));
}

/**
 * Apply any water the user logged from the interactive widget (it accumulates
 * milliliters under WIDGET_INBOX_KEY). Call on app launch / foreground.
 * `addMl` should add to today's water total.
 */
export async function drainWidgetWaterInbox(addMl: (ml: number) => Promise<void>): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const value = await appGroupGet(WIDGET_INBOX_KEY);
    const ml = value ? parseInt(value, 10) : 0;
    if (ml > 0) {
      await addMl(ml);
      await appGroupRemove(WIDGET_INBOX_KEY);
    }
  } catch {
    /* noop */
  }
}
