import { Trash2, AlertTriangle } from 'lucide-react';
import { Input, Select } from '@/ui';
import { ALL_UNITS } from '@/services/priceBook';
import { unitLabel } from '@/lib/format';
import type { DraftLine } from '@/services/ai';
import type { Unit } from '@/data/types';

// Editable AI draft — every line is correctable; unpriced lines are flagged in
// signal yellow (`needs_pricing`). AI never writes to the DB directly (spec §6).
export function DraftLinesEditor({ lines, onChange }: { lines: DraftLine[]; onChange: (lines: DraftLine[]) => void }) {
  function set(i: number, patch: Partial<DraftLine>) {
    onChange(lines.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  return (
    <div className="flex flex-col gap-2">
      {lines.map((l, i) => (
        <div
          key={i}
          className={'rounded-card border bg-asphalt p-3 ' + (l.needsPricing ? 'border-signal/60' : 'border-steel')}
        >
          <div className="mb-2 flex items-center gap-2">
            <Input value={l.description} onChange={(e) => set(i, { description: e.target.value })} className="flex-1" />
            <button onClick={() => onChange(lines.filter((_, idx) => idx !== i))} className="text-dust" aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input value={l.qty || ''} onChange={(e) => set(i, { qty: Number(e.target.value) })} type="number" inputMode="decimal" placeholder="Qty" />
            <Select value={l.unit} onChange={(e) => set(i, { unit: e.target.value as Unit })}>
              {ALL_UNITS.map((u) => (
                <option key={u} value={u}>
                  {unitLabel(u)}
                </option>
              ))}
            </Select>
            <Input
              value={l.unitPrice ?? ''}
              onChange={(e) => set(i, { unitPrice: e.target.value === '' ? null : Number(e.target.value), needsPricing: e.target.value === '' })}
              type="number"
              inputMode="decimal"
              placeholder="Price"
            />
          </div>
          {l.needsPricing && (
            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-signal">
              <AlertTriangle size={12} /> Needs pricing
            </div>
          )}
        </div>
      ))}
      {lines.length === 0 && <p className="py-4 text-center text-sm text-dust">No lines drafted.</p>}
    </div>
  );
}
