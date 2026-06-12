import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Sheet, Button, BottomBar, useToast } from '@/ui';
import { VoiceCapture } from '@/ui/VoiceCapture';
import { DraftLinesEditor } from '@/features/ai/DraftLinesEditor';
import { useI18n } from '@/i18n';
import { listPriceBook } from '@/services/priceBook';
import { getProvider, OfflineQueuedError, type DraftLine } from '@/services/ai';
import { addItem } from '@/services/estimates';
import type { Project } from '@/data/types';

// Flow A (spec §6 M8): walk the site dictating, AI drafts estimate lines matched
// to the price book; unmatched lines flagged for pricing; all editable; then
// applied to the estimate on confirm.
export function VoiceEstimateSheet({ open, onClose, project, estimateId }: { open: boolean; onClose: () => void; project: Project; estimateId: string }) {
  const { lang } = useI18n();
  const toast = useToast();
  const [transcript, setTranscript] = useState('');
  const [lines, setLines] = useState<DraftLine[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function draft() {
    if (!transcript.trim()) return toast.show('Dictate or type first', 'signal');
    setBusy(true);
    try {
      const provider = await getProvider();
      const result = await provider.draftEstimate({ transcript, priceBook: await listPriceBook(true), locale: lang });
      setLines(result.items);
      if (result.items.length === 0) toast.show('No lines detected — add manually', 'signal');
    } catch (e) {
      toast.show(e instanceof OfflineQueuedError ? e.message : 'Draft failed', 'signal');
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!lines) return;
    for (const l of lines) {
      await addItem(estimateId, { description: l.description, qty: l.qty, unit: l.unit, unitPrice: l.unitPrice ?? 0, priceBookId: l.priceBookId ?? undefined });
    }
    toast.show(`Added ${lines.length} lines`, 'go');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Voice estimate"
      footer={
        <BottomBar>
          {lines ? (
            <Button className="w-full" onClick={apply} disabled={lines.length === 0}>
              Add {lines.length} lines to estimate
            </Button>
          ) : (
            <Button className="w-full" onClick={draft} disabled={busy}>
              <Sparkles size={18} /> {busy ? 'Drafting…' : 'Draft estimate'}
            </Button>
          )}
        </BottomBar>
      }
    >
      {!lines ? (
        <>
          <p className="mb-3 text-sm text-dust">Hold the button and describe the job at {project.siteAddress || 'the site'}.</p>
          <VoiceCapture value={transcript} onChange={setTranscript} placeholder="four hundred square feet of pavers, eight inch gravel base, two catch basins, fifty feet of edging…" />
        </>
      ) : (
        <DraftLinesEditor lines={lines} onChange={setLines} />
      )}
    </Sheet>
  );
}
