import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Select, Button, BottomBar, useToast } from '@/ui';
import { createPriceItem, updatePriceItem, deletePriceItem, ALL_UNITS } from '@/services/priceBook';
import { unitLabel, unitName } from '@/lib/format';
import type { PriceBookItem, Unit } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: PriceBookItem;
}

export function PriceItemForm({ open, onClose, existing }: Props) {
  const t = useT();
  const toast = useToast();
  const [trade, setTrade] = useState(existing?.trade ?? '');
  const [code, setCode] = useState(existing?.code ?? '');
  const [en, setEn] = useState(existing?.description.en ?? '');
  const [es, setEs] = useState(existing?.description.es ?? '');
  const [unit, setUnit] = useState<Unit>(existing?.unit ?? 'sf');
  const [price, setPrice] = useState(existing ? String(existing.unitPrice) : '');
  const [cost, setCost] = useState(existing?.cost != null ? String(existing.cost) : '');

  async function save() {
    if (!en.trim()) return toast.show(t('common.required'), 'risk');
    const description = { en: en.trim(), es: es.trim() || en.trim() };
    const unitPrice = Number(price) || 0;
    const costN = cost.trim() === '' ? undefined : Number(cost);
    if (existing) {
      await updatePriceItem(existing.id, { trade, code, description, unit, unitPrice, cost: costN });
    } else {
      await createPriceItem({ trade, code, description, unit, unitPrice, cost: costN });
    }
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={existing ? t('common.edit') : t('common.add')}
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            {t('common.save')}
          </Button>
        </BottomBar>
      }
    >
      <Field label="Description (English)">
        <Input value={en} onChange={(e) => setEn(e.target.value)} autoFocus />
      </Field>
      <Field label="Description (Español)" hint={t('common.optional')}>
        <Input value={es} onChange={(e) => setEs(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Trade">
          <Input value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="Pavers" />
        </Field>
        <Field label="Code" hint={t('common.optional')}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PV01" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('common.unit')}>
          <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {ALL_UNITS.map((u) => (
              <option key={u} value={u}>
                {unitLabel(u)} — {unitName(u)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Unit price (USD)">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="decimal" placeholder="0.00" />
        </Field>
      </div>
      <Field label="Internal cost" hint="optional · never shown to clients">
        <Input value={cost} onChange={(e) => setCost(e.target.value)} type="number" inputMode="decimal" />
      </Field>

      {existing && (
        <Button
          variant="ghost"
          className="w-full text-risk"
          onClick={async () => {
            await deletePriceItem(existing.id);
            onClose();
          }}
        >
          <Trash2 size={18} /> {t('common.delete')}
        </Button>
      )}
    </Sheet>
  );
}
