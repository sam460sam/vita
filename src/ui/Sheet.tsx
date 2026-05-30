import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

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
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
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
        <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Chiudi"
            className="h-9 w-9 -mr-1 rounded-full flex items-center justify-center text-ink-2 hover:bg-section active:bg-divider"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-4 pt-3 pb-4 border-t border-divider flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
