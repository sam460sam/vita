import { uid } from '@/data/db';
import type { ModuleId, WidgetInstance, WidgetSize, WidgetType } from '@/data/types';

/**
 * Sensible starter dashboard derived from the user's enabled modules. Core
 * widgets are always present; module widgets only when their module is on.
 */
export function defaultWidgets(enabled: ModuleId[]): WidgetInstance[] {
  const plan: { type: WidgetType; size: WidgetSize }[] = [
    { type: 'momentum', size: 'large' },
    { type: 'quick-actions', size: 'medium' },
    { type: 'water', size: 'medium' },
  ];
  if (enabled.includes('attivita')) plan.push({ type: 'activity-rings', size: 'medium' });
  if (enabled.includes('abitudini')) plan.push({ type: 'habit-streak', size: 'small' });
  if (enabled.includes('finanze')) plan.push({ type: 'finance-balance', size: 'small' });
  plan.push({ type: 'daily-todo', size: 'large' });
  if (enabled.includes('peso')) plan.push({ type: 'weight-trend', size: 'medium' });
  if (enabled.includes('diario')) plan.push({ type: 'journal-last', size: 'medium' });
  if (enabled.includes('obiettivi')) plan.push({ type: 'goals-progress', size: 'medium' });
  if (enabled.includes('abitudini')) plan.push({ type: 'consistency-heatmap', size: 'large' });
  plan.push({ type: 'affirmation', size: 'medium' });
  plan.push({ type: 'rewards', size: 'small' });

  return plan.map((p, i) => ({ id: uid('w'), type: p.type, size: p.size, position: i }));
}
