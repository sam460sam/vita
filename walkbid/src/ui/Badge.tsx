import type { ReactNode } from 'react';
import type { ProjectStatus } from '@/data/types';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'safety' | 'signal' | 'go' | 'risk';

const TONES: Record<Tone, string> = {
  neutral: 'bg-steel text-dust',
  safety: 'bg-safety/15 text-safety',
  signal: 'bg-signal/15 text-signal',
  go: 'bg-go/15 text-go',
  risk: 'bg-risk/15 text-risk',
};

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  lead: 'neutral',
  quoted: 'signal',
  signed: 'safety',
  in_progress: 'safety',
  done: 'go',
  disputed: 'risk',
};

export function statusTone(s: ProjectStatus): Tone {
  return STATUS_TONE[s];
}

/** A small labelled metric: caption above, value below. */
export function StatBadge({ label, children, tone }: { label: string; children: ReactNode; tone?: Tone }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-dust">{label}</span>
      <span className={cn('tnum font-display text-base font-bold', tone ? TONES[tone].split(' ')[1] : 'text-chalk')}>{children}</span>
    </div>
  );
}
