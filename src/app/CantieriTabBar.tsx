import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, HardHat, Users, MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    to: '/',
    label: 'Home',
    icon: LayoutDashboard,
    match: (p) => p === '/',
  },
  {
    to: '/cantiere',
    label: 'Lavori',
    icon: HardHat,
    match: (p) =>
      p.startsWith('/cantiere') &&
      !p.startsWith('/cantiere/operai') &&
      !p.startsWith('/cantiere/impianti'),
  },
  {
    to: '/cantiere/operai',
    label: 'Squadra',
    icon: Users,
    match: (p) => p.startsWith('/cantiere/operai'),
  },
  {
    to: '/altro',
    label: 'Altro',
    icon: MoreHorizontal,
    match: (p) =>
      p.startsWith('/altro') ||
      p.startsWith('/ore') ||
      p.startsWith('/note') ||
      p.startsWith('/cantiere/impianti'),
  },
];

export function CantieriTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 tabbar-glass border-t border-line pb-safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 min-w-0"
            >
              {/* Icon in pill container */}
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-8 rounded-2xl transition-all duration-200',
                  active ? 'bg-primary/10' : '',
                )}
              >
                <Icon
                  size={active ? 22 : 21}
                  strokeWidth={active ? 2.4 : 1.7}
                  style={{ color: active ? 'var(--c-primary)' : 'var(--c-ink-3)' }}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-bold tracking-wide transition-colors duration-200',
                  active ? '' : 'text-ink-3',
                )}
                style={active ? { color: 'var(--c-primary)' } : undefined}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
