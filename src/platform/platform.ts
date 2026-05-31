// ============================================================================
// Platform abstraction (BUILD-SPEC §7) — single place that wraps platform APIs.
// On the web it uses browser APIs; inside a Capacitor native app it uses the
// @capacitor/* plugins. Components must call THESE, never navigator/window or
// Capacitor plugins directly.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();

export const platform = {
  isNative(): boolean {
    return isNative;
  },

  platformName(): string {
    return Capacitor.getPlatform(); // 'web' | 'ios' | 'android'
  },

  /**
   * Save a text file (backup export).
   * Web: triggers a browser download.
   * Native: writes to the app's Documents dir, then opens the share sheet so
   * the user can save it to Files/Drive/etc.
   */
  async saveTextFile(filename: string, contents: string, mime = 'application/json') {
    if (isNative) {
      const res = await Filesystem.writeFile({
        path: filename,
        data: contents,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
      try {
        await Share.share({ title: filename, url: res.uri });
      } catch {
        /* user dismissed share sheet — file is still saved in Documents */
      }
      return;
    }
    const blob = new Blob([contents], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  /**
   * Pick a text file from disk (backup import).
   * Web: hidden <input type=file>.
   * Native: same input works inside the WebView (opens the system picker).
   */
  async pickTextFile(accept = 'application/json'): Promise<string | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        resolve(await file.text());
      };
      input.click();
    });
  },

  /** Share text/content via the native share sheet (web: Web Share API). */
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (isNative) {
      try {
        await Share.share(data);
        return true;
      } catch {
        return false;
      }
    }
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  /** Light haptic feedback. Native: @capacitor/haptics. Web: vibration API. */
  haptic() {
    if (isNative) {
      void Haptics.impact({ style: ImpactStyle.Light });
      return;
    }
    if ('vibrate' in navigator) navigator.vibrate?.(10);
  },
};
