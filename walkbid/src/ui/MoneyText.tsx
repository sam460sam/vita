import { money, moneyDelta, moneyWhole } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  amount: number;
  /** hero = screen totals (biggest), lg = card totals, md = line items. */
  size?: 'md' | 'lg' | 'hero';
  whole?: boolean;
  className?: string;
}

const SIZES = {
  md: 'text-[17px] font-bold',
  lg: 'text-money-lg',
  hero: 'text-money-hero',
} as const;

// Money is the hero on a money card; tabular figures always (A4).
export function MoneyText({ amount, size = 'md', whole = false, className }: Props) {
  return (
    <span className={cn('tnum font-display text-ink', SIZES[size], className)}>
      {whole ? moneyWhole(amount) : money(amount)}
    </span>
  );
}

/** Signed delta for change orders: +green / −danger. */
export function MoneyDelta({ amount, className }: { amount: number; className?: string }) {
  const color = amount > 0 ? 'text-accent' : amount < 0 ? 'text-danger' : 'text-muted';
  return <span className={cn('tnum font-display font-bold', color, className)}>{moneyDelta(amount)}</span>;
}
