import { uid } from '@/data/db';
import type { ModuleId, WidgetInstance, WidgetSize, WidgetType } from '@/data/types';

/**
 * Sensible starter dashboard derived from the user's enabled modules. Core
 * widgets are always present; module widgets only when their module is on.
 */
export function defaultWidgets(enabled: ModuleId[]): WidgetInstance[] {
  const plan: { type: WidgetType; size: WidgetSize }[] = [
    { type: 'momentum', size: 'medium' },
    // Motivational phrase, right below the panda (replaces the old quick-actions).
    { type: 'affirmation', size: 'medium' },
  ];
  if (enabled.includes('attivita')) plan.push({ type: 'activity-rings', size: 'small' });
  if (enabled.includes('abitudini')) plan.push({ type: 'habit-streak', size: 'small' });
  plan.push({ type: 'water', size: 'small' });
  if (enabled.includes('finanze')) plan.push({ type: 'finance-balance', size: 'small' });
  if (enabled.includes('obiettivi')) plan.push({ type: 'goals-progress', size: 'small' });
  plan.push({ type: 'rewards', size: 'small' });

  return plan.map((p, i) => ({ id: uid('w'), type: p.type, size: p.size, position: i }));
}
