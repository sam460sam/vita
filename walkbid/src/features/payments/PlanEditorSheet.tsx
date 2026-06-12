import { useState } from 'react';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Select, Button, BottomBar, useToast } from '@/ui';
import { money } from '@/lib/format';
import { round2 } from '@/services/estimates';
import { replacePlan } from '@/services/payments';
import { paymentLabel } from '@/services/paymentsLabels';
import type { DueRule, Payment, PaymentLabel } from '@/data/types';

interface Row {
  label: PaymentLabel;
  amount: string;
  due: DueWhen;
  date?: string;
}
type DueWhen = 'signature' | 'completion' | 'date';

function toDueRule(r: Row): DueRule {
  if (r.due === 'date' && r.date) return { type: 'date', date: r.date };
  return { type: 'event', event: r.due === 'completion' ? 'completion' : 'signature' };
}

function fromPayment(p: Payment): Row {
  const due: DueWhen = p.dueRule.type === 'date' ? 'date' : p.dueRule.event === 'completion' ? 'completion' : 'signature';
  return { label: p.label, amount: String(p.amount), due, date: p.dueRule.type === 'date' ? p.dueRule.date : undefined };
}

export function PlanEditorSheet({
  open,
  onClose,
  projectId,
  contractTotal,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  contractTotal: number;
  existing: Payment[];
}) {
  const t = useT();
  const toast = useToast();
  const seed = existing.filter((p) => p.label !== 'extra').map(fromPayment);
  const [rows, setRows] = useState<Row[]>(
    seed.length ? seed : [{ label: 'deposit', amount: '', due: 'signature' }, { label: 'final', amount: '', due: 'completion' }],
  );

  const sum = round2(rows.reduce((s, r) => s + (Number(r.amount) || 0), 0));

  function set(i: number, patch: Partial<Row>) {
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function quickSplit() {
    if (contractTotal <= 0) return toast.show('No contract total yet', 'signal');
    const deposit = round2(contractTotal * 0.3);
    setRows([
      { label: 'deposit', amount: String(deposit), due: 'signature' },
      { label: 'final', amount: String(round2(contractTotal - deposit)), due: 'completion' },
    ]);
  }

  async function save() {
    await replacePlan(
      projectId,
      rows
        .filter((r) => Number(r.amount) > 0)
        .map((r) => ({ label: r.label, amount: round2(Number(r.amount)), dueRule: toDueRule(r) })),
    );
    toast.show('Payment plan saved', 'go');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Payment plan"
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            {t('common.save')} · {money(sum)}
          </Button>
        </BottomBar>
      }
    >
      <div className="mb-3 flex items-center justify-between rounded-btn border border-steel bg-asphalt px-3 py-2 text-sm">
        <span className="text-dust">Contract total</span>
        <span className="tnum font-semibold text-chalk">{money(contractTotal)}</span>
      </div>
      <Button variant="secondary" className="mb-4 w-full" onClick={quickSplit}>
        <Wand2 size={16} /> 30% deposit + balance
      </Button>

      {rows.map((r, i) => (
        <div key={i} className="mb-3 rounded-card border border-steel bg-asphalt p-3">
          <div className="mb-2 flex items-center justify-between">
            <Select value={r.label} onChange={(e) => set(i, { label: e.target.value as PaymentLabel })} className="!min-h-0 w-auto border-0 bg-transparent px-0 font-display font-bold">
              {(['deposit', 'progress', 'final'] as PaymentLabel[]).map((l) => (
                <option key={l} value={l}>
                  {paymentLabel(l)}
                </option>
              ))}
            </Select>
            <button onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="text-dust" aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Amount">
              <Input value={r.amount} onChange={(e) => set(i, { amount: e.target.value })} type="number" inputMode="decimal" placeholder="0" />
            </Field>
            <Field label="Due">
              <Select value={r.due} onChange={(e) => set(i, { due: e.target.value as DueWhen })}>
                <option value="signature">On signing</option>
                <option value="completion">On completion</option>
                <option value="date">Specific date</option>
              </Select>
            </Field>
          </div>
          {r.due === 'date' && (
            <Field label="Date">
              <Input value={r.date ?? ''} onChange={(e) => set(i, { date: e.target.value })} type="date" />
            </Field>
          )}
        </div>
      ))}

      <Button variant="ghost" className="w-full" onClick={() => setRows((p) => [...p, { label: 'progress', amount: '', due: 'completion' }])}>
        <Plus size={16} /> Add payment
      </Button>
    </Sheet>
  );
}
