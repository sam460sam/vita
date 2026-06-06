import { Link, useLocation } from 'react-router-dom';
import { HardHat, Users, Factory, Info, type LucideIcon } from 'lucide-react';

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const TABS: Tab[] = [
  {
    to: '/cantiere',
    label: 'Cantieri',
    icon: HardHat,
    match: (p) => p.startsWith('/cantiere') && !p.startsWith('/cantiere/operai'),
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
  {
    to: '/info',
    label: 'Info',
    icon: Info,
    match: (p) => p.startsWith('/info') || p.startsWith('/privacy') || p.startsWith('/termini'),
  },
];

export function CantieriTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-app/90 backdrop-blur-xl border-t border-line/70 pb-safe-bottom">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                active ? 'text-slate-600 dark:text-slate-300' : 'text-ink-3'
              }`}
            >
              <Icon size={24} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
