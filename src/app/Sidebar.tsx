import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PRIMARY_NAV, SECONDARY_NAV } from './nav';
import { cn } from '@/lib/cn';
import { useQuickAdd } from './QuickAdd';

/** Desktop sidebar (lg+). Same destinations as the mobile tab bar + secondary. */
export function Sidebar() {
  const { openMenu } = useQuickAdd();
  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-line bg-card h-screen sticky top-0 px-3 py-5">
      <div className="px-3 mb-6">
        <span className="text-2xl font-bold tracking-tight text-ink">Vita</span>
      </div>

      <button
        onClick={openMenu}
        className="mb-5 mx-1 inline-flex items-center gap-2 h-11 px-4 rounded-btn bg-ink text-white font-semibold hover:opacity-90 transition-opacity"
      >
        <Plus size={18} /> Aggiungi
      </button>

      <nav className="flex flex-col gap-0.5">
        {PRIMARY_NAV.filter((n) => n.to !== '/altro').map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>

      <div className="mt-6 mb-2 px-3 metric-label">Altro</div>
      <nav className="flex flex-col gap-0.5">
        {SECONDARY_NAV.map((item) => (
          <SideLink key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  );
}

function SideLink({ to, label, icon: Icon, accent }: (typeof PRIMARY_NAV)[number]) {
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
          {label}
        </>
      )}
    </NavLink>
  );
}
