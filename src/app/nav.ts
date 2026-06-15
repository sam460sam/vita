import {
  CalendarDays,
  CheckSquare,
  Flame,
  Home,
  MoreHorizontal,
  Target,
  Wallet,
  BookHeart,
  Activity,
  Settings,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import type { TKey } from '@/i18n';
import type { ModuleId } from '@/data/types';
import { useModules } from '@/features/personalizzazione/prefs';
import { MODULE_CATALOG } from '@/features/personalizzazione/modules';

export interface NavItem {
  to: string;
  /** i18n key for the full label */
  labelKey: TKey;
  /** i18n key for the compact bottom-tab label (falls back to labelKey) */
  shortKey?: TKey;
  icon: LucideIcon;
  accent?: string;
}

/** Primary bottom-tab destinations: 3 left + 3 right of the centered FAB. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/oggi', labelKey: 'nav.today', icon: Home },
  { to: '/attivita', labelKey: 'nav.activity', icon: Activity, accent: 'var(--c-activity)' },
  { to: '/progetti', labelKey: 'nav.projects', icon: CheckSquare, accent: 'var(--c-project)' },
  { to: '/abitudini', labelKey: 'nav.habits', shortKey: 'nav.habits.short', icon: Flame, accent: 'var(--c-habit)' },
  { to: '/finanze', labelKey: 'nav.finances', icon: Wallet, accent: 'var(--c-finance)' },
  { to: '/altro', labelKey: 'nav.more', icon: MoreHorizontal },
];

/** Secondary destinations reachable from "Altro" + sidebar. */
export const SECONDARY_NAV: NavItem[] = [
  { to: '/diario', labelKey: 'nav.journal', icon: BookHeart, accent: 'var(--c-journal)' },
  { to: '/obiettivi', labelKey: 'nav.goals', icon: Target, accent: 'var(--c-project)' },
  { to: '/calendario', labelKey: 'nav.calendar', icon: CalendarDays },
  { to: '/recap', labelKey: 'nav.recap', icon: Sparkles, accent: 'var(--c-habit)' },
  { to: '/premi', labelKey: 'nav.rewards', icon: Trophy, accent: 'var(--c-habit)' },
  { to: '/impostazioni', labelKey: 'nav.settings', icon: Settings },
];

// ---------------------------------------------------------------------------
// Dynamic navigation — built from the user's enabled modules + their order.
// Home, More and Settings/Recap/Rewards are always present (not "interests").
// ---------------------------------------------------------------------------
export const HOME_ITEM: NavItem = { to: '/oggi', labelKey: 'nav.today', icon: Home };
export const MORE_ITEM: NavItem = { to: '/altro', labelKey: 'nav.more', icon: MoreHorizontal };

/**
 * Hero modules — the focused set that always leads the bottom tab bar (in this
 * order): Habits · Water · Test(Personality). Everything else is "set aside" in
 * the "More" drawer. This keeps the app from feeling like a sprawling all-in-one
 * and puts our three strongest pages front and centre.
 */
export const HERO_MODULES: ModuleId[] = ['abitudini', 'acqua', 'personalita'];

/** Always-available destinations that are not toggleable interests. */
export const EXTRA_NAV: NavItem[] = [
  { to: '/recap', labelKey: 'nav.recap', icon: Sparkles, accent: 'var(--c-habit)' },
  { to: '/premi', labelKey: 'nav.rewards', icon: Trophy, accent: 'var(--c-habit)' },
  { to: '/impostazioni', labelKey: 'nav.settings', icon: Settings },
];

export interface NavSet {
  /** Module destinations in the user's order. */
  modules: NavItem[];
  /** Bottom tab bar: Home · hero modules · More. */
  tabs: NavItem[];
  /** Desktop sidebar primary group: Home + hero modules. */
  sidebarPrimary: NavItem[];
  /** "Altro" page list: non-hero modules ("set aside") + extras. */
  more: NavItem[];
}

const toItem = (id: ModuleId): NavItem => {
  const d = MODULE_CATALOG[id];
  return { to: d.to, labelKey: d.labelKey, shortKey: d.shortKey, icon: d.icon, accent: d.accent };
};

export function useNavItems(): NavSet {
  const { order } = useModules();
  const enabled = new Set(order);
  // Hero set leads the tab bar (only those the user still has enabled).
  const hero = HERO_MODULES.filter((id) => enabled.has(id)).map(toItem);
  // Everything else keeps the user's order but is pushed into "More".
  const rest = order.filter((id) => !HERO_MODULES.includes(id)).map(toItem);
  return {
    modules: order.map(toItem),
    tabs: [HOME_ITEM, ...hero, MORE_ITEM],
    sidebarPrimary: [HOME_ITEM, ...hero],
    more: [...rest, ...EXTRA_NAV],
  };
}
