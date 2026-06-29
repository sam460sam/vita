import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ArrowDownRight, Scale, ChevronRight } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { it as itLocale, enUS } from 'date-fns/locale';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, EmptyState, Button, Segmented, LineChart } from '@/ui';
import { useI18n } from '@/i18n';
import type { WeightLog } from '@/data/types';
import { WeightForm } from './WeightForm';
import { bmi, changeOver, goalProgress, latest, projectedGoalDate, sortLogs, toDisplay } from './logic';

type Range = '90' | '180' | '365' | 'all';

export function WeightPage() {
  const { t, lang } = useI18n();
  const dfn = lang === 'it' ? itLocale : enUS;
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const logs = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const [range, setRange] = useState<Range>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WeightLog | null>(null);

  const s = settings ?? defaultSettings();
  const unit = s.body.unit;
  const sorted = sortLogs(logs ?? []);
  const cur = latest(logs ?? []);

  const chartPoints = useMemo(() => {
    let list = sorted;
    if (range !== 'all') {
      const from = subDays(new Date(), parseInt(range));
      list = sorted.filter((l) => parseISO(l.date) >= from);
    }
    return list.map((l) => ({ x: parseISO(l.date).getTime(), y: toDisplay(l.weightKg, unit) }));
  }, [sorted, range, unit]);

  const fmt = (kg: number) => `${(Math.round(toDisplay(kg, unit) * 10) / 10).toLocaleString()} ${unit}`;
  const b = cur ? bmi(cur.weightKg, s.body.heightCm) : null;
  const eta = projectedGoalDate(sorted, s.body.goalWeightKg);
  const prog = cur ? goalProgress(s, cur.weightKg) : 0;

  const changeRows: { key: string; days: number }[] = [
    { key: 'weight.3d', days: 3 },
    { key: 'weight.7d', days: 7 },
    { key: 'weight.14d', days: 14 },
    { key: 'weight.30d', days: 30 },
  ];

  const photos = sorted.filter((l) => l.photo).reverse();

  return (
    <>
      <PageHeader title={t('weight.title')} back="/attivita" />
      <Screen>
        {/* Current weight + goal */}
        <Card heroAccent="var(--c-project)" heroIcon={<Scale size={92} />} className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="metric-label">{t('weight.current')}</div>
              <div className="text-4xl font-bold tnum text-ink mt-1">{cur ? fmt(cur.weightKg) : '—'}</div>
            </div>
            <Button size="sm" icon={<ArrowRight size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              {t('weight.log')}
            </Button>
          </div>
          {s.body.goalWeightKg != null && s.body.startWeightKg != null && (
            <>
              <div className="mt-4 h-2 rounded-full bg-section overflow-hidden">
                <div className="h-full rounded-full bg-ink transition-all duration-500" style={{ width: `${Math.round(prog * 100)}%` }} />
              </div>
              <div className="flex justify-between text-[13px] text-ink-2 mt-2">
                <span>{t('weight.start')}: <span className="font-semibold text-ink">{fmt(s.body.startWeightKg)}</span></span>
                <span>{t('weight.goal')}: <span className="font-semibold text-ink">{fmt(s.body.goalWeightKg)}</span></span>
              </div>
              {eta && (
                <p className="text-[13px] text-ink-2 mt-2">
                  {t('weight.etaPrefix')} <span className="font-semibold text-ink">{format(eta, 'd MMM yyyy', { locale: dfn })}</span>.
                </p>
              )}
            </>
          )}
        </Card>

        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Scale size={22} />}
              title={t('weight.empty.title')}
              description={t('weight.empty.desc')}
              action={<Button onClick={() => setFormOpen(true)}>{t('weight.log')}</Button>}
            />
          </Card>
        ) : (
          <>
            {/* Progress chart */}
            <Card className="mb-4">
              <CardHeader
                title={t('weight.progress')}
                action={
                  s.body.goalWeightKg != null ? (
                    <span className="text-[13px] font-semibold text-ink">{t('weight.ofGoal', { pct: Math.round(prog * 100) })}</span>
                  ) : undefined
                }
              />
              <LineChart points={chartPoints} goal={s.body.goalWeightKg != null ? toDisplay(s.body.goalWeightKg, unit) : undefined} color="var(--c-ink)" axis unit={unit} />
              <Segmented
                className="w-full mt-3"
                value={range}
                onChange={setRange}
                options={[
                  { value: '90', label: '90D' },
                  { value: '180', label: '6M' },
                  { value: '365', label: '1Y' },
                  { value: 'all', label: t('weight.all') },
                ]}
              />
            </Card>

            {/* BMI — tappable, opens the detailed BMI page */}
            {b && (
              <Link to="/bmi">
                <Card className="mb-4 active:bg-section transition-colors">
                  <div className="flex items-center justify-between">
                    <CardHeader title={t('weight.bmi')} />
                    <ChevronRight size={18} className="text-ink-3 -mt-2" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tnum text-ink">{b.value}</span>
                    <span className="text-[14px] font-semibold" style={{ color: bmiColor(b.category) }}>{t(`weight.bmi.${b.category}` as never)}</span>
                  </div>
                  <div className="relative mt-3">
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="flex-1" style={{ background: '#60A5FA' }} />
                      <div className="flex-1" style={{ background: '#10B981' }} />
                      <div className="flex-1" style={{ background: '#F59E0B' }} />
                      <div className="flex-1" style={{ background: '#EF4444' }} />
                    </div>
                    <div
                      className="absolute -top-1 w-1 h-4 bg-ink rounded-full"
                      style={{ left: `${Math.max(0, Math.min(100, ((b.value - 15) / 25) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-ink-3 mt-1.5">
                    <span>18.5</span><span>25</span><span>30</span>
                  </div>
                </Card>
              </Link>
            )}

            {/* Changes */}
            <Card className="mb-4">
              <CardHeader title={t('weight.changes')} />
              <div className="divide-y divide-divider">
                {changeRows.map((r) => {
                  const ch = changeOver(sorted, r.days, unit);
                  return (
                    <div key={r.key} className="flex items-center justify-between py-2.5">
                      <span className="text-[14px] text-ink-2">{t(r.key as never)}</span>
                      <ChangeBadge value={ch} unit={unit} noChange={t('weight.noChange')} />
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Progress photos */}
            {photos.length > 0 && (
              <Card>
                <CardHeader title={t('weightForm.photo')} />
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {photos.map((l) => (
                    <button key={l.id} onClick={() => { setEditing(l); setFormOpen(true); }} className="flex-shrink-0">
                      <img src={l.photo} alt="" className="h-28 w-28 object-cover rounded-card" />
                      <div className="text-[11px] text-ink-2 mt-1 text-center">{format(parseISO(l.date), 'd MMM', { locale: dfn })}</div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </Screen>

      <WeightForm open={formOpen} onClose={() => setFormOpen(false)} settings={s} entry={editing} />
    </>
  );
}

function bmiColor(cat: string): string {
  return cat === 'under' ? '#60A5FA' : cat === 'healthy' ? '#10B981' : cat === 'over' ? '#F59E0B' : '#EF4444';
}

function ChangeBadge({ value, unit, noChange }: { value: number | null; unit: string; noChange: string }) {
  if (value == null || Math.abs(value) < 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-[13px] text-ink-3">
        <ArrowRight size={14} /> {noChange}
      </span>
    );
  }
  const up = value > 0;
  const v = `${up ? '+' : ''}${(Math.round(value * 10) / 10).toLocaleString()} ${unit}`;
  return (
    <span className="inline-flex items-center gap-1 text-[14px] font-semibold tnum" style={{ color: up ? 'var(--c-activity)' : 'var(--c-habit)' }}>
      {up ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />} {v}
    </span>
  );
}
