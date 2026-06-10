import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'danger' | 'subtle';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  ghost:   'bg-transparent text-ink border border-line hover:bg-section active:bg-divider disabled:opacity-40 disabled:pointer-events-none transition-all duration-150',
  subtle:  'bg-section text-ink border border-transparent hover:bg-divider active:bg-line disabled:opacity-40 disabled:pointer-events-none transition-all duration-150',
  danger:  'bg-danger text-white border border-transparent hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150',
};

const sizes: Record<Size, string> = {
  sm: 'h-9    px-3.5 text-[13px] gap-1.5',
  md: 'h-11   px-4   text-[15px] gap-2',
  lg: 'h-[52px] px-5 text-[15px] font-bold gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-semibold select-none',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export function IconButton({ label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center h-11 w-11 rounded-full',
        'text-ink-2 hover:bg-section active:bg-divider transition-colors duration-150',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
