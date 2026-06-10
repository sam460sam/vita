import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && (
        <div className="mb-4 h-14 w-14 rounded-2xl bg-section border border-line flex items-center justify-center text-ink-3">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[16px] font-bold text-ink">{title}</h3>
      {description && (
        <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
