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

export interface NavItem {
  to: string;
  label: string;
  /** shorter label for the compact bottom tab bar (falls back to label) */
  short?: string;
  icon: LucideIcon;
  accent?: string;
}

/** Primary bottom-tab destinations: 3 left + 3 right of the centered FAB. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/oggi', label: 'Oggi', icon: Home },
  { to: '/attivita', label: 'Attività', icon: Activity, accent: 'var(--c-activity)' },
  { to: '/progetti', label: 'Progetti', icon: CheckSquare, accent: 'var(--c-project)' },
  { to: '/abitudini', label: 'Abitudini', short: 'Abitud.', icon: Flame, accent: 'var(--c-habit)' },
  { to: '/finanze', label: 'Finanze', icon: Wallet, accent: 'var(--c-finance)' },
  { to: '/altro', label: 'Altro', icon: MoreHorizontal },
];

/** Secondary destinations reachable from "Altro" + sidebar. */
export const SECONDARY_NAV: NavItem[] = [
  { to: '/diario', label: 'Diario & Umore', icon: BookHeart, accent: 'var(--c-journal)' },
  { to: '/obiettivi', label: 'Obiettivi', icon: Target, accent: 'var(--c-project)' },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/impostazioni', label: 'Impostazioni', icon: Settings },
];
