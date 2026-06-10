import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'auto' | 'full';
}

export function Sheet({ open, onClose, title, children, footer, size = 'auto' }: SheetProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'sheet-surface relative w-full sm:max-w-md',
          'rounded-t-[20px] sm:rounded-[20px]',
          'border border-line shadow-sheet',
          'animate-sheet-in flex flex-col pb-safe-bottom',
          size === 'full' ? 'h-[92vh] sm:h-[80vh]' : 'max-h-[92vh]',
        )}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 sm:hidden flex-shrink-0">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-2 flex-shrink-0">
          <h2 className="font-display text-[17px] font-bold text-ink tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="h-8 w-8 rounded-full flex items-center justify-center text-ink-3 hover:bg-section hover:text-ink active:bg-divider transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="px-5 pb-4 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 pt-3 pb-4 border-t border-line flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
