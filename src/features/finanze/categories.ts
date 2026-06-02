import type { TKey } from '@/i18n';

// Stable category keys (stored on transactions). Labels are translated at
// render time so they follow the selected language.
export const EXPENSE_CATEGORIES = [
  'groceries',
  'home',
  'transport',
  'bills',
  'health',
  'leisure',
  'restaurants',
  'shopping',
  'travel',
  'holidays',
  'gifts',
  'investments',
  'subscriptions',
  'other',
] as const;

export const INCOME_CATEGORIES = ['salary', 'extra', 'gifts', 'refunds', 'investments', 'bonus', 'other'] as const;

export type CategoryKey = (typeof EXPENSE_CATEGORIES)[number] | (typeof INCOME_CATEGORIES)[number];

/** i18n key for a category id. */
export function categoryLabelKey(cat: string): TKey {
  return `cat.${cat}` as TKey;
}

const PALETTE = ['#7C3AED', '#FF6B57', '#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#EC4899', '#6B7280', '#059669', '#D97706', '#9CA3AF'];

export function categoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
