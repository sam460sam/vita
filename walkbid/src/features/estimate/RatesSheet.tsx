import { useState } from 'react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Button, BottomBar } from '@/ui';
import { updateEstimate, recalcEstimate } from '@/services/estimates';
import type { Estimate } from '@/data/types';

export function RatesSheet({ open, onClose, estimate }: { open: boolean; onClose: () => void; estimate: Estimate }) {
  const t = useT();
  const [tax, setTax] = useState(String(estimate.taxRate * 100));
  const [markup, setMarkup] = useState(String(estimate.markupRate * 100));
  const [validUntil, setValidUntil] = useState(estimate.validUntil ?? '');

  async function save() {
    await updateEstimate(estimate.id, {
      taxRate: (Number(tax) || 0) / 100,
      markupRate: (Number(markup) || 0) / 100,
      validUntil: validUntil || undefined,
    });
    await recalcEstimate(estimate.id);
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tax & markup"
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            {t('common.save')}
          </Button>
        </BottomBar>
      }
    >
      <Field label="Markup (%)" hint="shown to you, hidden on the client PDF">
        <Input value={markup} onChange={(e) => setMarkup(e.target.value)} type="number" inputMode="decimal" />
      </Field>
      <Field label="Sales tax (%)" hint="treatment varies by state — confirm with your accountant">
        <Input value={tax} onChange={(e) => setTax(e.target.value)} type="number" inputMode="decimal" />
      </Field>
      <Field label="Valid until" hint={t('common.optional')}>
        <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} type="date" />
      </Field>
    </Sheet>
  );
}
