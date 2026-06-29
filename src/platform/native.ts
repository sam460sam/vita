// ============================================================================
// Native bootstrap — only runs inside a Capacitor app. On the web every call
// is a no-op, so it is safe to invoke unconditionally at startup.
// ============================================================================
import { Capacitor } from '@capacitor/core';

/** Sync the native status bar to the active theme. Day (light bg) → dark
 *  icons (Style.Light); Night (dark bg) → light icons (Style.Dark). */
export async function setStatusBarStyle(resolved: 'light' | 'dark'): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: resolved === 'dark' ? Style.Dark : Style.Light });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: resolved === 'dark' ? '#0b0e0c' : '#ede7da' });
    }
  } catch {
    /* status bar plugin unavailable */
  }
}

export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  // Light status bar to match the white design system.
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light }); // dark text on light bg
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
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

  // Android hardware back button: navigate back, exit app at history root.
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch {
    /* app plugin unavailable */
  }
}
