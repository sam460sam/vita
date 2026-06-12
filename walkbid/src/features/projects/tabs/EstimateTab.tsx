import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, Plus, Share2, Percent, FileSignature } from 'lucide-react';
import { useT } from '@/i18n';
import { EmptyState, Button, Card, MoneyText, useToast } from '@/ui';
import { money, qty as fmtQty, unitLabel } from '@/lib/format';
import { estimateForProject, itemsForEstimate, getOrCreateEstimate, computeTotals, round2 } from '@/services/estimates';
import { shareEstimate } from '@/services/documents';
import { AddLineSheet } from '@/features/estimate/AddLineSheet';
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
        <div className="text-sm text-dust">
          {estimate.number} · {estimate.status}
        </div>
        <button onClick={() => setRatesOpen(true)} className="flex items-center gap-1 text-sm font-semibold text-safety">
          <Percent size={14} /> Tax & markup
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<FileText size={32} />} title="No lines yet" action={<Button onClick={() => setAddOpen(true)}><Plus size={18} /> Add line</Button>} />
      ) : (
        <Card className="mb-4">
          <div className="divide-y divide-steel">
            {items.map((it) => (
              <button key={it.id} onClick={() => setEditing(it)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-graphite/70">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-chalk">{it.description}</div>
                  <div className="tnum text-xs text-dust">
                    {fmtQty(it.qty)} {unitLabel(it.unit)} × {money(it.unitPrice)}
                  </div>
                </div>
                <div className="tnum shrink-0 font-semibold text-chalk">{money(it.total)}</div>
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
            <div className="mt-1 flex items-center justify-between border-t border-steel pt-3">
              <span className="font-display font-bold text-chalk">{t('common.total')}</span>
              <MoneyText amount={totals.total} size="lg" />
            </div>
          </div>
        </Card>
      )}

      <Button variant="secondary" className="mb-2 w-full" onClick={() => setAddOpen(true)}>
        <Plus size={18} /> Add line
      </Button>

      {items.length > 0 && (
        <>
          <Button
            className="mb-2 w-full"
            onClick={async () => {
              const ok = await shareEstimate(estimate);
              toast.show(ok ? 'Proposal ready' : 'Add company info in Settings', ok ? 'go' : 'signal');
            }}
          >
            <Share2 size={18} /> Share proposal PDF
          </Button>
          <Button variant="signal" className="w-full" onClick={() => setSignOpen(true)}>
            <FileSignature size={18} /> Convert to signed contract
          </Button>
        </>
      )}

      {addOpen && <AddLineSheet open={addOpen} onClose={() => setAddOpen(false)} estimateId={estimate.id} />}
      {editing && <EditLineSheet open={!!editing} onClose={() => setEditing(null)} item={editing} />}
      {ratesOpen && <RatesSheet open={ratesOpen} onClose={() => setRatesOpen(false)} estimate={estimate} />}
      {signOpen && <ContractSignSheet open={signOpen} onClose={() => setSignOpen(false)} project={project} estimate={estimate} />}
    </div>
  );
}

function Row({ label, value, muted, hint }: { label: string; value: string; muted?: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-sm text-dust' : 'text-sm text-chalk'}>
        {label}
        {hint && <span className="ml-2 text-[11px] text-dust">{hint}</span>}
      </span>
      <span className={'tnum ' + (muted ? 'text-dust' : 'font-semibold text-chalk')}>{value}</span>
    </div>
  );
}
