// Native bootstrap — only runs inside a Capacitor app; no-op on web.
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();

export function deviceModel(): string {
  // Lightweight, synchronous best-effort for the signature audit trail.
  const p = Capacitor.getPlatform();
  return p === 'web' ? `Web · ${navigator.userAgent.slice(0, 60)}` : p;
}

export async function initNative(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Dark }); // light text on dark (asphalt) bg
  } catch {
    /* unavailable */
  }
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch {
    /* unavailable */
  }
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else App.exitApp();
    });
  } catch {
    /* unavailable */
  }
}
