import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Plus, Trash2, Pencil } from 'lucide-react';
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
import { formatDistance, formatDuration } from '@/lib/format';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { todayRings, ringsToData, summarize } from './logic';
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
  const rings = todayRings(workouts ?? [], s);
  const summary = summarize(workouts ?? [], period);

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
        {/* Rings */}
        <Card className="flex flex-col items-center pt-6 pb-5 mb-4 relative">
          <IconButton label={t('common.edit')} className="absolute top-2 right-2" onClick={() => setGoalsOpen(true)}>
            <Pencil size={16} />
          </IconButton>
          <ActivityRings rings={ringsToData(rings)} />
          <div className="grid grid-cols-3 gap-4 w-full mt-5">
            <RingStat label={t('activity.ring.move')} value={rings.move.value} goal={rings.move.goal} unit={t('activity.unit.kcal')} color="var(--c-activity)" />
            <RingStat label={t('activity.ring.exercise')} value={rings.exercise.value} goal={rings.exercise.goal} unit={t('activity.unit.min')} color="var(--c-habit)" />
            <RingStat label={t('activity.ring.stand')} value={rings.stand.value} goal={rings.stand.goal} unit={t('activity.unit.hours')} color="var(--c-project)" />
          </div>
        </Card>

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
                    <span className="h-10 w-10 rounded-full bg-activity/10 flex items-center justify-center text-activity flex-shrink-0">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-medium text-ink truncate">{sport.name}</div>
                      <div className="text-[13px] text-ink-2">
                        {format(new Date(w.startedAt), 'd MMM · HH:mm', { locale: it })}
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
              icon={<Plus size={22} />}
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-section rounded-card p-3 text-center">
      <div className="text-xl font-semibold tnum text-ink">{value}</div>
      <div className="metric-label mt-0.5">{label}</div>
    </div>
  );
}
