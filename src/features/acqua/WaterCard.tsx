import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { Droplet, GlassWater, Minus, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import { addWaterMl } from '@/data/repo';
import { Card } from '@/ui';
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
  const navigate = useNavigate();
  const today = todayISO();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);

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
    <Card className="mb-4" style={{ background: 'linear-gradient(135deg, var(--c-card) 0%, var(--c-project-tint) 150%)' }}>
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

        <button onClick={() => navigate('/acqua')} className="min-w-0 flex-1 text-left">
          <div className="metric-label inline-flex items-center gap-1" style={{ color: WATER_COLOR }}>
            {t('water.today')} <ChevronRight size={12} className="opacity-70" />
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

      {/* Add buttons: glass or 1 liter */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => add(glassMl)}
          className="flex-1 h-11 rounded-btn bg-card shadow-card active:bg-section flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"
        >
          <GlassWater size={17} style={{ color: WATER_COLOR }} /> + {t('water.glass')}
        </button>
        <button
          onClick={() => add(1000)}
          className="flex-1 h-11 rounded-btn bg-card shadow-card active:bg-section flex items-center justify-center gap-2 text-[14px] font-semibold text-ink"
        >
          <Droplet size={17} style={{ color: WATER_COLOR }} /> + {t('water.liter')}
        </button>
      </div>
    </Card>
  );
}
