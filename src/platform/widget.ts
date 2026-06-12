// ============================================================================
// Home/Lock-Screen widget bridge. The native WidgetKit extension can't read the
// app's IndexedDB, so we mirror the few values the widgets need into a shared
// App Group (via @capacitor/preferences `group`). The Swift widget reads the
// same suite/key. No-op on the web.
//
// Native setup (see WIDGETS.md): add a Widget Extension target + App Group
// "group.app.vita.lifeos" to both the app and the widget.
// ============================================================================
import { Capacitor } from '@capacitor/core';

export const WIDGET_APP_GROUP = 'group.app.vita.lifeos';
export const WIDGET_KEY = 'vyta_widget';
/** Widget → app channel: ml the user logged from the widget, pending apply. */
export const WIDGET_INBOX_KEY = 'vyta_widget_inbox';

export interface WidgetReminder {
  label: string;
  time: string; // HH:mm
}

export interface WidgetPayload {
  water: { ml: number; goalMl: number };
  reminders: WidgetReminder[];
  updatedAt: number;
}

let configured = false;

/** Mirror the latest water + reminders into the shared App Group for widgets. */
export async function syncWidgetData(data: Omit<WidgetPayload, 'updatedAt'>): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    if (!configured) {
      await Preferences.configure({ group: WIDGET_APP_GROUP });
      configured = true;
    }
    const payload: WidgetPayload = { ...data, updatedAt: Date.now() };
    await Preferences.set({ key: WIDGET_KEY, value: JSON.stringify(payload) });
  } catch {
    /* widgets unavailable */
  }
}

/**
 * Apply any water the user logged from the interactive widget (it accumulates
 * milliliters under WIDGET_INBOX_KEY). Call on app launch / foreground.
 * `addMl` should add to today's water total.
 */
export async function drainWidgetWaterInbox(addMl: (ml: number) => Promise<void>): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Preferences } = await import('@capacitor/preferences');
    if (!configured) {
      await Preferences.configure({ group: WIDGET_APP_GROUP });
      configured = true;
    }
    const { value } = await Preferences.get({ key: WIDGET_INBOX_KEY });
    const ml = value ? parseInt(value, 10) : 0;
    if (ml > 0) {
      await addMl(ml);
      await Preferences.remove({ key: WIDGET_INBOX_KEY });
    }
  } catch {
    /* noop */
  }
}
