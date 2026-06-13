import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Button, BottomBar } from '@/ui';
import { updateItem, deleteItem } from '@/services/estimates';
import { unitLabel } from '@/lib/format';
import type { EstimateItem } from '@/data/types';

export function EditLineSheet({ open, onClose, item }: { open: boolean; onClose: () => void; item: EstimateItem }) {
  const t = useT();
  const [desc, setDesc] = useState(item.description);
  const [qty, setQty] = useState(String(item.qty));
  const [price, setPrice] = useState(String(item.unitPrice));

  async function save() {
    await updateItem(item.id, { description: desc.trim(), qty: Number(qty) || 0, unitPrice: Number(price) || 0 });
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('common.edit')}
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            {t('common.save')}
          </Button>
        </BottomBar>
      }
    >
      <Field label="Description">
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={`${t('common.qty')} (${unitLabel(item.unit)})`}>
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" inputMode="decimal" />
        </Field>
        <Field label={`${t('common.price')} / ${unitLabel(item.unit)}`}>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="decimal" />
        </Field>
      </div>
      <Button
        variant="ghost"
        className="w-full text-danger"
        onClick={async () => {
          await deleteItem(item.id);
          onClose();
        }}
      >
        <Trash2 size={18} /> {t('common.delete')}
      </Button>
    </Sheet>
  );
}
