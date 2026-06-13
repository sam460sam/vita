import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { Sheet, Field, Input, Button, BottomBar, useToast } from '@/ui';
import { buildPaymentMessage } from '@/services/documents';
import { markRequested } from '@/services/payments';
import { shareText } from '@/platform/share';
import type { Payment } from '@/data/types';

// "Request payment" → ready-to-send message (amount, project, payment
// instructions + optional pasted link) via the native share sheet (spec M4).
export function RequestPaymentSheet({ open, onClose, payment }: { open: boolean; onClose: () => void; payment: Payment }) {
  const toast = useToast();
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    buildPaymentMessage(payment, link).then(setMessage);
  }, [payment, link]);

  async function send() {
    await shareText(message, 'Payment request');
    await markRequested(payment.id);
    toast.show('Marked as requested', 'go');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Request payment"
      footer={
        <BottomBar>
          <Button className="w-full" onClick={send}>
            <Share2 size={18} /> Share request
          </Button>
        </BottomBar>
      }
    >
      <Field label="Payment link" hint="optional · Stripe / QuickBooks / Venmo">
        <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" inputMode="url" />
      </Field>
      <Field label="Message preview">
        <div className="tnum whitespace-pre-wrap rounded-card border border-hairline bg-bg p-3 text-sm text-ink">{message}</div>
      </Field>
    </Sheet>
  );
}
