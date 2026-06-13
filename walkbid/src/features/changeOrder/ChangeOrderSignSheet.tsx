import { useRef, useState } from 'react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Button, BottomBar, useToast } from '@/ui';
import { SignaturePad, type SignatureHandle } from '@/ui/SignaturePad';
import { SIGN_BANNER } from '@/services/pdf/sections';
import { signChangeOrder } from '@/services/changeOrders';
import { currentGeo } from '@/platform/geo';
import { haptic } from '@/platform/haptics';
import type { ChangeOrder } from '@/data/types';

// Hand the phone to the client → sign on the spot (M8 flow B; same pipeline as
// the contract). Auto-creates the `extra` payment row on success.
export function ChangeOrderSignSheet({ open, onClose, changeOrder }: { open: boolean; onClose: () => void; changeOrder: ChangeOrder }) {
  const t = useT();
  const toast = useToast();
  const handle = useRef<SignatureHandle | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Client');
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sign() {
    if (!signerName.trim()) return toast.show('Signer name ' + t('common.required').toLowerCase(), 'danger');
    const png = await handle.current?.toPngBlob();
    if (!png) return toast.show('Please sign above', 'attention');
    setBusy(true);
    try {
      const geo = await currentGeo();
      await signChangeOrder(changeOrder.id, { signerName: signerName.trim(), signerRole: signerRole.trim(), signaturePng: png, geo });
      await haptic('success');
      toast.show('Change order signed', 'go');
      onClose();
    } catch (e) {
      toast.show((e as Error).message, 'danger');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Sign ${changeOrder.number}`}
      footer={
        <BottomBar>
          <Button className="w-full" onClick={sign} disabled={busy || !hasInk}>
            {busy ? 'Signing…' : 'Sign & save'}
          </Button>
        </BottomBar>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Signer name">
          <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} autoFocus />
        </Field>
        <Field label="Role">
          <Input value={signerRole} onChange={(e) => setSignerRole(e.target.value)} />
        </Field>
      </div>
      <Field label="Signature">
        <SignaturePad handleRef={handle} onChange={setHasInk} />
      </Field>
      <p className="text-[11px] leading-snug text-muted">{SIGN_BANNER}</p>
    </Sheet>
  );
}
