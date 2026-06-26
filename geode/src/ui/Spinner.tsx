import { cn } from '@/lib/cn';

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn('inline-block animate-spin rounded-full border-2 border-white/20 border-t-amethyst', className)}
      style={{ width: size, height: size }}
      aria-label="Loading"
      role="status"
    />
  );
}

/** Shimmer skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton animate-shimmer rounded-xl', className)} />;
}
