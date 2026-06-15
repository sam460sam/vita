import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useNavItems, type NavItem } from './nav';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import { useQuickAdd } from './QuickAdd';

/** Desktop sidebar (lg+). Same destinations as the mobile tab bar + secondary. */
export function Sidebar() {
  const { openMenu } = useQuickAdd();
  const { sidebarPrimary, more } = useNavItems();
  const t = useT();
  return (
    <aside className="hidden md:flex flex-col w-64 flex-shrink-0 border-r border-line dark:border-transparent bg-card h-screen sticky top-0 px-3 py-5">
      <div className="px-3 mb-6">
        <span className="text-2xl font-bold tracking-tight text-ink">Vyta</span>
      </div>

      <button
        onClick={openMenu}
        className="mb-5 mx-1 inline-flex items-center gap-2 h-11 px-4 rounded-btn bg-primary text-on-primary border border-primary-border font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus size={18} /> {t('common.add')}
      </button>

      <nav className="flex flex-col gap-0.5">
        {sidebarPrimary.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-6 mb-2 px-3 metric-label">{t('nav.more')}</div>
      <nav className="flex flex-col gap-0.5">
        {more.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}

function SideLink({ to, labelKey, icon: Icon, accent }: NavItem) {
  const t = useT();
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 h-10 px-3 rounded-btn text-[15px] font-medium transition-colors',
          isActive ? 'bg-section text-ink' : 'text-ink-2 hover:bg-section/60 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={19} style={isActive && accent ? { color: accent } : undefined} />
          {t(labelKey)}
        </>
      )}
    </NavLink>
  );
}
