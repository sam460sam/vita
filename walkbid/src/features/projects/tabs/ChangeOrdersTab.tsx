import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FilePlus2, Plus, Share2, Trash2, PenLine } from 'lucide-react';
import { EmptyState, Button, Card, Pill, MoneyText } from '@/ui';
import { MoneyDelta } from '@/ui/MoneyText';
import { money, moneyDelta, usDate } from '@/lib/format';
import { round2 } from '@/services/estimates';
import { changeOrdersForProject, deleteChangeOrder } from '@/services/changeOrders';
import { estimateForProject } from '@/services/estimates';
import { contractForProject } from '@/services/contracts';
import { getBlob } from '@/services/blobs';
import { shareFile } from '@/platform/share';
import { BRAND } from '@/config/brand';
import { ChangeOrderForm } from '@/features/changeOrder/ChangeOrderForm';
import { ChangeOrderSignSheet } from '@/features/changeOrder/ChangeOrderSignSheet';
import type { ChangeOrder, ChangeOrderStatus, Project } from '@/data/types';

const TONE: Record<ChangeOrderStatus, 'neutral' | 'attention' | 'accent' | 'danger'> = {
  draft: 'neutral',
  pending_signature: 'attention',
  signed: 'accent',
  refused: 'danger',
};
const LABEL: Record<ChangeOrderStatus, string> = {
  draft: 'Draft',
  pending_signature: 'Pending signature',
  signed: 'Signed',
  refused: 'Refused',
};

export function ChangeOrdersTab({ project }: { project: Project }) {
  const cos = useLiveQuery(() => changeOrdersForProject(project.id), [project.id]);
  const estimate = useLiveQuery(() => estimateForProject(project.id), [project.id]);
  const contract = useLiveQuery(() => contractForProject(project.id), [project.id]);
  const [formOpen, setFormOpen] = useState(false);
  const [signing, setSigning] = useState<ChangeOrder | null>(null);

  if (cos === undefined) return null;

  const initial = contract?.status === 'signed' ? estimate?.total ?? 0 : estimate?.total ?? 0;
  const signedDelta = cos.filter((c) => c.status === 'signed').reduce((s, c) => s + c.deltaTotal, 0);
  const updated = round2(initial + signedDelta);

  if (cos.length === 0) {
    return (
      <>
        <EmptyState
          icon={<FilePlus2 size={36} />}
          title="No change orders yet"
          body="Caught extra work? Photograph it, price it, and get it signed before you build it."
          action={<Button onClick={() => setFormOpen(true)}>New change order</Button>}
        />
        {formOpen && <ChangeOrderForm open={formOpen} onClose={() => setFormOpen(false)} project={project} />}
      </>
    );
  }

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="flex items-end justify-between p-4">
          <div>
            <div className="text-eyebrow uppercase text-muted">Initial total</div>
            <div className="tnum mt-0.5 text-sm text-muted">{money(initial)}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-eyebrow uppercase text-muted">Updated total</div>
            <div className="mt-0.5 flex items-center gap-2">
              {signedDelta !== 0 && (
                <span
                  className={
                    'tnum rounded-full px-2 py-0.5 text-xs font-bold ' +
                    (signedDelta > 0 ? 'bg-accent/15 text-accent' : 'bg-danger/15 text-danger')
                  }
                >
                  {moneyDelta(signedDelta)}
                </span>
              )}
              <MoneyText amount={updated} size="hero" />
            </div>
          </div>
        </div>
      </Card>

      <Button className="mb-4 w-full" onClick={() => setFormOpen(true)}>
        <Plus size={18} /> New change order
      </Button>

      <div className="flex flex-col gap-2">
        {cos.map((co) => (
          <Card key={co.id}>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-ink">{co.number}</span>
                    <Pill tone={TONE[co.status]}>{LABEL[co.status]}</Pill>
                  </div>
                  <div className="truncate text-sm text-ink">{co.title}</div>
                  <div className="text-xs text-muted">{usDate(co.createdAt)}{co.signedAt ? ` · signed by ${co.signerName}` : ''}</div>
                </div>
                <MoneyDelta amount={co.deltaTotal} />
              </div>

              <div className="mt-3 flex gap-2">
                {co.status !== 'signed' ? (
                  <>
                    <Button variant="primary" className="flex-1" onClick={() => setSigning(co)}>
                      <PenLine size={16} /> Sign on site
                    </Button>
                    <button onClick={() => deleteChangeOrder(co.id)} className="px-3 text-muted" aria-label="Delete">
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={async () => {
                      if (!co.pdfBlobId) return;
                      const rec = await getBlob(co.pdfBlobId);
                      if (rec) await shareFile(`${BRAND}_${co.number}_${project.title}.pdf`, rec.data, co.number);
                    }}
                  >
                    <Share2 size={16} /> Share signed PDF
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {formOpen && <ChangeOrderForm open={formOpen} onClose={() => setFormOpen(false)} project={project} />}
      {signing && <ChangeOrderSignSheet open={!!signing} onClose={() => setSigning(null)} changeOrder={signing} />}
    </div>
  );
}
