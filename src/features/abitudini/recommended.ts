import type { TKey } from '@/i18n';
import type { Habit, HabitFrequency } from '@/data/types';

/** A starter habit the user can opt into during onboarding. */
export interface RecommendedHabit {
  id: string;
  labelKey: TKey;
  icon: string; // lucide icon name (informational)
  color: string;
  frequency: HabitFrequency;
}

// Luxury palette (desaturated, deep) — mapped per habit, still mutually
// distinguishable. Mirrors the habit-picker swatches.
export const RECOMMENDED_HABITS: RecommendedHabit[] = [
  { id: 'water', labelKey: 'rec.water', icon: 'Droplet', color: '#4E93A6', frequency: { type: 'daily' } },
  { id: 'nosmoke', labelKey: 'rec.nosmoke', icon: 'CigaretteOff', color: '#9B4A3C', frequency: { type: 'daily' } },
  { id: 'move', labelKey: 'rec.move', icon: 'Footprints', color: '#C2873F', frequency: { type: 'daily' } },
  { id: 'read', labelKey: 'rec.read', icon: 'BookOpen', color: '#3A4A7A', frequency: { type: 'daily' } },
  { id: 'meditate', labelKey: 'rec.meditate', icon: 'Brain', color: '#6A4673', frequency: { type: 'daily' } },
  { id: 'sleep', labelKey: 'rec.sleep', icon: 'Moon', color: '#3D5A82', frequency: { type: 'daily' } },
  { id: 'gym', labelKey: 'rec.gym', icon: 'Dumbbell', color: '#2E6B47', frequency: { type: 'times_per_week', timesPerWeek: 3 } },
  { id: 'stretch', labelKey: 'rec.stretch', icon: 'Activity', color: '#A05A78', frequency: { type: 'daily' } },
  { id: 'fruit', labelKey: 'rec.fruit', icon: 'Apple', color: '#3DA66F', frequency: { type: 'daily' } },
  { id: 'gratitude', labelKey: 'rec.gratitude', icon: 'PenLine', color: '#CFA85A', frequency: { type: 'daily' } },
  { id: 'sun', labelKey: 'rec.sun', icon: 'Sun', color: '#C2873F', frequency: { type: 'daily' } },
  { id: 'coffee', labelKey: 'rec.coffee', icon: 'Coffee', color: '#8A5A3C', frequency: { type: 'daily' } },
];

/** Lookup a recommended habit by its id. */
export const RECOMMENDED_BY_ID: Record<string, RecommendedHabit> = Object.fromEntries(
  RECOMMENDED_HABITS.map((r) => [r.id, r]),
);

/** Habit ids to surface first for each onboarding goal. */
const GOAL_PRIORITY: Record<string, string[]> = {
  feel_better: ['water', 'move', 'fruit', 'sleep', 'gym', 'stretch'],
  get_organized: ['read', 'gratitude', 'meditate', 'sleep', 'coffee'],
  reduce_stress: ['meditate', 'sleep', 'gratitude', 'stretch', 'sun'],
  build_consistency: ['water', 'read', 'move', 'meditate', 'gym'],
  reach_goal: ['gym', 'move', 'read', 'water', 'nosmoke'],
};

/** Recommended habits reordered to put the user's goal-relevant ones first. */
export function recommendedForGoal(goal?: string): RecommendedHabit[] {
  const pri = (goal && GOAL_PRIORITY[goal]) || [];
  if (!pri.length) return RECOMMENDED_HABITS;
  const rank = (id: string) => {
    const i = pri.indexOf(id);
    return i === -1 ? pri.length + 1 : i;
  };
  return [...RECOMMENDED_HABITS].sort((a, b) => rank(a.id) - rank(b.id));
}

/**
 * Display name for a habit. Built-in (recommended) habits carry a `recId` and
 * re-localize via the i18n key, so their name follows the app language. Habits
 * the user typed keep their literal name.
 */
export function habitDisplayName(habit: Pick<Habit, 'name' | 'recId'>, t: (k: TKey) => string): string {
  if (habit.recId) {
    const rec = RECOMMENDED_BY_ID[habit.recId];
    if (rec) return t(rec.labelKey);
  }
  return habit.name;
}

