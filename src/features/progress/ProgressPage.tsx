import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO } from 'date-fns';
import { Flame, Droplet, Dumbbell } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Segmented } from '@/ui';
import { activeDfnLocale } from '@/lib/format';
import { useT } from '@/i18n';
import { computeProgress, type ProgressPeriod } from './logic';

/** Progress / trends — daily · weekly · monthly view of the wellness core. */
export function ProgressPage() {
  const t = useT();
  const [period, setPeriod] = useState<ProgressPeriod>('week');

  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);

  const s = settings ?? defaultSettings();
  const goalMl = s.water.dailyGoalMl || 2000;

  const stats = useMemo(
    () => computeProgress(period, habits ?? [], logs ?? [], waters ?? [], workouts ?? [], goalMl),
    [period, habits, logs, waters, workouts, goalMl],
  );

  const fmtL = (ml: number) => `${(ml / 1000).toFixed(1).replace(/\.0$/, '')} L`;
  const periodOpts: { value: ProgressPeriod; label: string }[] = [
    { value: 'day', label: t('progress.period.day') },
    { value: 'week', label: t('progress.period.week') },
    { value: 'month', label: t('progress.period.month') },
  ];

  return (
    <>
      <PageHeader title={t('progress.title')} back />
      <Screen>
        <Segmented value={period} onChange={(v) => setPeriod(v as ProgressPeriod)} options={periodOpts} />

        {/* Headline: average habit completion for the period */}
        <div className="rounded-card bg-card shadow-card p-5 mt-4 text-center">
          <div className="text-[13px] font-semibold text-ink-3 uppercase tracking-wide">{t('progress.habitRate')}</div>
          <div className="text-[44px] font-black text-ink leading-none mt-1 tnum">{stats.habitPct}<span className="text-[22px] text-ink-3">%</span></div>
          <div className="text-[13px] text-ink-2 mt-1">{t('progress.habitsCount', { done: stats.habitsDone, total: stats.habitsScheduled })}</div>
        </div>

        {/* Trend chart (habit % per day) */}
        {period !== 'day' && (
          <div className="rounded-card bg-card shadow-card p-4 mt-3">
            <div className="text-[13px] font-semibold text-ink-2 mb-3">{t('progress.trend')}</div>
            <div className="flex items-end justify-between gap-[3px] h-28">
              {stats.series.map((p) => (
                <div key={p.date} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-md"
                    style={{ height: `${Math.max(4, p.habitPct)}%`, background: p.metWaterGoal ? 'var(--c-habit)' : 'color-mix(in srgb, var(--c-habit) 45%, var(--c-section))' }}
                    title={`${p.habitPct}%`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[10.5px] text-ink-3">
              <span>{format(parseISO(stats.series[0].date), 'd MMM', { locale: activeDfnLocale() })}</span>
              <span>{format(parseISO(stats.series[stats.series.length - 1].date), 'd MMM', { locale: activeDfnLocale() })}</span>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <StatCard icon={<Flame size={18} />} accent="var(--c-habit)" value={`${stats.habitsDone}`} label={t('nav.habits')} />
          <StatCard icon={<Droplet size={18} />} accent="var(--c-activity)" value={fmtL(stats.waterMl)} label={t('nav.water')} />
          <StatCard icon={<Dumbbell size={18} />} accent="var(--c-project)" value={`${stats.workouts}`} label={t('nav.activity')} />
        </div>

        <div className="rounded-card bg-card shadow-card px-4 py-3.5 mt-3 flex items-center justify-between">
          <span className="text-[14px] text-ink-2">{t('progress.goalDays')}</span>
          <span className="text-[16px] font-extrabold text-ink tnum">{stats.goalDays}</span>
        </div>

        {stats.habitsScheduled === 0 && stats.waterMl === 0 && stats.workouts === 0 && (
          <p className="text-center text-[13px] text-ink-3 mt-6 px-6 leading-relaxed">{t('progress.empty')}</p>
        )}
      </Screen>
    </>
  );
}

function StatCard({ icon, accent, value, label }: { icon: React.ReactNode; accent: string; value: string; label: string }) {
  return (
    <div className="rounded-card bg-card shadow-card px-2 py-4 flex flex-col items-center text-center gap-1">
      <span className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent }}>{icon}</span>
      <span className="text-[18px] font-extrabold text-ink leading-none mt-1 tnum">{value}</span>
      <span className="text-[11.5px] text-ink-3">{label}</span>
    </div>
  );
}
