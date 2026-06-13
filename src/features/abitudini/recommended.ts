import type { TKey } from '@/i18n';
import type { HabitFrequency } from '@/data/types';

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

