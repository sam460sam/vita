import { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Sheet, Field, Input, Button, BottomBar } from '@/ui';
import { unitLabel } from '@/lib/format';
import { areaSF, cubicYardsFromSF, type AreaRow } from '@/lib/measure';
import { round2 } from '@/services/estimates';
import type { Unit } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  unit: Unit;
  title: string;
  initialQty?: number;
  onConfirm: (qty: number) => void;
}

// Quantity entry with a built-in SF calculator (L×W areas summed) and CY helper
// (area × depth-in → cubic yards). Plain number entry for every other unit.
export function QtySheet({ open, onClose, unit, title, initialQty = 0, onConfirm }: Props) {
  const [qty, setQty] = useState(initialQty ? String(initialQty) : '');
  const [calc, setCalc] = useState(false);
  const [rows, setRows] = useState<AreaRow[]>([{ l: 0, w: 0 }]);
  const [depth, setDepth] = useState('6'); // inches, for CY

  const showCalc = unit === 'sf' || unit === 'cy';
  const sf = areaSF(rows);
  const computed = unit === 'cy' ? cubicYardsFromSF(sf, Number(depth)) : sf;

  function setRow(i: number, patch: Partial<AreaRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function applyCalc() {
    setQty(String(computed));
    setCalc(false);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <BottomBar>
          <Button className="w-full" onClick={() => onConfirm(round2(Number(qty) || 0))} disabled={!qty}>
            {`Add ${qty || 0} ${unitLabel(unit)}`}
          </Button>
        </BottomBar>
      }
    >
      <Field label={`Quantity (${unitLabel(unit)})`}>
        <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" inputMode="decimal" autoFocus placeholder="0" />
      </Field>

      {showCalc && (
        <Button variant="secondary" className="mb-4 w-full" onClick={() => setCalc((v) => !v)}>
          <Calculator size={18} /> {unit === 'cy' ? 'Cubic-yard helper' : 'Square-foot calculator'}
        </Button>
      )}

      {showCalc && calc && (
        <div className="rounded-card border border-hairline bg-bg p-3">
          <p className="mb-2 text-xs text-muted">Enter areas in feet (L × W). They’re summed.</p>
          {rows.map((r, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <Input
                value={r.l || ''}
                onChange={(e) => setRow(i, { l: Number(e.target.value) })}
                type="number"
                inputMode="decimal"
                placeholder="L"
                className="flex-1"
              />
              <span className="text-muted">×</span>
              <Input
                value={r.w || ''}
                onChange={(e) => setRow(i, { w: Number(e.target.value) })}
                type="number"
                inputMode="decimal"
                placeholder="W"
                className="flex-1"
              />
              {rows.length > 1 && (
                <button onClick={() => setRows((p) => p.filter((_, idx) => idx !== i))} className="text-muted" aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setRows((p) => [...p, { l: 0, w: 0 }])} className="mb-3 flex items-center gap-1 text-sm font-semibold text-accent">
            <Plus size={16} /> Add area
          </button>

          {unit === 'cy' && (
            <Field label="Depth (inches)">
              <Input value={depth} onChange={(e) => setDepth(e.target.value)} type="number" inputMode="decimal" />
            </Field>
          )}

          <div className="flex items-center justify-between border-t border-hairline pt-3">
            <div className="text-sm text-muted">
              {unit === 'cy' ? `${sf} SF × ${depth}in` : 'Total area'}
            </div>
            <div className="tnum font-display text-lg font-bold text-ink">
              {computed} {unitLabel(unit)}
            </div>
          </div>
          <Button className="mt-3 w-full" onClick={applyCalc}>
            Use {computed} {unitLabel(unit)}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
