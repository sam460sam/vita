export const EXPENSE_CATEGORIES = [
  'Spesa',
  'Casa',
  'Trasporti',
  'Bollette',
  'Salute',
  'Svago',
  'Ristoranti',
  'Shopping',
  'Viaggi',
  'Abbonamenti',
  'Altro',
];

export const INCOME_CATEGORIES = ['Stipendio', 'Extra', 'Regali', 'Rimborsi', 'Investimenti', 'Altro'];

const PALETTE = ['#7C3AED', '#FF6B57', '#4F46E5', '#10B981', '#F59E0B', '#0EA5E9', '#EC4899', '#6B7280', '#059669', '#D97706', '#9CA3AF'];

export function categoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
