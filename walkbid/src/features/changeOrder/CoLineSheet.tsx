import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, PencilLine } from 'lucide-react';
import { useI18n, useT } from '@/i18n';
import { Sheet, Field, Input, Select, Button, BottomBar } from '@/ui';
import { listPriceBook, ALL_UNITS } from '@/services/priceBook';
import { unitLabel, money } from '@/lib/format';
import type { DraftCoItem } from '@/services/changeOrders';
import type { PriceBookItem, Unit } from '@/data/types';

// Returns a draft line (not persisted). Supports negative amounts for credits
// ("client downgraded" → −$800, like the Handoff change-order ledger).
export function CoLineSheet({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (item: DraftCoItem) => void }) {
  const t = useT();
  const { lang } = useI18n();
  const items = useLiveQuery(() => listPriceBook(true), []) ?? [];
  const [q, setQ] = useState('');
  const [custom, setCustom] = useState(false);
  const [picked, setPicked] = useState<PriceBookItem | null>(null);
  const [qty, setQty] = useState('1');

  const results = useMemo(
    () => items.filter((i) => `${i.code} ${i.description.en} ${i.description.es}`.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  function addPicked() {
    if (!picked) return;
    onAdd({ description: picked.description[lang] || picked.description.en, qty: Number(qty) || 0, unit: picked.unit, unitPrice: picked.unitPrice, priceBookId: picked.id });
    onClose();
  }

  if (custom) return <CustomCoLine open={open} onClose={() => setCustom(false)} onAdd={(d) => { onAdd(d); onClose(); }} />;

  if (picked) {
    return (
      <Sheet
        open={open}
        onClose={() => setPicked(null)}
        title={picked.description[lang] || picked.description.en}
        footer={
          <BottomBar>
            <Button className="w-full" onClick={addPicked}>
              {t('common.add')} · {money((Number(qty) || 0) * picked.unitPrice)}
            </Button>
          </BottomBar>
        }
      >
        <Field label={`Quantity (${unitLabel(picked.unit)})`} hint="negative for a credit">
          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" inputMode="decimal" autoFocus />
        </Field>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('common.add')}>
      <div className="relative mb-3">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-10" autoFocus />
      </div>
      <Button variant="secondary" className="mb-4 w-full" onClick={() => setCustom(true)}>
        <PencilLine size={18} /> Custom line
      </Button>
      <div className="flex flex-col gap-2">
        {results.map((i) => (
          <button key={i.id} onClick={() => setPicked(i)} className="flex items-center justify-between gap-3 rounded-btn border border-hairline bg-bg px-3 py-3 text-left active:bg-surface-2/60">
            <span className="truncate font-semibold text-ink">{i.description[lang] || i.description.en}</span>
            <span className="tnum shrink-0 text-sm text-ink">{money(i.unitPrice)}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function CustomCoLine({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (d: DraftCoItem) => void }) {
  const t = useT();
  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState<Unit>('ls');
  const [price, setPrice] = useState('');
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Custom line"
      footer={
        <BottomBar>
          <Button className="w-full" disabled={!desc.trim()} onClick={() => onAdd({ description: desc.trim(), qty: Number(qty) || 0, unit, unitPrice: Number(price) || 0 })}>
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
        <Field label={t('common.price')} hint="±">
          <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="decimal" />
        </Field>
      </div>
    </Sheet>
  );
}
