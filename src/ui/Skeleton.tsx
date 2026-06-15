import { cn } from '@/lib/cn';

/** Shimmering placeholder block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-2xl bg-section animate-shimmer', className)} />;
}

/** Generic page loading placeholder used as the route Suspense fallback. */
export function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 pt-6 animate-rise" aria-busy="true">
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-12 w-full mb-3" />
      <Skeleton className="h-24 w-full mb-3" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
