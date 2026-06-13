import type { ReactNode } from 'react';
import type { ProjectStatus } from '@/data/types';
import { cn } from '@/lib/cn';

// One accent per role: green = positive, amber = attention, red = wrong.
type Tone = 'neutral' | 'accent' | 'brand' | 'attention' | 'danger';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted',
  accent: 'bg-accent/15 text-accent',
  brand: 'border border-accent/40 text-accent', // outlined — "requested / sent"
  attention: 'bg-attention/15 text-attention',
  danger: 'bg-danger/15 text-danger',
};

export function Pill({ children, tone = 'neutral', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold', TONES[tone], className)}>
      {children}
    </span>
  );
}

const STATUS_TONE: Record<ProjectStatus, Tone> = {
  lead: 'neutral',
  quoted: 'attention',
  signed: 'accent',
  in_progress: 'attention',
  done: 'accent',
  disputed: 'danger',
};

export function statusTone(s: ProjectStatus): Tone {
  return STATUS_TONE[s];
}

const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-ink',
  accent: 'text-accent',
  brand: 'text-accent',
  attention: 'text-attention',
  danger: 'text-danger',
};

/** A small labelled metric: caption above, value below. */
export function StatBadge({ label, children, tone = 'neutral' }: { label: string; children: ReactNode; tone?: Tone }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-eyebrow uppercase text-muted">{label}</span>
      <span className={cn('tnum font-display text-base font-bold', TONE_TEXT[tone])}>{children}</span>
    </div>
  );
}
