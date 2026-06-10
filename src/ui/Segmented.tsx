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
        'inline-flex bg-section rounded-[12px]',
        'border border-line',
        className,
      )}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex-1 h-[36px] px-3 text-[13px] font-semibold',
              'transition-colors duration-150 whitespace-nowrap',
              active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {o.label}
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full"
                style={{ backgroundColor: 'var(--c-primary)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
