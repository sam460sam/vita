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
              className="relative flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 min-w-0 press"
            >
              {/* Active indicator bar at top */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full"
                  style={{ background: 'var(--hazard)' }}
                />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-8 rounded-xl transition-all duration-200',
                  active ? 'bg-getto/10' : '',
                )}
              >
                <Icon
                  size={active ? 22 : 21}
                  strokeWidth={active ? 2.4 : 1.7}
                  style={{ color: active ? 'var(--hazard)' : 'var(--cement-400)' }}
                />
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-bold tracking-wide transition-colors duration-200"
                style={{ color: active ? 'var(--hazard)' : 'var(--cement-400)' }}
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
