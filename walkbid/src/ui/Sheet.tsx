import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

// Bottom sheet modal — the primary way WalkBid presents forms and pickers.
interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Sticky footer (e.g. full-width primary action). */
  footer?: ReactNode;
}

export function Sheet({ open, onClose, title, children, footer }: Props) {
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-[color:var(--scrim)]" onClick={onClose} />
      <div className="relative flex max-h-[92vh] flex-col rounded-t-sheet border-t border-hairline bg-surface-2 shadow-raise">
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <h2 className="font-display text-h2 text-ink">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={22} />
          </IconButton>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <div className="border-t border-hairline px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">{footer}</div>}
      </div>
    </div>
  );
}
