import { Star } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Gold "Pro" star badge for free users (disappears once subscribed). Rendered
 * as a small rounded gold disc so it reads as an intentional badge and never
 * looks like it's colliding with nearby text. Absolutely positioned (top-right)
 * by default; pass `className` (e.g. `!static`) to reposition or inline it.
 */
export function ProStar({ className }: { className?: string }) {
  return (
    <span
      aria-label="Pro"
      className={cn('absolute top-1 right-1 z-10 inline-flex items-center justify-center h-[18px] w-[18px] rounded-full', className)}
      style={{
        background: 'color-mix(in srgb, var(--c-gold) 26%, var(--c-card))',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-gold) 50%, transparent), 0 1px 3px rgba(0,0,0,0.35)',
      }}
    >
      <Star size={11} style={{ color: 'var(--c-gold-2)', fill: 'var(--c-gold-2)' }} />
    </span>
  );
}
