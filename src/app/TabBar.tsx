import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PRIMARY_NAV } from './nav';
import { cn } from '@/lib/cn';
import { useQuickAdd } from './QuickAdd';

/** Mobile bottom tab bar with centered global quick-add FAB. */
export function TabBar() {
  const left = PRIMARY_NAV.slice(0, 2);
  const right = PRIMARY_NAV.slice(2);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/90 backdrop-blur-xl border-t border-line pb-safe-bottom">
      <div className="flex items-stretch h-16 max-w-md mx-auto px-1">
        {left.map((item) => (
          <TabLink key={item.to} {...item} />
        ))}
        <div className="flex items-center justify-center w-16">
          <QuickAddButton />
        </div>
        {right.map((item) => (
          <TabLink key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

function QuickAddButton() {
  const { openMenu } = useQuickAdd();
  return (
    <button
      onClick={openMenu}
      aria-label="Aggiungi"
      className="h-12 w-12 -mt-4 rounded-full bg-ink text-white shadow-card-hover flex items-center justify-center active:scale-95 transition-transform"
    >
      <Plus size={24} />
    </button>
  );
}

function TabLink({ to, label, icon: Icon }: (typeof PRIMARY_NAV)[number]) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
          isActive ? 'text-ink' : 'text-ink-3',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
