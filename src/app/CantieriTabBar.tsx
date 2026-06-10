import { Link, useLocation } from 'react-router-dom';
import { HardHat, Clock, StickyNote, Users, Factory, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
  accent?: string;
}

const TABS: Tab[] = [
  {
    to: '/cantiere',
    label: 'Cantieri',
    icon: HardHat,
    match: (p) =>
      p.startsWith('/cantiere') &&
      !p.startsWith('/cantiere/operai') &&
      !p.startsWith('/cantiere/impianti'),
  },
  {
    to: '/ore',
    label: 'Ore',
    icon: Clock,
    match: (p) => p.startsWith('/ore'),
    accent: 'var(--c-ore)',
  },
  {
    to: '/note',
    label: 'Note',
    icon: StickyNote,
    match: (p) => p.startsWith('/note'),
    accent: 'var(--c-note)',
  },
  {
    to: '/cantiere/operai',
    label: 'Operai',
    icon: Users,
    match: (p) => p.startsWith('/cantiere/operai'),
  },
  {
    to: '/cantiere/impianti',
    label: 'Impianti',
    icon: Factory,
    match: (p) => p.startsWith('/cantiere/impianti'),
  },
];

export function CantieriTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 tabbar-glass border-t border-line pb-safe-bottom">
      <div className="flex max-w-lg mx-auto px-1">
        {TABS.map(({ to, label, icon: Icon, match, accent }) => {
          const active = match(pathname);
          const accentColor = active ? (accent ?? 'var(--c-primary)') : undefined;

          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center pt-2.5 pb-1 gap-0.5 min-w-0"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.3 : 1.6}
                  style={{ color: accentColor ?? 'var(--c-ink-3)' }}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold tracking-wide transition-colors duration-200',
                  active ? '' : 'text-ink-3',
                )}
                style={active ? { color: accentColor } : undefined}
              >
                {label}
              </span>
              {/* 3px active dot indicator */}
              <span
                className="h-[3px] w-[3px] rounded-full transition-opacity duration-200"
                style={{
                  backgroundColor: accentColor ?? 'var(--c-primary)',
                  opacity: active ? 1 : 0,
                }}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
