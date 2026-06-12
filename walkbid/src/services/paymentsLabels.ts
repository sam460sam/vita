import type { PaymentLabel, PaymentStatus } from '@/data/types';

// Display names in the contractor's vocabulary (spec §4). Kept here so PDFs and
// UI render labels identically.
const LABELS: Record<PaymentLabel, string> = {
  deposit: 'Deposit',
  progress: 'Progress payment',
  final: 'Final',
  extra: 'Extra (change order)',
};

export function paymentLabel(l: PaymentLabel): string {
  return LABELS[l];
}

const STATUS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  requested: 'Requested',
  paid: 'Paid',
  late: 'Late',
};

export function paymentStatusLabel(s: PaymentStatus): string {
  return STATUS[s];
}
