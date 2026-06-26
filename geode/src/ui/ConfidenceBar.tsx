import { cn } from '@/lib/cn';

/** Horizontal confidence meter used on candidate rows. */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const tone = pct >= 70 ? 'bg-success' : pct >= 45 ? 'bg-warning' : 'bg-danger';
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/8', className)}>
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', tone)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
