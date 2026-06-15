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

export const RECOMMENDED_HABITS: RecommendedHabit[] = [
  { id: 'water', labelKey: 'rec.water', icon: 'Droplet', color: '#0EA5E9', frequency: { type: 'daily' } },
  { id: 'nosmoke', labelKey: 'rec.nosmoke', icon: 'CigaretteOff', color: '#EF4444', frequency: { type: 'daily' } },
  { id: 'move', labelKey: 'rec.move', icon: 'Footprints', color: '#FF6B57', frequency: { type: 'daily' } },
  { id: 'read', labelKey: 'rec.read', icon: 'BookOpen', color: '#F59E0B', frequency: { type: 'daily' } },
  { id: 'meditate', labelKey: 'rec.meditate', icon: 'Brain', color: '#7C3AED', frequency: { type: 'daily' } },
  { id: 'sleep', labelKey: 'rec.sleep', icon: 'Moon', color: '#4F46E5', frequency: { type: 'daily' } },
  { id: 'gym', labelKey: 'rec.gym', icon: 'Dumbbell', color: '#10B981', frequency: { type: 'times_per_week', timesPerWeek: 3 } },
  { id: 'stretch', labelKey: 'rec.stretch', icon: 'Activity', color: '#EC4899', frequency: { type: 'daily' } },
  { id: 'fruit', labelKey: 'rec.fruit', icon: 'Apple', color: '#22C55E', frequency: { type: 'daily' } },
  { id: 'gratitude', labelKey: 'rec.gratitude', icon: 'PenLine', color: '#F59E0B', frequency: { type: 'daily' } },
  { id: 'sun', labelKey: 'rec.sun', icon: 'Sun', color: '#FBBF24', frequency: { type: 'daily' } },
  { id: 'coffee', labelKey: 'rec.coffee', icon: 'Coffee', color: '#B45309', frequency: { type: 'daily' } },
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

