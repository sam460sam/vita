import type { ReactNode } from 'react';

// Every empty state is an invitation to act, with one button (spec §4).
interface Props {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
      {icon && <div className="mb-4 text-dust">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-chalk">{title}</h3>
      {body && <p className="mt-1 max-w-xs text-sm text-dust">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
