import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Trash2, Pencil, Scale, ChevronRight, Footprints } from 'lucide-react';
import { db } from '@/data/db';
import { deleteWorkout, updateSettings } from '@/data/repo';
import { readSettings } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import {
  ActivityRings,
  BarChart,
  Button,
  Card,
  CardHeader,
  EmptyState,
  IconButton,
  Segmented,
  Sheet,
  Field,
  Input,
} from '@/ui';
import { formatDistance, formatDuration, activeDfnLocale } from '@/lib/format';
import { format, parseISO } from 'date-fns';
import { todayRings, ringsToData, summarize, mergeHealthRings } from './logic';
import { useHealthSummary, useWeeklySteps } from '@/platform/health';
import { getSport, type Sport } from './sports';
import { SportPicker } from './SportPicker';
import { WorkoutTracker } from './WorkoutTracker';
import { HealthCard } from './HealthCard';
import { defaultSettings } from '@/data/defaults';
import { useT } from '@/i18n';

export function ActivityPage() {
  const t = useT();
  const workouts = useLiveQuery(() => db.workouts.orderBy('startedAt').reverse().toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const [params, setParams] = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [activeSport, setActiveSport] = useState<Sport | null>(null);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [goalsOpen, setGoalsOpen] = useState(false);

  // Quick-add deep link: /attivita?start=1 opens the sport picker.
  useEffect(() => {
    if (params.get('start') === '1') {
      setPickerOpen(true);
      params.delete('start');
      setParams(params, { replace: true });
    }
  }, [params, setParams]);

  const s = settings ?? defaultSettings();
  const healthSummary = useHealthSummary();
  const weekSteps = useWeeklySteps();
  const rings = mergeHealthRings(todayRings(workouts ?? [], s), healthSummary);
  const summary = summarize(workouts ?? [], period);

  const weightLogs = useLiveQuery(() => db.weightLogs.orderBy('date').reverse().limit(1).toArray(), [], []);
  const lastWeight = weightLogs?.[0];
  const weightSubtitle = lastWeight
    ? `${Math.round((s.body.unit === 'lb' ? lastWeight.weightKg * 2.20462 : lastWeight.weightKg) * 10) / 10} ${s.body.unit}`
    : t('weight.empty.title');

  return (
    <>
      <PageHeader
        title={t('activity.title')}
        action={
          <Button size="sm" icon={<Play size={16} />} onClick={() => setPickerOpen(true)}>
            {t('activity.start')}
          </Button>
        }
      />
      <Screen>
        {/* Rings hero */}
        <div className="rounded-card shadow-card flex flex-col items-center pt-6 pb-5 px-4 mb-4 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, color-mix(in srgb, var(--c-activity) 18%, var(--c-card)), var(--c-card) 80%)' }}>
          <IconButton label={t('common.edit')} className="absolute top-2 right-2" onClick={() => setGoalsOpen(true)}>
            <Pencil size={16} />
          </IconButton>
          <ActivityRings rings={ringsToData(rings)} />
          <div className="grid grid-cols-3 gap-4 w-full mt-5">
            <RingStat label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} unit={t('activity.unit.kcal')} color="var(--c-activity)" />
            <RingStat label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} unit={t('activity.unit.min')} color="var(--c-habit)" />
            <RingStat label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} unit={t('activity.unit.hours')} color="var(--c-project)" />
          </div>
        </div>

        {/* Steps (from Apple Health / Health Connect when connected) */}
        {weekSteps && weekSteps.some((d) => d.value > 0) && <StepsCard data={weekSteps} />}

        {/* Weight tracker entry */}
        <Link to="/peso">
          <Card className="flex items-center gap-3 mb-4 active:bg-section transition-colors">
            <span className="h-11 w-11 rounded-2xl bg-project-tint flex items-center justify-center text-project flex-shrink-0">
              <Scale size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-ink">{t('weight.title')}</div>
              <div className="text-[13px] text-ink-2">{weightSubtitle}</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </Card>
        </Link>

        {/* Apple Health / Health Connect */}
        <HealthCard />

        {/* Summary */}
        <Card className="mb-4">
          <CardHeader
            title={t('activity.summary')}
            action={
              <Segmented
                value={period}
                onChange={setPeriod}
                options={[
                  { value: 'week', label: t('activity.period.week') },
                  { value: 'month', label: t('activity.period.month') },
                ]}
              />
            }
          />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <MiniStat label={t('activity.summary.workouts')} value={summary.count} />
            <MiniStat label={t('activity.summary.minutes')} value={summary.totalMin} />
            <MiniStat label={t('activity.summary.kcal')} value={summary.totalKcal} />
          </div>
          <BarChart data={summary.daily.map((d) => ({ label: d.label, value: d.min }))} color="var(--c-activity)" unit={t('activity.unit.min')} />
        </Card>

        {/* History */}
        <Card>
          <CardHeader title={t('activity.history')} />
          {workouts && workouts.length > 0 ? (
            <div className="divide-y divide-divider">
              {workouts.map((w) => {
                const sport = getSport(w.sportId);
                const Icon = sport.icon;
                return (
                  <div key={w.id} className="flex items-center gap-3 py-3 group">
                    <span className="h-11 w-11 rounded-2xl bg-activity-tint flex items-center justify-center text-activity flex-shrink-0">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-medium text-ink truncate">{sport.name}</div>
                      <div className="text-[13px] text-ink-2">
                        {format(new Date(w.startedAt), 'd MMM · HH:mm', { locale: activeDfnLocale() })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-semibold tnum text-ink">{formatDuration(w.durationSec)}</div>
                      <div className="text-[12px] text-ink-2 tnum">
                        {w.activeKcal} {t('activity.unit.kcal')}{w.distanceM ? ` · ${formatDistance(w.distanceM)}` : ''}
                      </div>
                    </div>
                    <IconButton label={t('common.delete')} className="opacity-0 group-hover:opacity-100" onClick={() => deleteWorkout(w.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              mascot
              title={t('activity.empty.title')}
              description={t('activity.empty.desc')}
              action={<Button onClick={() => setPickerOpen(true)}>{t('activity.empty.cta')}</Button>}
            />
          )}
        </Card>
      </Screen>

      <SportPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(sport) => {
          setPickerOpen(false);
          setActiveSport(sport);
        }}
      />
      <WorkoutTracker
        sport={activeSport}
        open={!!activeSport}
        onClose={() => setActiveSport(null)}
        onSaved={() => setActiveSport(null)}
      />
      <RingGoalsSheet open={goalsOpen} onClose={() => setGoalsOpen(false)} goals={s.goals} />
    </>
  );
}

function RingGoalsSheet({
  open,
  onClose,
  goals,
}: {
  open: boolean;
  onClose: () => void;
  goals: { moveKcal: number; exerciseMin: number; standHours: number };
}) {
  const t = useT();
  const [move, setMove] = useState('600');
  const [exercise, setExercise] = useState('30');
  const [stand, setStand] = useState('12');

  useEffect(() => {
    if (open) {
      setMove(String(goals.moveKcal));
      setExercise(String(goals.exerciseMin));
      setStand(String(goals.standHours));
    }
  }, [open, goals]);

  async function save() {
    await updateSettings({
      goals: { moveKcal: +move || 600, exerciseMin: +exercise || 30, standHours: +stand || 12 },
    });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={t('activity.summary')} footer={<Button block size="lg" onClick={save}>{t('common.save')}</Button>}>
      <Field label={`${t('activity.ring.move')} (${t('activity.unit.kcal')})`}>
        <Input type="number" inputMode="numeric" value={move} onChange={(e) => setMove(e.target.value)} />
      </Field>
      <Field label={`${t('activity.ring.exercise')} (${t('activity.unit.min')})`}>
        <Input type="number" inputMode="numeric" value={exercise} onChange={(e) => setExercise(e.target.value)} />
      </Field>
      <Field label={`${t('activity.ring.stand')} (${t('activity.unit.hours')})`}>
        <Input type="number" inputMode="numeric" value={stand} onChange={(e) => setStand(e.target.value)} />
      </Field>
    </Sheet>
  );
}

function RingStat({ label, value, goal, unit, color }: { label: string; value: number; goal: number; unit: string; color: string }) {
  return (
    <div className="text-center">
      <div className="metric-label" style={{ color }}>
        {label}
      </div>
      <div className="text-lg font-semibold tnum text-ink mt-1">
        {value}
        <span className="text-ink-3 text-sm font-normal">/{goal}</span>
      </div>
      <div className="text-[11px] text-ink-3">{unit}</div>
    </div>
  );
}

function StepsCard({ data }: { data: { date: string; value: number }[] }) {
  const t = useT();
  const today = data[data.length - 1]?.value ?? 0;
  return (
    <Card className="mb-4">
      <CardHeader
        title={
          <span className="inline-flex items-center gap-1.5">
            <Footprints size={16} className="text-activity" /> {t('activity.steps')}
          </span>
        }
      />
      <div className="flex items-end justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tnum text-ink leading-none">{today.toLocaleString()}</span>
          <span className="text-[13px] text-ink-3 font-medium">{t('activity.steps.today')}</span>
        </div>
      </div>
      <BarChart
        data={data.map((d) => ({ label: format(parseISO(d.date), 'EEEEE', { locale: activeDfnLocale() }), value: d.value }))}
        color="var(--c-activity)"
        unit={t('activity.unit.steps')}
        height={96}
      />
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-section rounded-card p-3 text-center">
      <div className="text-xl font-semibold tnum text-ink">{value}</div>
      <div className="metric-label mt-0.5">{label}</div>
    </div>
  );
}
