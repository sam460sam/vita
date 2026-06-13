import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, PencilLine } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { Sheet, Field, Input, Select, Button, BottomBar } from '@/ui';
import { listPriceBook, ALL_UNITS } from '@/services/priceBook';
import { addItem, addItemFromPriceBook } from '@/services/estimates';
import { unitLabel, money } from '@/lib/format';
import { QtySheet } from './QtySheet';
import type { PriceBookItem, Unit } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  estimateId: string;
}

export function AddLineSheet({ open, onClose, estimateId }: Props) {
  const t = useT();
  const { lang } = useI18n();
  const items = useLiveQuery(() => listPriceBook(true), []) ?? [];
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState<PriceBookItem | null>(null);
  const [freeOpen, setFreeOpen] = useState(false);

  const results = useMemo(() => {
    const needle = q.toLowerCase();
    return items.filter((i) => `${i.code} ${i.description.en} ${i.description.es} ${i.trade}`.toLowerCase().includes(needle));
  }, [items, q]);

  async function confirmQty(qty: number) {
    if (picked) await addItemFromPriceBook(estimateId, picked, qty, lang);
    setPicked(null);
    onClose();
  }

  return (
    <>
      <Sheet open={open && !picked && !freeOpen} onClose={onClose} title={t('common.add')}>
        <div className="relative mb-3">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-10" autoFocus />
        </div>
        <Button variant="secondary" className="mb-4 w-full" onClick={() => setFreeOpen(true)}>
          <PencilLine size={18} /> Custom line
        </Button>
        <div className="flex flex-col gap-2">
          {results.map((i) => (
            <button
              key={i.id}
              onClick={() => setPicked(i)}
              className="flex items-center justify-between gap-3 rounded-btn border border-hairline bg-bg px-3 py-3 text-left active:bg-surface-2/60"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold text-ink">{i.description[lang] || i.description.en}</div>
                <div className="text-xs text-muted">{i.code} · {unitLabel(i.unit)}</div>
              </div>
              <div className="tnum shrink-0 text-sm font-semibold text-ink">{money(i.unitPrice)}</div>
            </button>
          ))}
        </div>
      </Sheet>

      {picked && (
        <QtySheet
          open={!!picked}
          onClose={() => setPicked(null)}
          unit={picked.unit}
          title={picked.description[lang] || picked.description.en}
          onConfirm={confirmQty}
        />
      )}

      {freeOpen && (
        <FreeLineForm
          open={freeOpen}
          onClose={() => setFreeOpen(false)}
          onAdd={async (d) => {
            await addItem(estimateId, d);
            setFreeOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

function FreeLineForm({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (d: { description: string; qty: number; unit: Unit; unitPrice: number }) => void;
}) {
  const t = useT();
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<Unit>('ea');
  const [price, setPrice] = useState('');

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Custom line"
      footer={
        <BottomBar>
          <Button
            className="w-full"
            disabled={!desc.trim()}
            onClick={() => onAdd({ description: desc.trim(), qty: Number(qty) || 0, unit, unitPrice: Number(price) || 0 })}
          >
            {t('common.add')}
          </Button>
        </BottomBar>
      }
    >
      <Field label="Description">
        <Input value={desc} onChange={(e) => setDesc(e.target.value)} autoFocus />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label={t('common.qty')}>
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" inputMode="decimal" />
        </Field>
        <Field label={t('common.unit')}>
          <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {ALL_UNITS.map((u) => (
              <option key={u} value={u}>
                {unitLabel(u)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('common.price')}>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="decimal" />
        </Field>
      </div>
    </Sheet>
  );
}
