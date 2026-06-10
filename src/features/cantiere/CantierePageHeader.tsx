import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/theme/theme';
import { BetonieroSheet } from './BetonieroSheet';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean | string;
}

export function CantierePageHeader({ title, subtitle, action, back }: Props) {
  const navigate = useNavigate();
  const { resolved, setPref } = useTheme();
  const isDark = resolved === 'dark';
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 header-glass border-b border-line pt-safe-top">
        <div className="max-w-3xl mx-auto px-4 h-[52px] flex items-center gap-1.5">
          {back && (
            <button
              onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
              aria-label="Indietro"
              className="-ml-1.5 h-9 w-9 flex items-center justify-center rounded-xl text-ink-2 hover:bg-section active:bg-divider transition-colors"
            >
              <ChevronLeft size={22} strokeWidth={2.2} />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[17px] font-bold text-ink truncate leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] font-medium text-ink-3 truncate tracking-wide uppercase">
                {subtitle}
              </p>
            )}
          </div>

          {action}

          <button
            onClick={() => setPref(isDark ? 'light' : 'dark')}
            aria-label="Tema"
            className="h-9 w-9 flex items-center justify-center rounded-xl text-ink-3 hover:bg-section hover:text-ink-2 active:scale-90 transition-all"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={() => setHelpOpen(true)}
            aria-label="Guida"
            className="h-9 w-9 -mr-0.5 flex items-center justify-center rounded-xl hover:bg-section active:scale-90 transition-all"
          >
            <img src="./betoniera.png" alt="" className="w-7 h-7 rounded-lg object-cover" />
          </button>
        </div>
      </header>

      <BetonieroSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
