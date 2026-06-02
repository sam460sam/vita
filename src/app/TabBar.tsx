import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useNavItems, type NavItem } from './nav';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import { useQuickAdd } from './QuickAdd';

/** Mobile bottom tab bar: destinations · centered quick-add FAB · destinations. */
export function TabBar() {
  const { tabs } = useNavItems();
  const half = Math.ceil(tabs.length / 2);
  const left = tabs.slice(0, half);
  const right = tabs.slice(half);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-card/85 backdrop-blur-xl border-t border-line/80 dark:border-transparent pb-safe-bottom">
      <div className="flex items-stretch h-[60px] max-w-md mx-auto px-1">
        {left.map((item) => (
          <TabLink key={item.to} {...item} />
        ))}
        <div className="flex items-center justify-center w-14 flex-shrink-0">
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
      className="h-[52px] w-[52px] -mt-5 rounded-full bg-primary text-on-primary border border-primary-border shadow-card-hover ring-4 ring-app flex items-center justify-center active:scale-90 transition-transform"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}

function TabLink({ to, labelKey, shortKey, icon: Icon, accent }: NavItem) {
  const t = useT();
  return (
    <NavLink to={to} className="flex-1 flex flex-col items-center justify-center gap-0.5 min-w-0">
      {({ isActive }) => (
        <>
          <Icon
            size={23}
            strokeWidth={isActive ? 2.5 : 2}
            style={{ color: isActive ? accent ?? 'var(--c-ink)' : 'var(--c-ink-3)' }}
          />
          <span className={cn('text-[10px] font-semibold truncate max-w-full px-0.5', isActive ? 'text-ink' : 'text-ink-3')}>
            {t(shortKey ?? labelKey)}
          </span>
        </>
      )}
    </NavLink>
  );
}
