import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { IconButton } from '@/ui';
import { cn } from '@/lib/cn';

// Standard page shell. Optional grain finish (brand gradient + film grain) for
// the signature premium header (redesign A5).
interface Props {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean;
  action?: ReactNode;
  children: ReactNode;
  /** Removes bottom tab-bar padding (flow/detail screens). */
  flush?: boolean;
  /** Apply the brand-gradient + film-grain header finish. */
  grain?: boolean;
}

export function Screen({ title, subtitle, back, action, children, flush, grain }: Props) {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header
        className={cn(
          'sticky top-0 z-10 border-b border-hairline px-4 pb-3 pt-[max(env(safe-area-inset-top),16px)] backdrop-blur',
          grain ? 'header-grain' : 'bg-bg/95',
        )}
      >
        <div className="flex items-center gap-2">
          {back && (
            <IconButton label="Back" onClick={() => nav(-1)} className="-ml-2">
              <ChevronLeft size={26} />
            </IconButton>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-display text-ink">{title}</h1>
            {subtitle && <div className="truncate text-meta text-muted">{subtitle}</div>}
          </div>
          {action}
        </div>
      </header>
      <main className={flush ? 'flex-1' : 'flex-1 pb-28'}>{children}</main>
    </div>
  );
}
