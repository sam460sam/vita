import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Wallet, Send, Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { EmptyState, Button, Card, MoneyText, MilestoneBar, Pill } from '@/ui';
import { dueLabel } from '@/lib/format';
import { paymentsForProject, markPaid, markPending } from '@/services/payments';
import { paymentLabel, paymentStatusLabel } from '@/services/paymentsLabels';
import { estimateForProject } from '@/services/estimates';
import { contractForProject } from '@/services/contracts';
import { haptic } from '@/platform/haptics';
import { PlanEditorSheet } from '@/features/payments/PlanEditorSheet';
import { RequestPaymentSheet } from '@/features/payments/RequestPaymentSheet';
import type { Payment, PaymentStatus, Project } from '@/data/types';

const TONE: Record<PaymentStatus, 'neutral' | 'safety' | 'go' | 'risk'> = {
  pending: 'neutral',
  requested: 'safety',
  paid: 'go',
  late: 'risk',
};

export function PaymentsTab({ project }: { project: Project }) {
  const payments = useLiveQuery(() => paymentsForProject(project.id), [project.id]);
  const estimate = useLiveQuery(() => estimateForProject(project.id), [project.id]);
  const contract = useLiveQuery(() => contractForProject(project.id), [project.id]);
  const [planOpen, setPlanOpen] = useState(false);
  const [requesting, setRequesting] = useState<Payment | null>(null);

  if (payments === undefined) return null;

  const contractTotal = contract?.status === 'signed' ? (estimate?.total ?? 0) : (estimate?.total ?? 0);

  if (payments.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Wallet size={36} />}
          title="No payment plan yet"
          body="Set deposit, progress payments and final balance to protect your margin."
          action={<Button onClick={() => setPlanOpen(true)}>Set up plan</Button>}
        />
        {planOpen && <PlanEditorSheet open={planOpen} onClose={() => setPlanOpen(false)} projectId={project.id} contractTotal={contractTotal} existing={[]} />}
      </>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <MilestoneBar payments={payments} />
      </div>

      <div className="mb-4 flex flex-col gap-2">
        {payments.map((p) => (
          <Card key={p.id}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-bold text-chalk">{paymentLabel(p.label)}</div>
                  <div className="text-xs text-dust">
                    {p.dueRule.type === 'date' ? dueLabel(p.dueRule.date) : p.dueRule.event === 'signature' ? 'On signing' : p.dueRule.event === 'co_signed' ? 'On change order' : 'On completion'}
                  </div>
                </div>
                <div className="text-right">
                  <MoneyText amount={p.amount} size="md" />
                  <div className="mt-1">
                    <Pill tone={TONE[p.status]}>{paymentStatusLabel(p.status)}</Pill>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {p.status !== 'paid' ? (
                  <>
                    <Button variant="secondary" className="flex-1" onClick={() => setRequesting(p)}>
                      <Send size={16} /> Request
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={async () => {
                        await markPaid(p.id);
                        await haptic('success');
                      }}
                    >
                      <Check size={16} /> Mark paid
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="text-dust" onClick={() => markPending(p.id)}>
                    <RotateCcw size={16} /> Undo paid
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="secondary" className="w-full" onClick={() => setPlanOpen(true)}>
        <SlidersHorizontal size={16} /> Edit plan
      </Button>

      {planOpen && <PlanEditorSheet open={planOpen} onClose={() => setPlanOpen(false)} projectId={project.id} contractTotal={contractTotal} existing={payments} />}
      {requesting && <RequestPaymentSheet open={!!requesting} onClose={() => setRequesting(null)} payment={requesting} />}
    </div>
  );
}
