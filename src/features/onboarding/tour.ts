// First-run interactive tour state (offline-safe localStorage flag).
const KEY = 'vita.tour.done';
export const TOUR_START_EVENT = 'vita:tour-start';

export function isTourDone(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return true; }
}
export function markTourDone() {
  try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
}
/** Settings → "Replay tutorial": clear the flag and ask the Home to start. */
export function replayTour() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  window.dispatchEvent(new Event(TOUR_START_EVENT));
}
