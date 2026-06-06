import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/theme/theme';

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

  return (
    <header className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl border-b border-line/70 dark:border-transparent pt-safe-top">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label="Indietro"
            className="-ml-2 h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold text-ink truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-ink-2 truncate">{subtitle}</p>}
        </div>
        {action}
        <button
          onClick={() => setPref(isDark ? 'light' : 'dark')}
          aria-label="Tema"
          className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
