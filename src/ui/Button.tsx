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
  primary: 'bg-[linear-gradient(180deg,#125A3B,#0B3925)] text-on-primary shadow-glow hover:brightness-[1.06] active:scale-[0.985] active:brightness-90',
  ghost: 'bg-transparent text-ink hover:bg-section active:bg-divider',
  subtle: 'bg-section text-ink hover:bg-divider active:bg-line',
  danger: 'bg-danger text-white hover:opacity-90 active:scale-[0.97]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-[52px] px-6 text-[16px] gap-2',
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
        'inline-flex items-center justify-center rounded-full font-bold transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none select-none',
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
        'inline-flex items-center justify-center h-11 w-11 rounded-full text-ink-2 hover:bg-section active:bg-divider transition-colors duration-150',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
