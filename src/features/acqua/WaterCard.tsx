import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Droplet, GlassWater, Minus, Pencil } from 'lucide-react';
import { db } from '@/data/db';
import { addWaterMl, updateSettings } from '@/data/repo';
import { Card, Sheet, Field, Input, Button } from '@/ui';
import { useT } from '@/i18n';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import type { Settings } from '@/data/types';

const WATER_COLOR = '#0EA5E9';

function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L`;
}

export function WaterCard({ settings }: { settings: Settings }) {
  const t = useT();
  const today = todayISO();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);
  const [editOpen, setEditOpen] = useState(false);

  const glassMl = settings.water.glassMl || 200;
  const goalMl = settings.water.dailyGoalMl || 2000;
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

      {/* Add buttons: glass, 500 ml or 1 liter */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => add(glassMl)}
          className="flex-1 h-11 rounded-btn bg-section active:bg-divider flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"
        >
          <GlassWater size={17} style={{ color: WATER_COLOR }} /> + {t('water.glass')}
        </button>
        <button
          onClick={() => add(500)}
          className="flex-1 h-11 rounded-btn bg-section active:bg-divider flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"
        >
          <Droplet size={17} style={{ color: WATER_COLOR }} /> + {t('water.halfLiter')}
        </button>
        <button
          onClick={() => add(1000)}
          className="flex-1 h-11 rounded-btn bg-section active:bg-divider flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"
        >
          <Droplet size={17} style={{ color: WATER_COLOR }} /> + {t('water.liter')}
        </button>
      </div>

      <WaterGoalSheet open={editOpen} onClose={() => setEditOpen(false)} goalMl={goalMl} glassMl={glassMl} />
    </Card>
  );
}

function WaterGoalSheet({ open, onClose, goalMl, glassMl }: { open: boolean; onClose: () => void; goalMl: number; glassMl: number }) {
  const t = useT();
  const [goalL, setGoalL] = useState('2');
  const [glass, setGlass] = useState('200');

  useEffect(() => {
    if (open) {
      setGoalL(String(goalMl / 1000));
      setGlass(String(glassMl));
    }
  }, [open, goalMl, glassMl]);

  async function save() {
    await updateSettings({
      water: { dailyGoalMl: Math.round((parseFloat(goalL) || 2) * 1000), glassMl: parseInt(glass) || 200 },
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
    </Sheet>
  );
}
