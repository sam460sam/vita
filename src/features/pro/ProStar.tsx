import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Small gold star that marks a Pro-only feature. Render it for free users only
 * — it disappears once they subscribe. Absolutely positioned (top-right) by
 * default; pass `className` to reposition or make it inline (`!static`).
 */
export function ProStar({ className }: { className?: string }) {
  return (
    <Star
      size={13}
      aria-label="Pro"
      className={cn('absolute top-1.5 right-1.5 z-10', className)}
      style={{ color: 'var(--c-gold-2)', fill: 'var(--c-gold-2)', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
    />
  );
}
