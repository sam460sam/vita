// ============================================================================
// Personalisation hooks — the reactive bridge between Dexie and the UI.
// (The brief mentioned Zustand; Vita has no Zustand — it uses Dexie liveQuery
// everywhere, so we follow that convention: data lives in Dexie, components
// subscribe via useLiveQuery, mutations go through repo.ts.)
// ============================================================================
import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { readSettings, readHomeLayout } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { ALL_MODULES, type ModuleId, type Settings, type WidgetInstance } from '@/data/types';
import { MODULE_LIST } from './modules';
import { defaultWidgets } from './defaultLayout';

/** Core pages that are always available. The three hero pages (Habits · Water ·
 *  Test) lead the tab bar; Activity (Apple Watch/Health) is always reachable too
 *  (e.g. from the "+" menu) even though it lives in "More". */
const HERO_MODULES: ModuleId[] = ['abitudini', 'acqua', 'personalita', 'attivita'];

/**
 * Resolve the enabled modules from settings. `undefined` (legacy users who
 * onboarded before personalisation existed) means "everything enabled" so we
 * never hide a module they were already using.
 */
export function resolveEnabledModules(s: Settings): ModuleId[] {
  if (!s.enabledModules) return [...ALL_MODULES];
  const set = s.enabledModules.filter((m): m is ModuleId => ALL_MODULES.includes(m));
  // Always keep the hero pages available (Habits · Water · Test).
  for (const h of HERO_MODULES) if (!set.includes(h)) set.push(h);
  return set;
}

/** Enabled modules in the user's chosen order. */
export function resolveModuleOrder(s: Settings): ModuleId[] {
  const enabled = resolveEnabledModules(s);
  const order = s.moduleOrder ?? enabled;
  const ordered = order.filter((m) => enabled.includes(m));
  // Append any enabled module missing from the saved order (canonical order).
  for (const m of MODULE_LIST.map((d) => d.id)) if (enabled.includes(m) && !ordered.includes(m)) ordered.push(m);
  return ordered;
}

export interface ModulesState {
  loading: boolean;
  settings: Settings;
  enabled: ModuleId[];
  /** Ordered enabled modules (for navigation). */
  order: ModuleId[];
  isEnabled: (id: ModuleId) => boolean;
}

export function useModules(): ModulesState {
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const enabled = resolveEnabledModules(s);
  const order = resolveModuleOrder(s);
  return {
    loading: settings === undefined,
    settings: s,
    enabled,
    order,
    isEnabled: (id) => enabled.includes(id),
  };
}

/**
 * The user's home widgets. Falls back to a sensible default layout derived from
 * their enabled modules until they customise it (the default is persisted on
 * first edit, not eagerly, to keep startup writes out of liveQuery).
 */
export function useHomeWidgets(): { loading: boolean; widgets: WidgetInstance[]; isDefault: boolean } {
  const layout = useLiveQuery(() => readHomeLayout(), [], undefined);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const enabledKey = resolveEnabledModules(s).join(',');

  // Stable default layout (regenerating would create new widget ids — and thus
  // new React keys — on every render). Memoised on the enabled-modules set.
  const fallback = useMemo(() => defaultWidgets(enabledKey ? (enabledKey.split(',') as ModuleId[]) : []), [enabledKey]);

  // `undefined` = still loading; `null` = loaded but no custom layout saved yet.
  if (layout === undefined || settings === undefined) {
    return { loading: true, widgets: [], isDefault: true };
  }
  if (layout === null) {
    return { loading: false, widgets: fallback, isDefault: true };
  }
  return { loading: false, widgets: [...layout.widgets].sort((a, b) => a.position - b.position), isDefault: false };
}
