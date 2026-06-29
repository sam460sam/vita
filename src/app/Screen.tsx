import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Standard scrollable content area with bottom padding for the tab bar.
 *  Carries the signature top "hero" wash so every section shares the same
 *  backdrop as Home / Habits. */
export function Screen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[300px]"
        style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 45%, transparent), transparent 70%)' }}
      />
      <div className={cn('relative max-w-3xl mx-auto px-4 pt-4 pb-28 md:pb-12 animate-rise', className)}>{children}</div>
    </div>
  );
}
