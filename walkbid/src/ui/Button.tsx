import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  // Green is the only "do this / positive" color.
  primary: 'bg-accent text-on-accent active:bg-accent-press shadow-[0_6px_18px_-10px_rgba(47,190,122,0.7)]',
  secondary: 'bg-surface-2 text-ink border border-hairline active:bg-hairline',
  ghost: 'bg-transparent text-ink active:bg-surface-2',
  danger: 'bg-transparent text-danger border border-danger/40 active:bg-danger/10',
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
      className={cn('inline-flex h-touch w-touch items-center justify-center rounded-btn text-ink active:bg-surface-2', className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Full-width primary action docked to the bottom of a flow screen (A1/B2). */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-hairline bg-bg/95 px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-3 backdrop-blur">
      {children}
    </div>
  );
}
