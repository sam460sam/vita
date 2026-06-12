// Geolocation — requested in-context (never at launch), degrades gracefully.
import { Capacitor } from '@capacitor/core';
import type { Geo } from '@/data/types';

/** Best-effort current position. Returns undefined if denied/unavailable. */
export async function currentGeo(): Promise<Geo | undefined> {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import('@capacitor/geolocation');
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions();
        if (req.location !== 'granted') return undefined;
      }
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 8000 });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
    }
    return await new Promise<Geo | undefined>((resolve) => {
      if (!navigator.geolocation) return resolve(undefined);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 8000 },
      );
    });
  } catch {
    return undefined;
  }
}

export function geoLabel(geo?: Geo): string {
  if (!geo) return '—';
  return `${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)}`;
}
