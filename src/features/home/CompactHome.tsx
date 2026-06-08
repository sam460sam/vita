import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Droplet, Scale, BookHeart } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, addWaterMl } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, ProgressRing, ActivityRings, StarMascot } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { todayISO, longDate } from '@/lib/format';
import { platform } from '@/platform/platform';
import { computeMomentum, stellaMood, momentumMessageKey } from '@/features/oggi/momentum';
import { todayRings, ringsToData } from '@/features/attivita/logic';
import { MODULE_LIST } from '@/features/personalizzazione/modules';
import { useModules } from '@/features/personalizzazione/prefs';
import { quickAddAmounts, formatWaterAmount } from '@/features/acqua/WaterCard';
import { useQuickAdd } from '@/app/QuickAdd';

const WATER = '#0EA5E9';

/** Unified, non-scrollable-friendly home: one cohesive page (no widget grid). */
export function CompactHome() {
  const t = useT();
  const navigate = useNavigate();
  const { openMenu } = useQuickAdd();
  const { enabled } = useModules();

  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const todayWater = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);

  const s = settings ?? defaultSettings();
  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? []);
  const rings = todayRings(workouts ?? [], s);
  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = todayWater?.ml ?? 0;
  const amounts = quickAddAmounts(s);

  function addWater(delta: number) {
    platform.haptic();
    void addWaterMl(todayISO(), delta);
  }

  const fmt = (n: number) => (n / 1000).toFixed(1);
  const shortcuts = MODULE_LIST.filter((mod) => enabled.includes(mod.id));

  return (
    <>
      <PageHeader title={greet(s.name, t)} subtitle={longDate()} />
      <Screen>
        {/* Momentum + activity rings */}
        <Card className="mb-3">
          <Link to="/recap" className="flex items-center gap-4">
            <ProgressRing progress={m.score / 100} size={84} stroke={8} color="var(--c-habit)">
              <StarMascot size={50} mood={stellaMood(m.score)} animated />
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <div className="metric-label" style={{ color: 'var(--c-habit)' }}>{t('momentum.title')}</div>
              <div className="text-3xl font-bold tnum text-ink leading-none mt-0.5">
                {m.score}<span className="text-ink-3 text-base font-semibold">/100</span>
              </div>
              <p className="text-[13px] text-ink-2 leading-snug mt-1 line-clamp-2">{t(momentumMessageKey(m.score) as TKey)}</p>
            </div>
          </Link>

          {enabled.includes('attivita') && (
            <Link to="/attivita" className="flex items-center gap-4 mt-4 pt-4 border-t border-divider">
              <ActivityRings rings={ringsToData(rings)} size={72} stroke={9} />
              <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                <RingStat label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} color="var(--c-activity)" />
                <RingStat label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} color="var(--c-habit)" />
                <RingStat label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} color="var(--c-project)" />
              </div>
            </Link>
          )}
        </Card>

        {/* Water + quick actions (unified) */}
        <Card className="mb-3">
          <div className="flex items-center gap-3">
            <ProgressRing progress={goalMl > 0 ? Math.min(1, ml / goalMl) : 0} size={54} stroke={6} color={WATER}>
              <Droplet size={18} style={{ color: WATER }} fill={ml >= goalMl ? WATER : 'none'} />
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <div className="metric-label" style={{ color: WATER }}>{t('water.today')}</div>
              <div className="text-xl font-semibold tnum text-ink mt-0.5">
                {fmt(ml)} <span className="text-ink-3 text-[15px] font-normal">/ {fmt(goalMl)} L</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {amounts.map((amt, i) => (
              <button
                key={i}
                onClick={() => addWater(amt)}
                className="flex-1 min-w-[28%] h-10 rounded-btn bg-section active:bg-divider inline-flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink"
              >
                <Droplet size={15} style={{ color: WATER }} /> +{formatWaterAmount(amt)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-divider">
            <QuickAction icon={Plus} label={t('common.add')} color="var(--c-habit)" onClick={openMenu} />
            <QuickAction icon={Scale} label={t('quick.weight')} color="var(--c-project)" onClick={() => navigate('/peso')} />
            <QuickAction icon={BookHeart} label={t('nav.journal')} color="var(--c-journal)" onClick={() => navigate('/diario')} />
          </div>
        </Card>

        {/* Section shortcuts */}
        <div className="grid grid-cols-4 gap-2">
          {shortcuts.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.id}
                to={mod.to}
                className="flex flex-col items-center gap-1.5 rounded-card bg-card border border-line/60 dark:border-transparent py-3 active:bg-section transition-colors"
              >
                <span className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${mod.accent}1a`, color: mod.accent }}>
                  <Icon size={18} />
                </span>
                <span className="text-[11px] font-medium text-ink-2 text-center leading-tight truncate max-w-full px-0.5">
                  {t(mod.shortKey ?? mod.labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </Screen>
    </>
  );
}

function RingStat({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div>
      <div className="metric-label truncate" style={{ color }}>{label}</div>
      <div className="text-[15px] font-semibold tnum text-ink leading-tight">
        {value}<span className="text-ink-3 text-[11px] font-normal">/{goal}</span>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, onClick }: { icon: typeof Plus; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="h-10 rounded-btn bg-section active:bg-divider flex items-center justify-center gap-1.5 px-2 min-w-0">
      <Icon size={16} style={{ color }} className="flex-shrink-0" />
      <span className="text-[12px] font-medium text-ink truncate">{label}</span>
    </button>
  );
}

function greet(name: string, t: (k: TKey) => string): string {
  const h = new Date().getHours();
  const base = t(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening');
  return name ? `${base}, ${name}` : base;
}
