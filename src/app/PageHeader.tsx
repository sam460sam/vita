import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean | string;
  large?: boolean;
}

/** Sticky page header that respects the device safe-area (notch). */
export function PageHeader({ title, subtitle, action, back, large }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-app/85 backdrop-blur-xl border-b border-line/70 pt-safe-top">
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
      </div>
      {large && <div className="h-1" />}
    </header>
  );
}
