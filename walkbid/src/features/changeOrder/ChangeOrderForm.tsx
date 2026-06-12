import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Trash2 } from 'lucide-react';
import { uid } from '@/data/db';
import { Sheet, Field, Input, Textarea, Button, BottomBar, useToast } from '@/ui';
import { PhotoStrip } from '@/ui/Photo';
import { MoneyDelta } from '@/ui/MoneyText';
import { money, qty as fmtQty, unitLabel } from '@/lib/format';
import { round2 } from '@/services/estimates';
import { createChangeOrder, type DraftCoItem } from '@/services/changeOrders';
import { takePhoto, photosForRef, deletePhoto } from '@/services/photos';
import { CoLineSheet } from './CoLineSheet';
import type { ChangeOrder, Project } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project;
  onCreated?: (co: ChangeOrder) => void;
}

// Manual change-order builder (M3/P1). Photos first, then describe, then lines.
// M8 flow B adds voice drafting + sign-on-the-spot on top of this.
export function ChangeOrderForm({ open, onClose, project, onCreated }: Props) {
  const toast = useToast();
  const coId = useMemo(() => uid('cho_'), []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<DraftCoItem[]>([]);
  const [lineOpen, setLineOpen] = useState(false);
  const photos = useLiveQuery(() => photosForRef('change_order', coId), [coId]) ?? [];

  const delta = round2(lines.reduce((s, l) => s + l.qty * l.unitPrice, 0));

  async function addPhoto() {
    const p = await takePhoto(project.id, 'change_order', coId);
    if (!p) toast.show('No photo captured', 'signal');
  }

  async function create() {
    if (!title.trim()) return toast.show('Add a title', 'signal');
    const co = await createChangeOrder({
      projectId: project.id,
      title,
      description,
      items: lines,
      photoIds: photos.map((p) => p.id),
    });
    toast.show('Change order created', 'go');
    onCreated?.(co);
    onClose();
  }

  return (
    <>
      <Sheet
        open={open && !lineOpen}
        onClose={onClose}
        title="New change order"
        footer={
          <BottomBar>
            <Button className="w-full" onClick={create}>
              Create · {money(delta)}
            </Button>
          </BottomBar>
        }
      >
        <Field label="Photos" hint="auto geotagged">
          <PhotoStrip photos={photos} onAdd={addPhoto} onRemove={(id) => deletePhoto(id)} />
        </Field>
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Extend patio 2 ft" autoFocus />
        </Field>
        <Field label="What changed">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Client asked to extend the patio along the east edge…" />
        </Field>

        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-dust">Line items</span>
          {lines.length > 0 && <MoneyDelta amount={delta} />}
        </div>
        <div className="mb-3 flex flex-col gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-btn border border-steel bg-asphalt px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-chalk">{l.description}</div>
                <div className="tnum text-xs text-dust">
                  {fmtQty(l.qty)} {unitLabel(l.unit)} × {money(l.unitPrice)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="tnum text-sm font-semibold text-chalk">{money(round2(l.qty * l.unitPrice))}</span>
                <button onClick={() => setLines((p) => p.filter((_, idx) => idx !== i))} className="text-dust" aria-label="Remove">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="secondary" className="w-full" onClick={() => setLineOpen(true)}>
          <Plus size={18} /> Add line
        </Button>
      </Sheet>

      {lineOpen && <CoLineSheet open={lineOpen} onClose={() => setLineOpen(false)} onAdd={(d) => setLines((p) => [...p, d])} />}
    </>
  );
}
