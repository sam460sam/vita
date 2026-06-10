import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

export function Card({ inset = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-card border border-line',
        'shadow-card dark:shadow-none',
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
      <h2 className="text-[14px] font-bold text-ink tracking-[-0.01em] uppercase">{title}</h2>
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
    <div className="bg-card rounded-card border border-line shadow-card dark:shadow-none p-3.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <span className="metric-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className="font-display text-2xl font-bold tnum text-ink leading-none"
          style={accent ? { color: accent } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-ink-3 font-medium">{unit}</span>}
      </div>
    </div>
  );
}
