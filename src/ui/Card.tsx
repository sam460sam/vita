import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type CardVariant = 'base' | 'raised' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  variant?: CardVariant;
}

const cardVariants: Record<CardVariant, string> = {
  base:   'slab',
  raised: 'slab-raised',
  glass:  'slab-glass',
};

export function Card({ inset = true, variant = 'base', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card',
        cardVariants[variant],
        inset && 'p-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h2 className="text-[13px] font-bold text-ink-3 tracking-[0.06em] uppercase">{title}</h2>
      {action}
    </div>
  );
}

interface StatTileProps {
  label: string;
  value: ReactNode;
  unit?: string;
  accent?: string;
  icon?: ReactNode;
}

export function StatTile({ label, value, unit, accent, icon }: StatTileProps) {
  return (
    <div className="slab rounded-card p-3.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <span className="metric-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-2xl font-bold text-ink leading-none animate-count-up"
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-ink-3 font-medium">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Stat: eyebrow label + big mono number + optional glow ── */
interface StatProps {
  eyebrow: string;
  value: ReactNode;
  unit?: string;
  color?: string;
  className?: string;
}

export function Stat({ eyebrow, value, unit, color, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="metric-label">{eyebrow}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-3xl font-bold leading-none tracking-tight animate-count-up"
          style={color ? { color } : { color: 'var(--text-1)' }}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-ink-3 font-medium">{unit}</span>}
      </div>
    </div>
  );
}
