import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** full = near full-screen (e.g. paywall/detail); auto = content height. */
  size?: 'auto' | 'full';
}

export function Sheet({ open, onClose, title, children, size = 'auto' }: SheetProps) {
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 flex flex-col rounded-t-[28px] bg-section shadow-sheet animate-fade-in',
          size === 'full' ? 'h-[92vh]' : 'max-h-[88vh]',
        )}
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15" />
          <div className="mt-2 text-lg font-semibold text-ink">{title}</div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-2 hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
