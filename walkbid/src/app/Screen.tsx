import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { IconButton } from '@/ui';

// Standard page shell: grainy header with title + optional back/action,
// scrollable body with bottom padding to clear the tab bar.
interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean;
  action?: ReactNode;
  children: ReactNode;
  /** When true, removes bottom tab-bar padding (e.g. flow screens). */
  flush?: boolean;
}

export function Screen({ title, subtitle, back, action, children, flush }: Props) {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="grain sticky top-0 z-10 border-b border-hairline bg-bg/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur">
        <div className="flex items-center gap-2">
          {back && (
            <IconButton label="Back" onClick={() => nav(-1)} className="-ml-2">
              <ChevronLeft size={26} />
            </IconButton>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
            {subtitle && <div className="truncate text-sm text-muted">{subtitle}</div>}
          </div>
          {action}
        </div>
      </header>
      <main className={flush ? 'flex-1' : 'flex-1 pb-28'}>{children}</main>
    </div>
  );
}
