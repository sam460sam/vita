import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  children: ReactNode;
}

export function Card({ glass, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card p-4',
        glass ? 'glass shadow-glass' : 'bg-card border border-line',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('px-1 text-[13px] font-semibold uppercase tracking-wider text-ink-3', className)}>
      {children}
    </h2>
  );
}
