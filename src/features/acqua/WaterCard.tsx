import { useLiveQuery } from 'dexie-react-hooks';
import { Droplet, Plus, Minus } from 'lucide-react';
import { db } from '@/data/db';
import { addWater } from '@/data/repo';
import { Card } from '@/ui';
import { useT } from '@/i18n';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import type { Settings } from '@/data/types';

const WATER_COLOR = '#0EA5E9';
// One "glass" ~ 250 ml; the +/- step for liters is 0.25 L.
const LITER_STEP = 0.25;

export function WaterCard({ settings }: { settings: Settings }) {
  const t = useT();
  const today = todayISO();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);

  const unit = settings.water.unit;
  const goal = settings.water.dailyGoal; // glasses, or liters target
  const amount = log?.amount ?? 0;
  const progress = goal > 0 ? Math.min(1, amount / goal) : 0;
  const step = unit === 'glass' ? 1 : LITER_STEP;

  function change(delta: number) {
    platform.haptic();
    void addWater(today, delta, unit);
  }

  const amountLabel =
    unit === 'glass'
      ? `${amount} / ${goal}`
      : `${amount.toFixed(2).replace(/\.00$/, '')} / ${goal} L`;

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

        <div className="min-w-0 flex-1">
          <div className="metric-label" style={{ color: WATER_COLOR }}>
            {t('water.today')}
          </div>
          <div className="text-xl font-semibold tnum text-ink mt-0.5">{amountLabel}</div>
          {progress >= 1 && <div className="text-[12px] text-habit font-medium">{t('water.goalReached')}</div>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => change(-step)}
            aria-label="−"
            disabled={amount <= 0}
            className="h-10 w-10 rounded-full bg-section text-ink-2 flex items-center justify-center active:bg-divider disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() => change(step)}
            aria-label={t('water.add')}
            className="h-11 w-11 rounded-full text-white flex items-center justify-center active:scale-95 transition-transform"
            style={{ background: WATER_COLOR }}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </Card>
  );
}
