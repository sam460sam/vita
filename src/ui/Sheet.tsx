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
  /** full uses near-full height for forms/lists */
  size?: 'auto' | 'full';
}

export function Sheet({ open, onClose, title, children, footer, size = 'auto' }: SheetProps) {
  const t = useT();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    // Lock the background completely (iOS-safe): fix the body at its current
    // scroll position so the page behind the sheet can't move.
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    // Always open scrolled to the top (title first), regardless of autofocus.
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
      <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-card shadow-sheet animate-sheet-in flex flex-col',
          'pb-safe-bottom',
          size === 'full' ? 'h-[92vh] sm:h-[80vh]' : 'max-h-[92vh]',
        )}
      >
        {/* Grab handle for a more native feel */}
        <div className="flex justify-center pt-2.5 sm:hidden flex-shrink-0">
          <span className="h-1 w-9 rounded-full bg-line" />
        </div>
        <div className="flex items-center justify-between px-4 pt-2 sm:pt-4 pb-2 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="h-9 w-9 -mr-1 rounded-full flex items-center justify-center text-ink-2 hover:bg-section active:bg-divider"
          >
            <X size={20} />
          </button>
        </div>
        <div ref={scrollRef} className="px-4 pb-4 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain">
          {children}
        </div>
        {footer && <div className="px-4 pt-3 pb-4 border-t border-divider flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
