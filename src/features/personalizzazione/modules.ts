// ============================================================================
// Module catalog — the "interests" a user can enable. Each maps 1:1 to a
// navigable route. Single source of truth for onboarding, navigation filtering
// and the widget gallery.
// ============================================================================
import { Activity, Scale, CheckSquare, Flame, Wallet, BookHeart, Target, CalendarDays, type LucideIcon } from 'lucide-react';
import type { ModuleId } from '@/data/types';
import { ALL_MODULES } from '@/data/types';
import type { TKey } from '@/i18n';

export interface ModuleDef {
  id: ModuleId;
  to: string;
  labelKey: TKey;
  shortKey?: TKey;
  descKey: TKey;
  icon: LucideIcon;
  accent: string;
}

export const MODULE_CATALOG: Record<ModuleId, ModuleDef> = {
  abitudini: { id: 'abitudini', to: '/abitudini', labelKey: 'nav.habits', shortKey: 'nav.habits.short', descKey: 'module.abitudini.desc', icon: Flame, accent: 'var(--c-habit)' },
  attivita: { id: 'attivita', to: '/attivita', labelKey: 'nav.activity', descKey: 'module.attivita.desc', icon: Activity, accent: 'var(--c-activity)' },
  peso: { id: 'peso', to: '/peso', labelKey: 'weight.title', descKey: 'module.peso.desc', icon: Scale, accent: 'var(--c-project)' },
  progetti: { id: 'progetti', to: '/progetti', labelKey: 'nav.projects', descKey: 'module.progetti.desc', icon: CheckSquare, accent: 'var(--c-project)' },
  obiettivi: { id: 'obiettivi', to: '/obiettivi', labelKey: 'nav.goals', descKey: 'module.obiettivi.desc', icon: Target, accent: 'var(--c-project)' },
  diario: { id: 'diario', to: '/diario', labelKey: 'nav.journal', descKey: 'module.diario.desc', icon: BookHeart, accent: 'var(--c-journal)' },
  finanze: { id: 'finanze', to: '/finanze', labelKey: 'nav.finances', descKey: 'module.finanze.desc', icon: Wallet, accent: 'var(--c-finance)' },
  calendario: { id: 'calendario', to: '/calendario', labelKey: 'nav.calendar', descKey: 'module.calendario.desc', icon: CalendarDays, accent: 'var(--c-ink-2)' },
};

/** Module defs in canonical order. */
export const MODULE_LIST: ModuleDef[] = ALL_MODULES.map((id) => MODULE_CATALOG[id]);

/** Map a route path back to its module id (for nav-guard redirects). */
export function moduleForPath(path: string): ModuleId | null {
  const entry = MODULE_LIST.find((m) => path === m.to || path.startsWith(m.to + '/'));
  return entry ? entry.id : null;
}
