// ============================================================================
// Platform abstraction — the single place that wraps platform APIs. On the web
// it uses browser APIs; inside a Capacitor native app it uses @capacitor/*.
// Components call THESE, never navigator/Capacitor plugins directly.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const isNative = Capacitor.isNativePlatform();

export const platform = {
  isNative(): boolean {
    return isNative;
  },
  platformName(): string {
    return Capacitor.getPlatform();
  },

  /** Save a text file (collection export). */
  async saveTextFile(filename: string, contents: string, mime = 'application/json') {
    if (isNative) {
      const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem').catch(() => ({} as never));
      if (Filesystem) {
        const res = await Filesystem.writeFile({
          path: filename,
          data: contents,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
          recursive: true,
        });
        try {
          await Share.share({ title: filename, url: res.uri });
        } catch {
          /* dismissed */
        }
        return;
      }
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

  /** Share text/url via the native share sheet (web: Web Share API). */
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

  /** Share an image blob (the shareable result card). */
  async shareImage(blob: Blob, filename: string, text?: string): Promise<boolean> {
    // Native: write to cache, then share the file URI (works for images).
    if (isNative) {
      try {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const base64 = await blobToBase64(blob);
        const res = await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Cache,
          recursive: true,
        });
        await Share.share({ text, url: res.uri });
        return true;
      } catch {
        /* fall through to web path */
      }
    }
    const file = new File([blob], filename, { type: 'image/png' });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], text });
        return true;
      } catch {
        return false;
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  },

  async persistStorage(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.storage?.persist) return false;
      if (await navigator.storage.persisted()) return true;
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  },

  haptic(style: 'light' | 'medium' | 'success' = 'light') {
    if (isNative) {
      if (style === 'success') void Haptics.notification({ type: NotificationType.Success });
      else void Haptics.impact({ style: style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light });
      return;
    }
    if ('vibrate' in navigator) navigator.vibrate?.(style === 'medium' ? 18 : 10);
  },
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
