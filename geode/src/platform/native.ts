// ============================================================================
// Native bootstrap — only runs inside a Capacitor app; no-op on the web.
// ============================================================================
import { Capacitor } from '@capacitor/core';

export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Dark status bar to match the dark-first design.
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark }); // light text on dark bg
  } catch {
    /* status bar plugin unavailable */
  }

  // Hide the splash once the web app is ready.
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* splash plugin unavailable */
  }

  // Hardware back button (no-op on iOS, useful if you add Android later).
  // Deep links — the Widget / App Intent open `geode://scan` to jump straight
  // into the scan flow (BUILD-SPEC §2.11). We re-dispatch as a window event the
  // React app listens for.
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
    App.addListener('appUrlOpen', ({ url }) => {
      if (url && url.includes('scan')) {
        window.dispatchEvent(new CustomEvent('geode:deeplink', { detail: 'scan' }));
      }
    });
  } catch {
    /* app plugin unavailable */
  }
}
