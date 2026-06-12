import { useRef, useState } from 'react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Button, BottomBar, useToast } from '@/ui';
import { SignaturePad, type SignatureHandle } from '@/ui/SignaturePad';
import { SIGN_BANNER } from '@/services/pdf/sections';
import { signContract } from '@/services/contracts';
import { currentGeo } from '@/platform/geo';
import { haptic } from '@/platform/haptics';
import type { Estimate, Project } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  estimate: Estimate;
  onSigned?: () => void;
}

// Shared signing pipeline (M3) — also reused by change orders (M8 flow B).
export function ContractSignSheet({ open, onClose, project, estimate, onSigned }: Props) {
  const t = useT();
  const toast = useToast();
  const handle = useRef<SignatureHandle | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Client');
  const [hasInk, setHasInk] = useState(false);
  const [busy, setBusy] = useState(false);

  async function sign() {
    if (!signerName.trim()) return toast.show('Signer name ' + t('common.required').toLowerCase(), 'risk');
    const png = await handle.current?.toPngBlob();
    if (!png) return toast.show('Please sign above', 'signal');
    setBusy(true);
    try {
      const geo = await currentGeo();
      await signContract(project.id, { estimate, signerName: signerName.trim(), signerRole: signerRole.trim(), signaturePng: png, geo });
      await haptic('success');
      toast.show('Contract signed', 'go');
      onSigned?.();
      onClose();
    } catch (e) {
      toast.show((e as Error).message, 'risk');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Sign contract"
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
          <Input value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Adam Appleseed" autoFocus />
        </Field>
        <Field label="Role">
          <Input value={signerRole} onChange={(e) => setSignerRole(e.target.value)} />
        </Field>
      </div>
      <Field label="Signature">
        <SignaturePad handleRef={handle} onChange={setHasInk} />
      </Field>
      <p className="text-[11px] leading-snug text-dust">{SIGN_BANNER}</p>
    </Sheet>
  );
}
