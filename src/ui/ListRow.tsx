import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ListRowProps {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
  muted?: boolean;
}

export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  className,
  muted,
}: ListRowProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 py-3 text-left',
        onClick && 'active:bg-section -mx-1.5 px-1.5 rounded-xl transition-colors cursor-pointer',
        className,
      )}
    >
      {leading && <div className="flex-shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'text-[15px] leading-tight truncate font-medium',
            muted ? 'text-ink-3 line-through' : 'text-ink',
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-[13px] text-ink-3 truncate mt-0.5">{subtitle}</div>
        )}
      </div>
      {trailing && <div className="flex-shrink-0 text-ink-3">{trailing}</div>}
    </Comp>
  );
}

export function Divider() {
  return <div className="h-px bg-divider my-0.5" />;
}
