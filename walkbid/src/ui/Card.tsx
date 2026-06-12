import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div className={cn('rounded-card border border-steel bg-graphite', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-dust">{title}</h3>
      {action}
    </div>
  );
}
