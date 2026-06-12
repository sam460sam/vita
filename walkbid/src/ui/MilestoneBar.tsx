import type { Payment, PaymentStatus } from '@/data/types';
import { cn } from '@/lib/cn';

// The signature element of the app (spec §4): a horizontal job-progress bar,
// each segment a payment milestone, colored by state. First thing the eye lands
// on. Yellow = unsigned money at risk.
const SEG_COLOR: Record<PaymentStatus, string> = {
  paid: 'bg-go',
  requested: 'bg-safety',
  late: 'bg-risk',
  pending: 'bg-signal',
};

interface Props {
  payments: Payment[];
  className?: string;
  height?: 'sm' | 'md';
}

export function MilestoneBar({ payments, className, height = 'md' }: Props) {
  const total = payments.reduce((s, p) => s + Math.max(0, p.amount), 0);
  const h = height === 'sm' ? 'h-2' : 'h-3';

  if (payments.length === 0 || total === 0) {
    return <div className={cn('w-full rounded-full bg-steel', h, className)} aria-hidden />;
  }

  return (
    <div
      className={cn('flex w-full overflow-hidden rounded-full bg-steel', h, className)}
      role="img"
      aria-label="Payment milestones"
    >
      {payments.map((p) => {
        const pct = (Math.max(0, p.amount) / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={p.id}
            className={cn('h-full border-r border-asphalt/60 last:border-r-0', SEG_COLOR[p.status])}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}
