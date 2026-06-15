import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import { VioCompanion } from '@/ui';
import { useStella } from '@/features/stella';
import { useTheme } from '@/theme/theme';
import { useT } from '@/i18n';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean | string;
  large?: boolean;
  /** hide the Stella helper button (e.g. on detail pages) */
  hideStella?: boolean;
}

/** Sticky page header that respects the device safe-area (notch). */
export function PageHeader({ title, subtitle, action, back, large, hideStella }: PageHeaderProps) {
  const navigate = useNavigate();
  const stella = useStella();
  const { resolved, setPref } = useTheme();
  const t = useT();
  const isDark = resolved === 'dark';
  return (
    <header className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl border-b border-line/70 dark:border-transparent pt-safe-top">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
        {back && (
          <button
            onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
            aria-label={t('common.back')}
            className="-ml-2 h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="display-serif text-[19px] font-semibold text-ink truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-ink-2 truncate">{subtitle}</p>}
        </div>
        {action}
        <button
          onClick={() => setPref(isDark ? 'light' : 'dark')}
          aria-label={t('theme.toggle')}
          className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        {!hideStella && (
          <button
            onClick={stella.open}
            aria-label={t('stella.name')}
            className="h-10 w-10 -mr-1 flex items-center justify-center rounded-full hover:bg-section active:scale-90 transition-transform"
          >
            <VioCompanion stage="germoglio" size={30} />
          </button>
        )}
      </div>
      {large && <div className="h-1" />}
    </header>
  );
}
