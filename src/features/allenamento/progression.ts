import type { WorkoutSession } from '@/data/types';

export interface LastStat {
  weightKg: number;
  reps: number;
  /** Whether every set was completed last time (drives progression). */
  allDone: boolean;
}

/** The top set of the most recent finished session that included this exercise. */
export function lastStatFor(sessions: WorkoutSession[], exerciseId: string): LastStat | null {
  const finished = sessions.filter((s) => s.finishedAt).sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  for (const s of finished) {
    const e = s.entries.find((x) => x.exerciseId === exerciseId && x.sets.length > 0);
    if (!e) continue;
    let best = e.sets[0];
    for (const set of e.sets) {
      if (set.weightKg > best.weightKg || (set.weightKg === best.weightKg && set.reps > best.reps)) best = set;
    }
    if (best.weightKg <= 0 && best.reps <= 0) continue;
    return { weightKg: best.weightKg, reps: best.reps, allDone: e.sets.every((x) => x.done) };
  }
  return null;
}

/**
 * Suggested next weight (kg): nudge up only if you completed everything last
 * time — small step for lighter lifts, a bigger one for heavier/compound work.
 * Returns 0 for bodyweight (no weight to suggest).
 */
export function suggestNextWeight(last: LastStat): number {
  if (last.weightKg <= 0) return 0;
  if (!last.allDone) return last.weightKg; // unfinished → repeat the same load
  const step = last.weightKg >= 40 ? 5 : 2.5;
  return last.weightKg + step;
}

/** Bodyweight progression: one more rep if you completed everything last time. */
export function suggestNextReps(last: LastStat): number {
  if (last.weightKg > 0) return 0; // weighted lifts progress by load, not reps
  return last.allDone ? last.reps + 1 : last.reps;
}

function epley(w: number, reps: number): number {
  return w * (1 + reps / 30);
}
function setMetric(weightKg: number, reps: number): number {
  return weightKg > 0 ? epley(weightKg, reps) : reps;
}

/** Best metric for an exercise across past finished sessions (excluding one). */
export function prevBestMetric(sessions: WorkoutSession[], exerciseId: string, excludeSessionId: string): number {
  let best = 0;
  for (const s of sessions) {
    if (!s.finishedAt || s.id === excludeSessionId) continue;
    const e = s.entries.find((x) => x.exerciseId === exerciseId);
    if (!e) continue;
    for (const set of e.sets) best = Math.max(best, setMetric(set.weightKg, set.reps));
  }
  return best;
}

/** Best metric among the *completed* sets of the current entry. */
export function currentBestMetric(entry: { sets: { weightKg: number; reps: number; done: boolean }[] }): number {
  let best = 0;
  for (const set of entry.sets) if (set.done) best = Math.max(best, setMetric(set.weightKg, set.reps));
  return best;
}
