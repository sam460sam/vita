import type { ReactNode } from 'react';
import { VioCompanion } from './VioCompanion';

export function EmptyState({
  icon,
  mascot,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  /** Show the Vyta mascot in a warm bubble instead of a plain icon. */
  mascot?: boolean;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {mascot ? (
        <VioCompanion stage="germoglio" size={104} animated className="mb-3" />
      ) : icon ? (
        <div
          className="mb-3 h-16 w-16 rounded-3xl flex items-center justify-center text-ink-2 shadow-chip"
          style={{ background: 'linear-gradient(140deg, color-mix(in srgb, var(--c-hero-2) 55%, var(--c-card)), var(--c-card))' }}
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-[16px] font-bold text-ink">{title}</h3>
      {description && <p className="text-[13px] text-ink-2 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
