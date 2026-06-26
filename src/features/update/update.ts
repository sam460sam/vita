// ============================================================================
// App-update check. The App Store already notifies/auto-updates users, but this
// adds a gentle in-app "Update available" banner. It asks the public iTunes
// Lookup API for the latest published version (only the bundle id leaves the
// device — no user data, so the app stays "Data Not Collected") and compares it
// with the installed version. Native iOS only; a silent no-op on web/offline.
// ============================================================================
import { useEffect, useState } from 'react';
import { Capacitor, CapacitorHttp } from '@capacitor/core';
import { App } from '@capacitor/app';

const BUNDLE_ID = 'app.vita.lifeos';
const LAST_CHECK_KEY = 'vita.update.lastCheck';
const STORE_VER_KEY = 'vita.update.storeVersion';
const DISMISS_KEY = 'vita.update.dismissed';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // at most once a day

/** Compare dotted numeric versions: true if `a` is strictly newer than `b`. */
export function isNewerVersion(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return true;
    if (x < y) return false;
  }
  return false;
}

/** Latest published App Store version, or null (offline / unavailable). */
async function fetchStoreVersion(): Promise<string | null> {
  try {
    const res = await CapacitorHttp.get({
      url: `https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}`,
      connectTimeout: 8000,
      readTimeout: 8000,
    });
    const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
    const v = data?.results?.[0]?.version;
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Reactive hook: returns the App Store version string when a newer, non-dismissed
 * version is available, else null. Throttled to one network check per day; the
 * last result is cached so the banner can show instantly on later launches.
 */
export function useAppUpdate(): { storeVersion: string | null; dismiss: () => void } {
  const [storeVersion, setStoreVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cancelled = false;

    void (async () => {
      try {
        let store = localStorage.getItem(STORE_VER_KEY);
        const last = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
        if (Date.now() - last > CHECK_INTERVAL_MS) {
          const fetched = await fetchStoreVersion();
          if (fetched) {
            store = fetched;
            try { localStorage.setItem(STORE_VER_KEY, fetched); } catch { /* ignore */ }
          }
          try { localStorage.setItem(LAST_CHECK_KEY, String(Date.now())); } catch { /* ignore */ }
        }
        if (!store || cancelled) return;

        const info = await App.getInfo();
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (isNewerVersion(store, info.version) && dismissed !== store) {
          setStoreVersion(store);
        }
      } catch {
        /* offline / unavailable — stay silent */
      }
    })();

    return () => { cancelled = true; };
  }, []);

  function dismiss() {
    if (storeVersion) {
      try { localStorage.setItem(DISMISS_KEY, storeVersion); } catch { /* ignore */ }
    }
    setStoreVersion(null);
  }

  return { storeVersion, dismiss };
}
