import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Play, Pause, Plus, Trash2, Pencil, Scale, ChevronRight } from 'lucide-react';
import { db } from '@/data/db';
import { deleteWorkout, updateSettings, createWorkout } from '@/data/repo';
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
  useToast,
} from '@/ui';
import { formatDistance, formatDuration } from '@/lib/format';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { todayRings, ringsToData, summarize } from './logic';
import { getSport, estimateKcal, type Sport } from './sports';
import { SportPicker } from './SportPicker';
import { WorkoutTracker } from './WorkoutTracker';
import { HealthCard } from './HealthCard';
import { defaultSettings } from '@/data/defaults';
import { useT } from '@/i18n';

export function ActivityPage() {
  const t = useT();
  const workouts = useLiveQuery(() => db.workouts.orderBy('startedAt').reverse().toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const t2 = useToast();
  const [params, setParams] = useSearchParams();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [goalsOpen, setGoalsOpen] = useState(false);

  // Live workout session — kept here so it survives minimizing the tracker.
  const [sessionSport, setSessionSport] = useState<Sport | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const startedAtRef = useRef<number>(0);

  // Tick while running, regardless of whether the sheet is open or minimized.
  useEffect(() => {
    if (!sessionSport || !running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [sessionSport, running]);

  function startWorkout(sport: Sport) {
    setSessionSport(sport);
    startedAtRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    setTrackerOpen(true);
  }
  async function finishWorkout() {
    if (sessionSport) {
      await createWorkout({
        sportId: sessionSport.id,
        startedAt: startedAtRef.current || Date.now(),
        durationSec: elapsed,
        activeKcal: estimateKcal(sessionSport.met, elapsed),
        totalKcal: Math.round(estimateKcal(sessionSport.met, elapsed) * 1.25),
        source: 'manual',
      });
      t2.show(t('workout.saved'));
    }
    setSessionSport(null);
    setTrackerOpen(false);
  }
  function discardWorkout() {
    setSessionSport(null);
    setTrackerOpen(false);
  }

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

        {/* Weight tracker entry */}
        <Link to="/peso">
          <Card className="flex items-center gap-3 mb-4 active:bg-section transition-colors">
            <span className="h-10 w-10 rounded-full bg-project/10 flex items-center justify-center text-project flex-shrink-0">
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

      {/* Minimized workout banner — tap to reopen; the workout keeps running. */}
      {sessionSport && !trackerOpen && (
        <button
          onClick={() => setTrackerOpen(true)}
          className="fixed left-1/2 -translate-x-1/2 bottom-24 lg:bottom-6 z-40 flex items-center gap-3 bg-ink text-app rounded-full pl-4 pr-5 h-12 shadow-card-hover active:scale-95 transition-transform"
        >
          <span className="flex items-center gap-1.5">
            {running ? <span className="h-2 w-2 rounded-full bg-activity animate-pulse" /> : <Pause size={14} />}
            <sessionSport.icon size={16} />
          </span>
          <span className="text-[14px] font-semibold">{t('workout.ongoing')}</span>
          <span className="text-[14px] font-bold tnum">{formatDuration(elapsed)}</span>
        </button>
      )}

      <SportPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(sport) => {
          setPickerOpen(false);
          startWorkout(sport);
        }}
      />
      <WorkoutTracker
        sport={sessionSport}
        open={trackerOpen}
        elapsed={elapsed}
        running={running}
        onMinimize={() => setTrackerOpen(false)}
        onToggle={() => setRunning((r) => !r)}
        onFinish={finishWorkout}
        onDiscard={discardWorkout}
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
