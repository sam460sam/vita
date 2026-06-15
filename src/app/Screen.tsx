import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Standard scrollable content area with bottom padding for the tab bar. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('max-w-3xl mx-auto px-4 pt-4 pb-28 md:pb-12 animate-rise', className)}>{children}</div>
  );
}
