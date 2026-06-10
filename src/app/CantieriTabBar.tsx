import { Link, useLocation } from 'react-router-dom';
import { HardHat, Clock, StickyNote, Users, Factory, type LucideIcon } from 'lucide-react';

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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app/95 backdrop-blur-xl border-t border-line/70 pb-safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ to, label, icon: Icon, match, accent }) => {
          const active = match(pathname);
          const color = active && accent ? accent : undefined;
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? (accent ? '' : 'text-primary') : 'text-ink-3'
              }`}
              style={color ? { color } : undefined}
            >
              <Icon size={23} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
