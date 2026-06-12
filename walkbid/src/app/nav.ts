import { Briefcase, Users, BookOpen, Settings, type LucideIcon } from 'lucide-react';
import type { TKey } from '@/i18n';

export interface NavItem {
  to: string;
  labelKey: TKey;
  icon: LucideIcon;
}

// Bottom tab bar (spec §8): Jobs · Clients · + (FAB) · Price book · Settings.
// The FAB sits in the center and is rendered separately by the TabBar.
export const LEFT_TABS: NavItem[] = [
  { to: '/jobs', labelKey: 'nav.jobs', icon: Briefcase },
  { to: '/clients', labelKey: 'nav.clients', icon: Users },
];

export const RIGHT_TABS: NavItem[] = [
  { to: '/price-book', labelKey: 'nav.priceBook', icon: BookOpen },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];
