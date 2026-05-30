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
  icon: LucideIcon;
  accent?: string;
}

/** Primary bottom-tab / sidebar destinations. */
export const PRIMARY_NAV: NavItem[] = [
  { to: '/oggi', label: 'Oggi', icon: Home },
  { to: '/attivita', label: 'Attività', icon: Activity, accent: 'var(--c-activity)' },
  { to: '/progetti', label: 'Progetti', icon: CheckSquare, accent: 'var(--c-project)' },
  { to: '/abitudini', label: 'Abitudini', icon: Flame, accent: 'var(--c-habit)' },
  { to: '/altro', label: 'Altro', icon: MoreHorizontal },
];

/** Secondary destinations reachable from "Altro" + sidebar. */
export const SECONDARY_NAV: NavItem[] = [
  { to: '/diario', label: 'Diario & Umore', icon: BookHeart, accent: 'var(--c-journal)' },
  { to: '/obiettivi', label: 'Obiettivi', icon: Target, accent: 'var(--c-project)' },
  { to: '/finanze', label: 'Finanze', icon: Wallet, accent: 'var(--c-finance)' },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/impostazioni', label: 'Impostazioni', icon: Settings },
];
