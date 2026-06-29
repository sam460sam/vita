import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
  /** Turn the card into a warm premium "hero": a soft gradient of this color. */
  heroAccent?: string;
  /** Optional large faded icon in the corner of a hero card. */
  heroIcon?: ReactNode;
}

export function Card({ inset = true, className, heroAccent, heroIcon, style, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card shadow-card border border-line/40 dark:border-transparent',
        heroAccent ? 'relative overflow-hidden' : 'bg-card',
        inset && 'p-4',
        className,
      )}
      style={heroAccent ? { background: `linear-gradient(150deg, color-mix(in srgb, ${heroAccent} 18%, var(--c-card)), var(--c-card) 80%)`, ...style } : style}
      {...rest}
    >
      {children}
      {heroAccent && heroIcon && (
        <span className="pointer-events-none absolute -right-4 -bottom-5 opacity-[0.08]" style={{ color: heroAccent }} aria-hidden>
          {heroIcon}
        </span>
      )}
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
      <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
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
    <div className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-3.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        {icon && <span style={{ color: accent }}>{icon}</span>}
        <span className="metric-label">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold tnum text-ink leading-none" style={accent ? { color: accent } : undefined}>
          {value}
        </span>
        {unit && <span className="text-xs text-ink-3 font-medium">{unit}</span>}
      </div>
    </div>
  );
}
