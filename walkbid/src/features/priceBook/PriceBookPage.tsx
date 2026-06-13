import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, X } from 'lucide-react';
import { useT, useI18n } from '@/i18n';
import { Screen } from '@/app/Screen';
import { Card, Input, IconButton, MoneyText } from '@/ui';
import { listPriceBook } from '@/services/priceBook';
import { unitLabel } from '@/lib/format';
import { PriceItemForm } from './PriceItemForm';
import type { PriceBookItem } from '@/data/types';

const BANNER_KEY = 'walkbid.pricebook.bannerDismissed';

export function PriceBookPage() {
  const t = useT();
  const { lang } = useI18n();
  const items = useLiveQuery(() => listPriceBook(), []);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<PriceBookItem | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(BANNER_KEY) === '1';
    } catch {
      return false;
    }
  });

  const hasSeedDefaults = (items ?? []).some((i) => i.isDefault);

  function dismissBanner() {
    setBannerDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, '1');
    } catch {
      /* ignore */
    }
  }

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
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} className="pl-10" />
        </div>

        {hasSeedDefaults && !bannerDismissed && (
          <div className="mb-4 flex items-start gap-3 rounded-card border border-hairline bg-surface-2 p-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-attention" />
            <p className="flex-1 text-sm text-muted">
              These are <span className="font-semibold text-ink">starter prices</span>. Tap any item to set yours.
            </p>
            <button onClick={dismissBanner} aria-label="Dismiss" className="-m-1 p-1 text-muted active:text-ink">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-6">
          {groups.map(([trade, rows]) => (
            <section key={trade}>
              <h3 className="mb-2 text-eyebrow uppercase text-muted">{trade}</h3>
              <div className="flex flex-col gap-2">
                {rows.map((i) => (
                  <Card key={i.id} className="active:bg-surface-2" onClick={() => { setEditing(i); setFormOpen(true); }}>
                    <div className="flex items-center justify-between gap-3 p-3.5">
                      <div className="min-w-0">
                        <div className="font-display text-h2 leading-tight text-ink">{i.description[lang] || i.description.en}</div>
                        <div className="mt-0.5 text-xs text-muted">{i.code} · {unitLabel(i.unit)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-right">
                        {i.isDefault && <span className="h-2 w-2 rounded-full bg-attention" title="Starter price" />}
                        <div>
                          <MoneyText amount={i.unitPrice} size="md" />
                          <div className="text-[11px] text-muted">/{unitLabel(i.unit)}</div>
                        </div>
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
