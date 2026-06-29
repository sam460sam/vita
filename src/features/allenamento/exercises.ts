import type { ExerciseDef, Equipment, MuscleGroup } from '@/data/types';

// Bundled exercise library — offline, no network. Names in IT + EN; everything
// else (es/fr/de) falls back to the English name.
export const EXERCISES: ExerciseDef[] = [
  // Chest
  { id: 'bench_press', name: 'Panca piana', nameEn: 'Bench Press', muscle: 'chest', equipment: ['barbell'] },
  { id: 'db_bench', name: 'Panca con manubri', nameEn: 'Dumbbell Bench Press', muscle: 'chest', equipment: ['dumbbell'] },
  { id: 'pushup', name: 'Piegamenti', nameEn: 'Push-up', muscle: 'chest', equipment: ['bodyweight'] },
  { id: 'db_fly', name: 'Croci con manubri', nameEn: 'Dumbbell Fly', muscle: 'chest', equipment: ['dumbbell'] },
  { id: 'band_chest_press', name: 'Spinte con elastico', nameEn: 'Band Chest Press', muscle: 'chest', equipment: ['band'] },
  // Back
  { id: 'pullup', name: 'Trazioni', nameEn: 'Pull-up', muscle: 'back', equipment: ['pullupbar'] },
  { id: 'db_row', name: 'Rematore con manubrio', nameEn: 'Dumbbell Row', muscle: 'back', equipment: ['dumbbell'] },
  { id: 'barbell_row', name: 'Rematore con bilanciere', nameEn: 'Barbell Row', muscle: 'back', equipment: ['barbell'] },
  { id: 'band_row', name: 'Rematore con elastico', nameEn: 'Band Row', muscle: 'back', equipment: ['band'] },
  { id: 'deadlift', name: 'Stacco da terra', nameEn: 'Deadlift', muscle: 'back', equipment: ['barbell'] },
  // Legs
  { id: 'squat', name: 'Squat', nameEn: 'Squat', muscle: 'legs', equipment: ['barbell'] },
  { id: 'goblet_squat', name: 'Goblet squat', nameEn: 'Goblet Squat', muscle: 'legs', equipment: ['dumbbell', 'kettlebell'] },
  { id: 'lunge', name: 'Affondi', nameEn: 'Lunge', muscle: 'legs', equipment: ['dumbbell', 'bodyweight'] },
  { id: 'bw_squat', name: 'Squat a corpo libero', nameEn: 'Bodyweight Squat', muscle: 'legs', equipment: ['bodyweight'] },
  { id: 'rdl', name: 'Stacco rumeno', nameEn: 'Romanian Deadlift', muscle: 'legs', equipment: ['dumbbell', 'barbell'] },
  { id: 'calf_raise', name: 'Calf raise', nameEn: 'Calf Raise', muscle: 'legs', equipment: ['bodyweight', 'dumbbell'] },
  { id: 'band_leg_press', name: 'Leg press con elastico', nameEn: 'Band Leg Press', muscle: 'legs', equipment: ['band'] },
  { id: 'glute_bridge', name: 'Ponte glutei', nameEn: 'Glute Bridge', muscle: 'legs', equipment: ['bodyweight', 'band'] },
  // Shoulders
  { id: 'ohp', name: 'Lento avanti', nameEn: 'Overhead Press', muscle: 'shoulders', equipment: ['barbell', 'dumbbell'] },
  { id: 'lat_raise', name: 'Alzate laterali', nameEn: 'Lateral Raise', muscle: 'shoulders', equipment: ['dumbbell', 'band'] },
  { id: 'db_shoulder_press', name: 'Spinte sopra la testa', nameEn: 'Dumbbell Shoulder Press', muscle: 'shoulders', equipment: ['dumbbell'] },
  { id: 'band_face_pull', name: 'Face pull con elastico', nameEn: 'Band Face Pull', muscle: 'shoulders', equipment: ['band'] },
  // Arms
  { id: 'db_curl', name: 'Curl con manubri', nameEn: 'Dumbbell Curl', muscle: 'arms', equipment: ['dumbbell'] },
  { id: 'band_curl', name: 'Curl con elastico', nameEn: 'Band Curl', muscle: 'arms', equipment: ['band'] },
  { id: 'tricep_dip', name: 'Dip per tricipiti', nameEn: 'Tricep Dip', muscle: 'arms', equipment: ['bodyweight'] },
  { id: 'tricep_ext', name: 'Estensioni tricipiti', nameEn: 'Tricep Extension', muscle: 'arms', equipment: ['dumbbell', 'band'] },
  { id: 'hammer_curl', name: 'Hammer curl', nameEn: 'Hammer Curl', muscle: 'arms', equipment: ['dumbbell'] },
  // Core
  { id: 'plank', name: 'Plank', nameEn: 'Plank', muscle: 'core', equipment: ['bodyweight'] },
  { id: 'crunch', name: 'Crunch', nameEn: 'Crunch', muscle: 'core', equipment: ['bodyweight'] },
  { id: 'leg_raise', name: 'Sollevamento gambe', nameEn: 'Leg Raise', muscle: 'core', equipment: ['bodyweight'] },
  { id: 'russian_twist', name: 'Russian twist', nameEn: 'Russian Twist', muscle: 'core', equipment: ['bodyweight', 'dumbbell'] },
  { id: 'mountain_climber', name: 'Mountain climber', nameEn: 'Mountain Climber', muscle: 'core', equipment: ['bodyweight'] },
  // Full body
  { id: 'burpee', name: 'Burpees', nameEn: 'Burpee', muscle: 'fullbody', equipment: ['bodyweight'] },
  { id: 'kb_swing', name: 'Kettlebell swing', nameEn: 'Kettlebell Swing', muscle: 'fullbody', equipment: ['kettlebell'] },
  { id: 'thruster', name: 'Thruster', nameEn: 'Thruster', muscle: 'fullbody', equipment: ['dumbbell', 'barbell'] },
];

export const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'fullbody'];
export const EQUIPMENT_LIST: Equipment[] = ['bodyweight', 'dumbbell', 'barbell', 'band', 'kettlebell', 'machine', 'pullupbar'];

export const EXERCISE_BY_ID: Record<string, ExerciseDef> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));

/** Localized exercise name (IT uses `name`, everything else falls back to EN). */
export function exerciseName(def: { name: string; nameEn: string }, lang: string): string {
  return lang === 'it' ? def.name : def.nameEn;
}
