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
