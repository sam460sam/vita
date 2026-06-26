import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';

// "Drops" — the gamified virtual currency. Derived from real activity (no
// separate ledger needed): it climbs as you build habits, hydrate and train.
export const DROP_REWARDS = { habit: 5, waterGoalDay: 10, workout: 25 };

export function computeDrops(habitsDone: number, waterGoalDays: number, workouts: number): number {
  return habitsDone * DROP_REWARDS.habit + waterGoalDays * DROP_REWARDS.waterGoalDay + workouts * DROP_REWARDS.workout;
}

/** Reactive total Drops earned, derived from the user's data. */
export function useDrops(): number {
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);

  const goalMl = (settings ?? defaultSettings()).water.dailyGoalMl || 2000;
  const habitsDone = (logs ?? []).filter((l) => l.done).length;
  const waterGoalDays = (waters ?? []).filter((w) => w.ml >= goalMl).length;
  const workouts = (sessions ?? []).filter((s) => s.finishedAt).length;

  return computeDrops(habitsDone, waterGoalDays, workouts);
}
