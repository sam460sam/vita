import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, Plus, Share2, Percent, FileSignature, Mic } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState, Button, Card, MoneyText, useToast } from '@/ui';
import { money, qty as fmtQty, unitLabel } from '@/lib/format';
import { estimateForProject, itemsForEstimate, getOrCreateEstimate, computeTotals, round2 } from '@/services/estimates';
import { shareEstimate } from '@/services/documents';
import { aiEnabled } from '@/services/ai';
import { AddLineSheet } from '@/features/estimate/AddLineSheet';
import { VoiceEstimateSheet } from '@/features/estimate/VoiceEstimateSheet';
import { EditLineSheet } from '@/features/estimate/EditLineSheet';
import { RatesSheet } from '@/features/estimate/RatesSheet';
import { ContractSignSheet } from '@/features/contract/ContractSignSheet';
import type { EstimateItem, Project } from '@/data/types';

export function EstimateTab({ project }: { project: Project }) {
  const t = useT();
  const toast = useToast();
  const estimate = useLiveQuery(() => estimateForProject(project.id), [project.id]);
  const items = useLiveQuery(() => (estimate ? itemsForEstimate(estimate.id) : Promise.resolve([])), [estimate?.id]) ?? [];
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<EstimateItem | null>(null);
  const [ratesOpen, setRatesOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const showAi = useLiveQuery(() => aiEnabled(), []) ?? false;

  if (estimate === undefined) return null;

  if (!estimate) {
    return (
      <EmptyState
        icon={<FileText size={36} />}
        title={t('empty.estimate')}
        body="Add lines from your price book or by voice (later)."
        action={<Button onClick={() => getOrCreateEstimate(project.id)}>Create estimate</Button>}
      />
    );
  }

  const totals = computeTotals(items, estimate.taxRate, estimate.markupRate);

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-muted">
          {estimate.number} · {estimate.status}
        </div>
        <button
          onClick={() => setRatesOpen(true)}
          className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-1.5 text-xs font-semibold text-ink active:bg-surface-2"
        >
          <Percent size={13} className="text-muted" /> Tax &amp; markup
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<FileText size={32} />} title="No lines yet" action={<Button onClick={() => setAddOpen(true)}><Plus size={18} /> Add line</Button>} />
      ) : (
        <Card className="mb-4">
          <div className="divide-y divide-hairline">
            {items.map((it) => (
              <button key={it.id} onClick={() => setEditing(it)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-surface/70">
                <div className="min-w-0">
                  <div className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink">{it.description}</div>
                  <div className="tnum mt-0.5 text-xs text-muted">
                    {fmtQty(it.qty)} {unitLabel(it.unit)} × {money(it.unitPrice)}
                  </div>
                </div>
                <div className="tnum shrink-0 font-semibold text-ink">{money(it.total)}</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {items.length > 0 && (
        <Card className="mb-4">
          <div className="flex flex-col gap-2 p-4">
            <Row label={t('common.subtotal')} value={money(totals.base)} />
            {estimate.markupRate > 0 && <Row label={`${t('common.markup')} (${round2(estimate.markupRate * 100)}%)`} value={money(totals.markupAmount)} muted hint="hidden on client PDF" />}
            {estimate.taxRate > 0 && <Row label={`${t('common.tax')} (${round2(estimate.taxRate * 100)}%)`} value={money(totals.taxAmount)} muted />}
            <div className="mt-1 flex items-center justify-between border-t border-hairline pt-3">
              <span className="font-display text-h2 text-ink">{t('common.total')}</span>
              <MoneyText amount={totals.total} size="hero" />
            </div>
          </div>
        </Card>
      )}

      <div className="mb-2 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(true)}>
          <Plus size={18} /> Add line
        </Button>
        {showAi && (
          <Button variant="secondary" className="flex-1" onClick={() => setVoiceOpen(true)}>
            <Mic size={18} /> Voice
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <>
          <Button
            className="mb-2 w-full"
            onClick={async () => {
              const ok = await shareEstimate(estimate);
              toast.show(ok ? 'Proposal ready' : 'Add company info in Settings', ok ? 'go' : 'attention');
            }}
          >
            <Share2 size={18} /> Share proposal PDF
          </Button>
          <Button variant="primary" className="w-full" onClick={() => setSignOpen(true)}>
            <FileSignature size={18} /> Convert to signed contract
          </Button>
        </>
      )}

      {addOpen && <AddLineSheet open={addOpen} onClose={() => setAddOpen(false)} estimateId={estimate.id} />}
      {voiceOpen && <VoiceEstimateSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} project={project} estimateId={estimate.id} />}
      {editing && <EditLineSheet open={!!editing} onClose={() => setEditing(null)} item={editing} />}
      {ratesOpen && <RatesSheet open={ratesOpen} onClose={() => setRatesOpen(false)} estimate={estimate} />}
      {signOpen && <ContractSignSheet open={signOpen} onClose={() => setSignOpen(false)} project={project} estimate={estimate} />}
    </div>
  );
}

function Row({ label, value, muted, hint }: { label: string; value: string; muted?: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'flex items-center text-sm text-muted' : 'flex items-center text-sm text-ink'}>
        {label}
        {hint && (
          <span className="ml-2 rounded-full bg-attention/15 px-2 py-0.5 text-[10px] font-semibold text-attention">{hint}</span>
        )}
      </span>
      <span className={'tnum ' + (muted ? 'text-muted' : 'font-semibold text-ink')}>{value}</span>
    </div>
  );
}
