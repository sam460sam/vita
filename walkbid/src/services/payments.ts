import { db, now, uid } from '@/data/db';
import { todayISO } from '@/lib/format';
import type { DueRule, ID, Payment, PaymentLabel } from '@/data/types';

export async function paymentsForProject(projectId: ID): Promise<Payment[]> {
  const rows = await db.payments.where('projectId').equals(projectId).toArray();
  return rows.sort((a, b) => a.sort - b.sort);
}

export async function createPayment(
  data: Pick<Payment, 'projectId' | 'label' | 'amount' | 'dueRule'> & Partial<Payment>,
): Promise<Payment> {
  const existing = await db.payments.where('projectId').equals(data.projectId).count();
  const payment: Payment = {
    id: uid('pay_'),
    projectId: data.projectId,
    label: data.label,
    amount: data.amount,
    dueRule: data.dueRule,
    status: data.status ?? 'pending',
    method: data.method,
    note: data.note,
    changeOrderId: data.changeOrderId,
    sort: data.sort ?? existing,
    createdAt: now(),
  };
  await db.payments.put(payment);
  return payment;
}

export async function updatePayment(id: ID, patch: Partial<Payment>): Promise<void> {
  const p = await db.payments.get(id);
  if (!p) return;
  await db.payments.put({ ...p, ...patch });
}

export async function deletePayment(id: ID): Promise<void> {
  await db.payments.delete(id);
}

export async function markRequested(id: ID): Promise<void> {
  await updatePayment(id, { status: 'requested', requestedAt: now() });
}

export async function markPaid(id: ID, method?: string): Promise<void> {
  const patch: Partial<Payment> = { status: 'paid', paidAt: now() };
  if (method) patch.method = method;
  await updatePayment(id, patch);
}

export async function markPending(id: ID): Promise<void> {
  await updatePayment(id, { status: 'pending', requestedAt: undefined, paidAt: undefined });
}

/** Auto-create an `extra` payment row for a signed change order (spec §6 M4). */
export async function createExtraForChangeOrder(projectId: ID, changeOrderId: ID, amount: number): Promise<Payment> {
  return createPayment({
    projectId,
    label: 'extra',
    amount,
    dueRule: { type: 'event', event: 'co_signed' },
    status: 'pending',
    changeOrderId,
  });
}

/** Replace the whole payment plan for a project (deposit/progress/final editor). */
export async function replacePlan(
  projectId: ID,
  rows: Array<{ label: PaymentLabel; amount: number; dueRule: DueRule }>,
): Promise<void> {
  await db.transaction('rw', db.payments, async () => {
    // Keep `extra` rows (they come from signed change orders); replace the rest.
    const extras = (await db.payments.where('projectId').equals(projectId).toArray()).filter((p) => p.label === 'extra');
    await db.payments.where('projectId').equals(projectId).delete();
    const base = rows.map((r, i) => ({
      id: uid('pay_'),
      projectId,
      label: r.label,
      amount: r.amount,
      dueRule: r.dueRule,
      status: 'pending' as const,
      sort: i,
      createdAt: now(),
    }));
    await db.payments.bulkPut([...base, ...extras.map((e, i) => ({ ...e, sort: base.length + i }))]);
  });
}

/**
 * Flip `pending`/`requested` date-due payments to `late` once their date has
 * passed. Computed on app open, never paid rows. Returns count flipped.
 */
export async function markOverduePayments(): Promise<number> {
  const today = todayISO();
  const all = await db.payments.toArray();
  let flipped = 0;
  for (const p of all) {
    if ((p.status === 'pending' || p.status === 'requested') && p.dueRule.type === 'date' && p.dueRule.date < today) {
      await db.payments.put({ ...p, status: 'late' });
      flipped++;
    }
  }
  return flipped;
}
