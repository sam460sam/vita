import { money, moneyDelta, moneyWhole } from '@/lib/format';
import { cn } from '@/lib/cn';

interface Props {
  amount: number;
  /** Big glanceable headline (whole dollars, display font). */
  size?: 'sm' | 'md' | 'lg';
  whole?: boolean;
  className?: string;
}

const SIZES = {
  sm: 'text-[15px] font-semibold',
  md: 'text-xl font-bold',
  lg: 'text-money',
} as const;

/** Money is always the biggest thing on a card; tabular figures always. */
export function MoneyText({ amount, size = 'md', whole = false, className }: Props) {
  return (
    <span className={cn('tnum font-display text-chalk', SIZES[size], className)}>
      {whole ? moneyWhole(amount) : money(amount)}
    </span>
  );
}

/** Signed delta for change orders: +green / −risk. */
export function MoneyDelta({ amount, className }: { amount: number; className?: string }) {
  const color = amount > 0 ? 'text-go' : amount < 0 ? 'text-risk' : 'text-dust';
  return <span className={cn('tnum font-display font-bold', color, className)}>{moneyDelta(amount)}</span>;
}
