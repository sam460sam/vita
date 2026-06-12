import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'signal';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-safety text-asphalt active:bg-safety/90',
  secondary: 'bg-steel text-chalk active:bg-steel/80',
  ghost: 'bg-transparent text-chalk active:bg-steel/50',
  danger: 'bg-risk text-white active:bg-risk/90',
  signal: 'bg-signal text-asphalt active:bg-signal/90',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', className, children, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-btn px-4 font-display font-bold tracking-tight',
        'min-h-touch text-[15px] transition-colors disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

interface IconBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export function IconButton({ children, label, className, ...rest }: IconBtnProps) {
  return (
    <button
      aria-label={label}
      className={cn('inline-flex h-touch w-touch items-center justify-center rounded-btn text-chalk active:bg-steel/60', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Full-width primary action docked to the bottom of a flow screen (spec §4). */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-steel bg-asphalt/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur">
      {children}
    </div>
  );
}
