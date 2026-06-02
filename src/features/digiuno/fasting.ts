// ============================================================================
// Intermittent fasting — a lightweight local timer. The active fast and a short
// history live in localStorage (no DB migration needed). All offline, like the
// rest of Vita.
// ============================================================================
export interface ActiveFast {
  startedAt: number; // epoch ms
  goalHours: number;
}

export interface FastRecord {
  startedAt: number;
  endedAt: number;
  goalHours: number;
}

const ACTIVE_KEY = 'vita.fasting.active';
const HISTORY_KEY = 'vita.fasting.history';

/** Common intermittent-fasting protocols (fasting-window hours). */
export const FAST_PRESETS = [13, 14, 16, 18, 20, 24];
export const DEFAULT_GOAL = 16;

export function getActiveFast(): ActiveFast | null {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? (JSON.parse(raw) as ActiveFast) : null;
  } catch {
    return null;
  }
}

export function startFast(goalHours = DEFAULT_GOAL, startedAt = Date.now()): ActiveFast {
  const fast: ActiveFast = { startedAt, goalHours };
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(fast));
  } catch {
    /* ignore */
  }
  return fast;
}

/** Stop the active fast, recording it in history. Returns the elapsed hours. */
export function stopFast(): number {
  const active = getActiveFast();
  if (!active) return 0;
  const endedAt = Date.now();
  try {
    localStorage.removeItem(ACTIVE_KEY);
    const hist = getHistory();
    hist.unshift({ startedAt: active.startedAt, endedAt, goalHours: active.goalHours });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 30)));
  } catch {
    /* ignore */
  }
  return (endedAt - active.startedAt) / 3_600_000;
}

export function getHistory(): FastRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as FastRecord[]) : [];
  } catch {
    return [];
  }
}

/** Elapsed milliseconds for an active fast. */
export function elapsedMs(fast: ActiveFast, nowMs = Date.now()): number {
  return Math.max(0, nowMs - fast.startedAt);
}

/** "13h 25m" style formatter for a fasting duration. */
export function formatFastElapsed(ms: number): { h: number; m: number; s: number } {
  const total = Math.floor(ms / 1000);
  return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}
