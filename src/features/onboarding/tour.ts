// First-run interactive tour state (offline-safe localStorage flags).
// One flag per page-scoped tutorial: Home, Workout, Habits.
export type TourId = 'home' | 'workout' | 'habits';

const KEYS: Record<TourId, string> = {
  home: 'vita.tour.done',
  workout: 'vita.tour.workout.done',
  habits: 'vita.tour.habits.done',
};

/** Fired to (re)start the Home tour immediately (e.g. from Settings replay). */
export const TOUR_START_EVENT = 'vita:tour-start';

export function isTourDone(id: TourId = 'home'): boolean {
  try { return localStorage.getItem(KEYS[id]) === '1'; } catch { return true; }
}
export function markTourDone(id: TourId = 'home') {
  try { localStorage.setItem(KEYS[id], '1'); } catch { /* ignore */ }
}

/** Settings → "Replay tutorials": clear EVERY page flag so each tour
 *  re-triggers on its next visit, and kick the Home tour right away. */
export function replayTour() {
  try {
    (Object.keys(KEYS) as TourId[]).forEach((id) => localStorage.removeItem(KEYS[id]));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event(TOUR_START_EVENT));
}
