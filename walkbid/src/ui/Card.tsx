import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// Elevated surface: inset top-highlight + soft drop shadow = the "lifted" cue.
export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={cn('rounded-card border border-hairline bg-surface shadow-card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <h3 className="font-display text-eyebrow uppercase text-muted">{title}</h3>
      {action}
    </div>
  );
}
