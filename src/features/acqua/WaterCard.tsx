import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Droplet, Minus, Pencil, Plus, X } from 'lucide-react';
import { db } from '@/data/db';
import { addWaterMl, updateSettings } from '@/data/repo';
import { Card, Sheet, Field, Input, Button } from '@/ui';
import { useT } from '@/i18n';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import type { Settings } from '@/data/types';

const WATER_COLOR = '#0EA5E9';
const MAX_QUICK_ADDS = 4;

function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
}

/** Short label for a quick-add button, e.g. 250 → "250 ml", 1000 → "1 L". */
export function formatWaterAmount(ml: number): string {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
  return `${ml} ml`;
}

/** The quick-add amounts to show, falling back to sensible defaults. */
export function quickAddAmounts(settings: Settings): number[] {
  const list = settings.water.quickAddMl;
  return list && list.length ? list : [settings.water.glassMl || 200, 500, 1000];
}

export function WaterCard({ settings }: { settings: Settings }) {
  const t = useT();
  const today = todayISO();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);
  const [editOpen, setEditOpen] = useState(false);

  const glassMl = settings.water.glassMl || 200;
  const goalMl = settings.water.dailyGoalMl || 2000;
  const amounts = quickAddAmounts(settings);
  const ml = log?.ml ?? 0;
  const progress = goalMl > 0 ? Math.min(1, ml / goalMl) : 0;
  const glasses = Math.round(ml / glassMl);

  function add(deltaMl: number) {
    platform.haptic();
    void addWaterMl(today, deltaMl);
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-4">
        {/* Visual fill droplet */}
        <div className="relative h-14 w-14 flex-shrink-0">
          <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--c-divider)" strokeWidth="5" />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={WATER_COLOR}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 24}
              strokeDashoffset={2 * Math.PI * 24 * (1 - progress)}
              style={{ transition: 'stroke-dashoffset 500ms ease' }}
            />
          </svg>
          <Droplet size={20} className="absolute inset-0 m-auto" style={{ color: WATER_COLOR }} fill={progress >= 1 ? WATER_COLOR : 'none'} />
        </div>

        <button onClick={() => setEditOpen(true)} className="min-w-0 flex-1 text-left">
          <div className="metric-label inline-flex items-center gap-1" style={{ color: WATER_COLOR }}>
            {t('water.today')} <Pencil size={11} className="opacity-60" />
          </div>
          <div className="text-xl font-semibold tnum text-ink mt-0.5">
            {formatLiters(ml)} <span className="text-ink-3 text-[15px] font-normal">/ {formatLiters(goalMl)}</span>
          </div>
          <div className="text-[12px] text-ink-2">{t('water.glassesCount', { n: glasses })}</div>
          {progress >= 1 && <div className="text-[12px] text-habit font-medium">{t('water.goalReached')}</div>}
        </button>

        {ml > 0 && (
          <button
            onClick={() => add(-glassMl)}
            aria-label="−"
            className="h-10 w-10 rounded-full bg-section text-ink-2 flex items-center justify-center active:bg-divider flex-shrink-0"
          >
            <Minus size={18} />
          </button>
        )}
      </div>

      {/* Customizable quick-add buttons */}
      <div className="flex gap-2 mt-3">
        {amounts.map((amt, i) => (
          <button
            key={i}
            onClick={() => add(amt)}
            className="flex-1 h-11 rounded-btn bg-section active:bg-divider flex items-center justify-center gap-1.5 text-[14px] font-semibold text-ink"
          >
            <Droplet size={16} style={{ color: WATER_COLOR }} /> +{formatWaterAmount(amt)}
          </button>
        ))}
      </div>

      <WaterGoalSheet open={editOpen} onClose={() => setEditOpen(false)} goalMl={goalMl} glassMl={glassMl} amounts={amounts} />
    </Card>
  );
}

function WaterGoalSheet({
  open,
  onClose,
  goalMl,
  glassMl,
  amounts,
}: {
  open: boolean;
  onClose: () => void;
  goalMl: number;
  glassMl: number;
  amounts: number[];
}) {
  const t = useT();
  const [goalL, setGoalL] = useState('2');
  const [glass, setGlass] = useState('200');
  const [quick, setQuick] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setGoalL(String(goalMl / 1000));
      setGlass(String(glassMl));
      setQuick(amounts.map(String));
    }
  }, [open, goalMl, glassMl, amounts]);

  function setAmount(i: number, v: string) {
    setQuick((q) => q.map((x, j) => (j === i ? v.replace(/[^0-9]/g, '') : x)));
  }
  function removeAmount(i: number) {
    setQuick((q) => q.filter((_, j) => j !== i));
  }
  function addAmount() {
    setQuick((q) => (q.length >= MAX_QUICK_ADDS ? q : [...q, '250']));
  }

  async function save() {
    const parsedQuick = quick.map((x) => parseInt(x, 10)).filter((n) => Number.isFinite(n) && n > 0);
    await updateSettings({
      water: {
        dailyGoalMl: Math.round((parseFloat(goalL) || 2) * 1000),
        glassMl: parseInt(glass, 10) || 200,
        quickAddMl: parsedQuick.length ? parsedQuick : [200, 500, 1000],
      },
    });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('water.title')} footer={<Button block size="lg" onClick={save}>{t('common.save')}</Button>}>
      <Field label={t('water.goal')}>
        <Input type="number" inputMode="decimal" value={goalL} onChange={(e) => setGoalL(e.target.value)} />
      </Field>
      <Field label={t('water.glassSize')}>
        <Input type="number" inputMode="numeric" value={glass} onChange={(e) => setGlass(e.target.value)} />
      </Field>

      <div className="mt-1">
        <div className="text-[13px] font-semibold text-ink-2 mb-1.5">{t('water.quickAdds')}</div>
        <div className="space-y-2">
          {quick.map((amt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-1.5">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={amt}
                  onChange={(e) => setAmount(i, e.target.value)}
                />
                <span className="text-[13px] text-ink-3">ml</span>
              </div>
              <button
                onClick={() => removeAmount(i)}
                aria-label={t('common.delete')}
                className="h-9 w-9 rounded-full bg-section text-ink-2 flex items-center justify-center active:bg-divider flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        {quick.length < MAX_QUICK_ADDS && (
          <button
            onClick={addAmount}
            className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-project"
          >
            <Plus size={15} /> {t('water.addAmount')}
          </button>
        )}
      </div>
    </Sheet>
  );
}
