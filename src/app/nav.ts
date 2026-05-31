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
  type LucideIcon,
} from 'lucide-react';

import type { TKey } from '@/i18n';

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
  { to: '/impostazioni', labelKey: 'nav.settings', icon: Settings },
];
