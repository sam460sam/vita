import { cn } from '@/lib/cn';

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex p-1 bg-section rounded-[12px] gap-0.5',
        'border border-line',
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 h-[34px] px-3 rounded-[9px] text-[13px] font-semibold',
            'transition-all duration-150 whitespace-nowrap',
            value === o.value
              ? 'bg-card text-ink shadow-[0_1px_4px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.40)]'
              : 'text-ink-3 hover:text-ink-2',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
