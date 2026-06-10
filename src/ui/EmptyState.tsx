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
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && (
        <div className="mb-3 h-16 w-16 rounded-3xl bg-section flex items-center justify-center text-ink-3 shadow-chip">
          {icon}
        </div>
      )}
      <h3 className="text-[16px] font-bold text-ink">{title}</h3>
      {description && <p className="text-[13px] text-ink-2 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
