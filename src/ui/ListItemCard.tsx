import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { tint, alpha } from '@/lib/color';

interface ListItemCardProps {
  /** Icon / emoji chip rendered on the left. */
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Single trailing action (StreakBadge, CheckBadge, IncrementButton…). */
  trailing?: ReactNode;
  /** Base color (hex) — drives the soft card tint. */
  color?: string;
  /** 0..1 — draws a partial fill of the card proportional to progress. */
  progress?: number;
  /** Render the card as a fully-filled "highlight" item (white text). */
  filled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Candy list item — a soft, rounded, colored pill card.
 * Layout: [chip] title / subtitle ......... [one action]
 */
export function ListItemCard({
  leading,
  title,
  subtitle,
  trailing,
  color = '#9fa8c9',
  progress,
  filled,
  onClick,
  className,
}: ListItemCardProps) {
  const Comp = onClick ? 'button' : 'div';
  const bg = filled ? color : tint(color);
  const pct = progress != null ? Math.max(0, Math.min(1, progress)) : null;

  return (
    <Comp
      onClick={onClick}
      className={cn(
        'relative w-full flex items-center gap-3 rounded-card p-3.5 text-left overflow-hidden shadow-card transition-transform duration-150',
        onClick && 'active:scale-[0.99]',
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {/* Partial progress fill (sits behind the content) */}
      {pct != null && (
        <div
          className="absolute inset-y-0 left-0 pointer-events-none transition-[width] duration-300"
          style={{ width: `${pct * 100}%`, backgroundColor: alpha(color, 0.22) }}
          aria-hidden
        />
      )}

      <div className="relative flex items-center gap-3 w-full min-w-0">
        {leading && <div className="flex-shrink-0">{leading}</div>}
        <div className="min-w-0 flex-1">
          <div className={cn('text-[15px] font-bold leading-tight truncate', filled ? 'text-ink' : 'text-ink')}>
            {title}
          </div>
          {subtitle && (
            <div className={cn('text-[13px] truncate mt-0.5', filled ? 'text-ink/80' : 'text-ink-2')}>{subtitle}</div>
          )}
        </div>
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </div>
    </Comp>
  );
}
