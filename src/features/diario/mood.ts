import type { Mood } from '@/data/types';

export interface MoodMeta {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
}

export const MOODS: MoodMeta[] = [
  { value: 1, label: 'Pessimo', emoji: '😣', color: '#EF4444' },
  { value: 2, label: 'Giù', emoji: '🙁', color: '#F59E0B' },
  { value: 3, label: 'Neutro', emoji: '😐', color: '#9CA3AF' },
  { value: 4, label: 'Bene', emoji: '🙂', color: '#10B981' },
  { value: 5, label: 'Ottimo', emoji: '😄', color: '#059669' },
];

export function moodMeta(m: Mood): MoodMeta {
  return MOODS.find((x) => x.value === m) ?? MOODS[2];
}
