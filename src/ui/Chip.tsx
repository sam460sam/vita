import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Chip({ children, color, bg, size = 'sm', className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]',
        className,
      )}
      style={{
        color: color ?? 'var(--text-2)',
        background: bg ?? 'var(--surface-2)',
      }}
    >
      {children}
    </span>
  );
}
