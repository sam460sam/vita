import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionLabelProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionLabel({ children, action, className }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center justify-between px-1 mb-2', className)}>
      <span className="metric-label">{children}</span>
      {action && <span className="text-[12px] text-ink-3">{action}</span>}
    </div>
  );
}
