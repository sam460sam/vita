import type { ExerciseDef, Equipment, MuscleGroup, WorkoutEntry } from '@/data/types';
import { newWorkoutEntry } from '@/data/repo';
import { EXERCISES, EXERCISE_BY_ID, exerciseName } from './exercises';

export interface GeneratedItem {
  def: ExerciseDef;
  sets: number;
  reps: number;
}

// Compound, multi-joint lifts are prioritized first in a generated session.
const COMPOUND = new Set(['squat', 'deadlift', 'bench_press', 'db_bench', 'barbell_row', 'db_row', 'ohp', 'pullup', 'goblet_squat', 'rdl', 'thruster', 'kb_swing']);

/** Which equipment is actually usable: bodyweight is always available. */
function usable(e: ExerciseDef, equipment: Equipment[]): boolean {
  return e.equipment.includes('bodyweight') || e.equipment.some((eq) => equipment.includes(eq));
}

function suggestSetsReps(e: ExerciseDef): { sets: number; reps: number } {
  if (COMPOUND.has(e.id)) return { sets: 4, reps: 8 };
  if (e.muscle === 'core') return { sets: 3, reps: 15 };
  if (e.muscle === 'legs') return { sets: 3, reps: 12 };
  return { sets: 3, reps: 12 };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a balanced workout from the exercise library, using only the available
 * equipment and spreading the count across the chosen muscle groups. Compounds
 * come first. Pure, offline, deterministic-ish (randomized order for variety).
 */
export function generateWorkout(opts: { muscles: MuscleGroup[]; equipment: Equipment[]; count: number }): GeneratedItem[] {
  const muscles = opts.muscles.length ? opts.muscles : (['fullbody'] as MuscleGroup[]);
  const pool = EXERCISES.filter((e) => usable(e, opts.equipment) && (muscles.includes(e.muscle) || (muscles.includes('fullbody') && e.muscle === 'fullbody')));

  // Group the pool by muscle, compounds first within each group.
  const byMuscle = new Map<MuscleGroup, ExerciseDef[]>();
  for (const m of muscles) byMuscle.set(m, []);
  for (const e of pool) {
    if (!byMuscle.has(e.muscle)) byMuscle.set(e.muscle, []);
    byMuscle.get(e.muscle)!.push(e);
  }
  for (const [m, list] of byMuscle) {
    byMuscle.set(m, shuffle(list).sort((a, b) => Number(COMPOUND.has(b.id)) - Number(COMPOUND.has(a.id))));
  }

  // Round-robin across the chosen muscles until we reach the count.
  const chosen: ExerciseDef[] = [];
  const used = new Set<string>();
  const order = muscles.filter((m) => (byMuscle.get(m)?.length ?? 0) > 0);
  let guard = 0;
  while (chosen.length < opts.count && order.length && guard < 200) {
    guard++;
    for (const m of order) {
      const list = byMuscle.get(m)!;
      const next = list.find((e) => !used.has(e.id));
      if (next) {
        used.add(next.id);
        chosen.push(next);
        if (chosen.length >= opts.count) break;
      }
    }
    // If nothing new could be added in a full pass, stop.
    if (order.every((m) => byMuscle.get(m)!.every((e) => used.has(e.id)))) break;
  }

  return chosen.map((def) => ({ def, ...suggestSetsReps(def) }));
}

// ---------------------------------------------------------------------------
// Starter templates — preset sessions. Each maps to library exercise ids; on
// use we drop any the user can't perform with their equipment.
// ---------------------------------------------------------------------------
export interface WorkoutTemplate {
  id: string;
  emoji: string;
  nameKey: string; // i18n key
  exerciseIds: string[];
}

export const TEMPLATES: WorkoutTemplate[] = [
  { id: 'fullbody', emoji: '🔥', nameKey: 'workout.tpl.fullbody', exerciseIds: ['goblet_squat', 'pushup', 'db_row', 'ohp', 'plank', 'lunge'] },
  { id: 'push', emoji: '💪', nameKey: 'workout.tpl.push', exerciseIds: ['db_bench', 'ohp', 'db_shoulder_press', 'lat_raise', 'tricep_ext', 'pushup'] },
  { id: 'pull', emoji: '🪢', nameKey: 'workout.tpl.pull', exerciseIds: ['pullup', 'db_row', 'band_row', 'db_curl', 'hammer_curl', 'band_face_pull'] },
  { id: 'legs', emoji: '🦵', nameKey: 'workout.tpl.legs', exerciseIds: ['squat', 'rdl', 'lunge', 'glute_bridge', 'calf_raise', 'bw_squat'] },
  { id: 'core', emoji: '🧱', nameKey: 'workout.tpl.core', exerciseIds: ['plank', 'crunch', 'leg_raise', 'russian_twist', 'mountain_climber'] },
  { id: 'home', emoji: '🏠', nameKey: 'workout.tpl.home', exerciseIds: ['bw_squat', 'pushup', 'band_row', 'band_curl', 'glute_bridge', 'plank'] },
];

export function templateItems(tpl: WorkoutTemplate, equipment: Equipment[]): GeneratedItem[] {
  return tpl.exerciseIds
    .map((id) => EXERCISE_BY_ID[id])
    .filter((e): e is ExerciseDef => !!e && usable(e, equipment))
    .map((def) => ({ def, ...suggestSetsReps(def) }));
}

/** Turn generated/template items into workout entries (localized names, N sets). */
export function itemsToEntries(items: GeneratedItem[], lang: string): WorkoutEntry[] {
  return items.map((it) => {
    const entry = newWorkoutEntry(it.def.id, exerciseName(it.def, lang), it.def.muscle);
    entry.sets = Array.from({ length: it.sets }, () => ({ reps: it.reps, weightKg: 0, done: false }));
    return entry;
  });
}
