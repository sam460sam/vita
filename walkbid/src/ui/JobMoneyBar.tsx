import type { Payment, PaymentStatus } from '@/data/types';
import { cn } from '@/lib/cn';

// The signature element (redesign B2): the at-a-glance financial truth of a
// job. One horizontal bar; each segment is a payment milestone, width
// proportional to its amount, color by state. Render ONCE per screen.
const SEG_COLOR: Record<PaymentStatus, string> = {
  paid: 'bg-accent', // money in
  requested: 'bg-brand', // asked, not yet paid
  pending: 'bg-attention', // unsigned money at risk
  late: 'bg-danger', // overdue
};

interface Props {
  payments: Payment[];
  className?: string;
  height?: 'sm' | 'md';
}

export function JobMoneyBar({ payments, className, height = 'md' }: Props) {
  const total = payments.reduce((s, p) => s + Math.max(0, p.amount), 0);
  const h = height === 'sm' ? 'h-2' : 'h-2.5';

  if (payments.length === 0 || total === 0) {
    return <div className={cn('w-full rounded-full bg-surface-2', h, className)} aria-hidden />;
  }

  return (
    <div className={cn('flex w-full items-stretch gap-1', h, className)} role="img" aria-label="Job money">
      {payments.map((p) => {
        const pct = (Math.max(0, p.amount) / total) * 100;
        if (pct <= 0) return null;
        return (
          <div
            key={p.id}
            className={cn('h-full rounded-full', SEG_COLOR[p.status])}
            style={{ width: `${pct}%` }}
            title={`${p.label}: ${Math.round(p.amount).toLocaleString()}`}
          />
        );
      })}
    </div>
  );
}
