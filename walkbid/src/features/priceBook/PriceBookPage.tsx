import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search } from 'lucide-react';
import { useT, useI18n } from '@/i18n';
import { Screen } from '@/app/Screen';
import { Card, Input, IconButton, MoneyText } from '@/ui';
import { listPriceBook } from '@/services/priceBook';
import { unitLabel } from '@/lib/format';
import { PriceItemForm } from './PriceItemForm';
import type { PriceBookItem } from '@/data/types';

export function PriceBookPage() {
  const t = useT();
  const { lang } = useI18n();
  const items = useLiveQuery(() => listPriceBook(), []);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<PriceBookItem | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const groups = useMemo(() => {
    const filtered = (items ?? []).filter((i) => {
      const hay = `${i.code} ${i.description.en} ${i.description.es} ${i.trade}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    const byTrade = new Map<string, PriceBookItem[]>();
    for (const i of filtered) {
      const arr = byTrade.get(i.trade) ?? [];
      arr.push(i);
      byTrade.set(i.trade, arr);
    }
    return [...byTrade.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items, q]);

  return (
    <Screen
      title={t('nav.priceBook')}
      action={
        <IconButton label={t('common.add')} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus size={26} />
        </IconButton>
      }
    >
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dust" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-10" />
        </div>

        <div className="flex flex-col gap-5">
          {groups.map(([trade, rows]) => (
            <section key={trade}>
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-dust">{trade}</h3>
              <div className="flex flex-col gap-2">
                {rows.map((i) => (
                  <Card key={i.id} className="active:bg-graphite/70" onClick={() => { setEditing(i); setFormOpen(true); }}>
                    <div className="flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-chalk">{i.description[lang] || i.description.en}</div>
                        <div className="text-xs text-dust">
                          {i.code} · {unitLabel(i.unit)}
                          {i.isDefault && <span className="ml-2 text-signal">edit your prices</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <MoneyText amount={i.unitPrice} size="sm" />
                        <div className="text-[11px] text-dust">/{unitLabel(i.unit)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {formOpen && <PriceItemForm open={formOpen} onClose={() => setFormOpen(false)} existing={editing} />}
    </Screen>
  );
}
