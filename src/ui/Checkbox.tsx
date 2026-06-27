import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: string;
  size?: number;
  label?: string;
}

/** Round check control, >=44px hit target. */
export function Checkbox({ checked, onChange, color = 'var(--c-ink)', size = 24, label }: CheckboxProps) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? 'Completa'}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className="inline-flex items-center justify-center h-11 w-11 -m-2.5 rounded-full"
    >
      <span
        className={cn('inline-flex items-center justify-center rounded-full border-2 transition-all duration-150')}
        style={{
          width: size,
          height: size,
          borderColor: checked ? color : 'var(--c-line)',
          background: checked ? color : 'transparent',
        }}
      >
        {checked && <Check size={size * 0.62} strokeWidth={3} className="text-ink" />}
      </span>
    </button>
  );
}
