import { Flame, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

/** 🔥 streak badge — "N Days". Shown top-right on counter/streak items. */
export function StreakBadge({ count, label, className }: { count: number; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-streak/12 px-2 h-6 text-[12px] font-bold tnum text-streak',
        className,
      )}
    >
      <Flame size={13} className="-ml-0.5" fill="currentColor" />
      {count}
      {label && <span className="font-semibold">{label}</span>}
    </span>
  );
}

/** Green round check — shown when an item is completed. */
export function CheckBadge({
  done,
  onClick,
  label,
  className,
}: {
  done: boolean;
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      aria-label={label}
      aria-pressed={onClick ? done : undefined}
      className={cn(
        'inline-flex items-center justify-center h-8 w-8 rounded-full transition-all duration-150 flex-shrink-0',
        done
          ? 'bg-check text-white shadow-[0_4px_12px_rgba(52,199,89,0.4)]'
          : 'bg-section text-ink-3 border border-line',
        onClick && 'active:scale-90',
        className,
      )}
    >
      <Check size={done ? 18 : 16} strokeWidth={3} className={done ? '' : 'opacity-50'} />
    </Comp>
  );
}

/** Round "+" increment button — for counter items. */
export function IncrementButton({
  onClick,
  color = 'var(--c-accent)',
  label,
  className,
}: {
  onClick?: () => void;
  color?: string;
  label?: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center h-8 w-8 rounded-full text-white active:scale-90 transition-transform flex-shrink-0',
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <Plus size={18} strokeWidth={3} />
    </button>
  );
}
