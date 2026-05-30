// ============================================================================
// Platform abstraction (BUILD-SPEC §7) — wrappers over platform APIs.
// Today: web APIs. Tomorrow (Capacitor): swap implementations to @capacitor/*
// plugins WITHOUT touching any component. Components must call THESE, never
// navigator/window platform APIs directly.
// ============================================================================

export const platform = {
  isNative(): boolean {
    // Capacitor injects window.Capacitor; on web this is undefined.
    return typeof (globalThis as { Capacitor?: unknown }).Capacitor !== 'undefined';
  },

  /** Download a text file (backup export). Native: would use @capacitor/filesystem + share. */
  async saveTextFile(filename: string, contents: string, mime = 'application/json') {
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

  /** Pick a text file from disk (backup import). Native: @capacitor/filesystem. */
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

  /** Share text/content. Native: @capacitor/share. */
  async share(data: { title?: string; text?: string; url?: string }): Promise<boolean> {
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

  /** Light haptic feedback. Native: @capacitor/haptics. */
  haptic() {
    if ('vibrate' in navigator) navigator.vibrate?.(10);
  },
};
