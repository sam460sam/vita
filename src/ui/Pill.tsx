import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';

interface PillProps {
  children: ReactNode;
  color?: string; // hex/css color for dot + tint
  className?: string;
  onClick?: () => void;
  active?: boolean;
}

export function Pill({ children, color, className, onClick, active }: PillProps) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 h-7 text-[13px] font-medium transition-colors',
        active ? 'bg-ink text-app' : 'bg-section text-ink-2',
        onClick && !active && 'hover:bg-divider',
        className,
      )}
    >
      {color && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </Comp>
  );
}

const priorityStyles = {
  low: { key: 'taskForm.priority.low', cls: 'bg-section text-ink-3' },
  medium: { key: 'taskForm.priority.medium', cls: 'bg-journal/10 text-journal' },
  high: { key: 'taskForm.priority.high', cls: 'bg-danger/10 text-danger' },
} as const;

export function PriorityBadge({ priority }: { priority: 'low' | 'medium' | 'high' }) {
  const t = useT();
  const s = priorityStyles[priority];
  return <span className={cn('inline-flex items-center rounded-full px-2 h-6 text-[12px] font-semibold', s.cls)}>{t(s.key)}</span>;
}
