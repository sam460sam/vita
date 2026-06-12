import { NavLink, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import { LEFT_TABS, RIGHT_TABS, type NavItem } from './nav';
import { useQuickAdd } from './QuickAdd';

function Tab({ item }: { item: NavItem }) {
  const t = useT();
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn('flex h-full flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold', isActive ? 'text-safety' : 'text-dust')
      }
    >
      <item.icon size={22} />
      <span>{t(item.labelKey)}</span>
    </NavLink>
  );
}

export function TabBar() {
  const { open } = useQuickAdd();
  const { pathname } = useLocation();
  // Hide on flow/detail screens that use their own bottom action bar.
  if (pathname.startsWith('/jobs/')) return null;

  return (
    <nav className="shadow-bar fixed inset-x-0 bottom-0 z-30 flex h-[64px] items-stretch border-t border-steel bg-graphite pb-[env(safe-area-inset-bottom)]">
      {LEFT_TABS.map((i) => (
        <Tab key={i.to} item={i} />
      ))}
      <div className="relative flex w-16 items-center justify-center">
        <button
          aria-label="Add"
          onClick={open}
          className="absolute -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-safety text-asphalt shadow-bar active:bg-safety/90"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
      {RIGHT_TABS.map((i) => (
        <Tab key={i.to} item={i} />
      ))}
    </nav>
  );
}
