import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { chipTint } from '@/lib/color';

interface IconChipProps {
  children: ReactNode;
  /** Base color (hex). Container gets a soft tint, content the full color. */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-9 w-9 rounded-[12px]',
  md: 'h-11 w-11 rounded-2xl',
  lg: 'h-12 w-12 rounded-2xl',
} as const;

/** Rounded, tinted container for an emoji or icon (Design System §chip). */
export function IconChip({ children, color = '#9fa8c9', size = 'md', className }: IconChipProps) {
  return (
    <div
      className={cn('flex-shrink-0 flex items-center justify-center', sizes[size], className)}
      style={{ backgroundColor: chipTint(color), color }}
    >
      {children}
    </div>
  );
}
