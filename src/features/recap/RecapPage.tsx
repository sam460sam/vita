import { useLiveQuery } from 'dexie-react-hooks';
import { Share2, Flame, Droplet, Dumbbell, CheckSquare, BookHeart, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, Button, EmptyState, VioCompanion, ProgressRing, useToast } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { platform } from '@/platform/platform';
import { todayISO } from '@/lib/format';
import { readDayPlan } from '@/data/repo';
import { computeMomentum, momentumMessageKey, MOMENTUM_POINTS, type MomentumKey } from '@/features/oggi/momentum';
import { weeklyRecap, hasAnyData } from './logic';
import { weeklyInsights } from './insights';
import type { LifeData } from '@/features/gamification/logic';
import { buildRecapSVG, svgToPngBlob } from './shareImage';

const MKEY_EMOJI: Record<MomentumKey, string> = { habit: '🌿', focus: '🎯', todo: '✅', workout: '🏋️', journal: '📓', water: '💧' };
const MKEY_LABEL: Record<MomentumKey, TKey> = { habit: 'nav.habits', focus: 'home.focus.label', todo: 'agenda.todo', workout: 'workout.title', journal: 'nav.journal', water: 'nav.water' };

export function RecapPage() {
  const t = useT();
  const toast = useToast();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const weights = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const today = todayISO();
  const dayPlan = useLiveQuery(() => readDayPlan(today), [today], undefined);
  const sessions = useLiveQuery(() => db.workoutSessions.toArray(), [], []);

  const s = settings ?? defaultSettings();
  const todayWater = (waters ?? []).find((w) => w.date === today);
  const mom = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? [], { dayPlan, sessions: sessions ?? [] });
  const r = weeklyRecap(habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], waters ?? [], journals ?? []);
  const liters = `${(r.waterMl / 1000).toFixed(1)} L`;

  const lifeData: LifeData = {
    settings: s,
    habits: habits ?? [],
    logs: logs ?? [],
    tasks: tasks ?? [],
    workouts: workouts ?? [],
    waters: waters ?? [],
    journals: journals ?? [],
    weights: weights ?? [],
  };
  const insights = weeklyInsights(lifeData);

  async function share() {
    const svg = buildRecapSVG(r, {
      week: t('recap.week'),
      habits: t('recap.habits'),
      water: t('recap.water'),
      workouts: t('recap.workouts'),
      tasks: t('recap.tasks'),
      journal: t('recap.journal'),
      tagline: t('recap.tagline'),
      name: s.name || undefined,
    });
    try {
      const blob = await svgToPngBlob(svg);
      await platform.shareImage(blob, 'vita-recap.png', t('recap.tagline'));
    } catch {
      toast.show(t('settings.invalidFile'));
    }
  }

  const rows = [
    { icon: Flame, color: 'var(--c-habit)', label: t('recap.habits'), value: String(r.habitsCompleted) },
    { icon: Droplet, color: '#0EA5E9', label: t('recap.water'), value: liters },
    { icon: Dumbbell, color: 'var(--c-activity)', label: t('recap.workouts'), value: String(r.workouts) },
    { icon: CheckSquare, color: 'var(--c-project)', label: t('recap.tasks'), value: String(r.tasksCompleted) },
    { icon: BookHeart, color: 'var(--c-journal)', label: t('recap.journal'), value: String(r.journalEntries) },
  ];

  return (
    <>
      <PageHeader
        title={t('recap.title')}
        back="/altro"
        action={
          hasAnyData(r) ? (
            <Button size="sm" icon={<Share2 size={15} />} onClick={share}>
              {t('recap.share')}
            </Button>
          ) : undefined
        }
      />
      <Screen>
        {/* Momentum today — transparent: score, what grew it, and the points legend. */}
        <Card className="mb-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0" style={{ filter: 'drop-shadow(0 0 8px rgba(13,77,50,0.6))' }}>
              <ProgressRing progress={mom.score / 100} size={84} stroke={9} gradient={['#3DA66F', '#0D4D32']}>
                <div className="flex items-baseline"><span className="text-[22px] font-extrabold text-ink tnum leading-none">{mom.score}</span><span className="text-[11px] font-bold text-ink-3">/100</span></div>
              </ProgressRing>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[16px] font-bold text-ink">Momentum</div>
              {mom.breakdown.length > 0 ? (
                <div className="text-[13px] text-ink-2 mt-1 leading-snug">
                  <span className="font-bold" style={{ color: 'var(--c-habit)' }}>{t('home.todayPlus', { n: mom.points })}</span>{' · '}
                  {mom.breakdown.map((p) => `${MKEY_EMOJI[p.key]} ${t(MKEY_LABEL[p.key])}${p.n > 1 ? ` ×${p.n}` : ''}`).join(' · ')}
                </div>
              ) : (
                <div className="text-[13px] text-ink-3 mt-1">{t(momentumMessageKey(mom.score) as TKey)}</div>
              )}
            </div>
          </div>
          {/* Points legend — so anyone curious can see what makes the plant grow. */}
          <div className="mt-4 pt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t" style={{ borderColor: 'var(--c-divider)' }}>
            {(Object.keys(MOMENTUM_POINTS) as MomentumKey[]).map((k) => (
              <div key={k} className="flex items-center gap-2 text-[12.5px]">
                <span aria-hidden>{MKEY_EMOJI[k]}</span>
                <span className="flex-1 text-ink-2 truncate">{t(MKEY_LABEL[k])}</span>
                <span className="font-bold tnum" style={{ color: 'var(--c-habit)' }}>+{MOMENTUM_POINTS[k]}</span>
              </div>
            ))}
          </div>
        </Card>

        {!hasAnyData(r) ? (
          <Card>
            <EmptyState title={t('recap.week')} description={t('recap.empty')} />
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <VioCompanion mood="happy" size={100} animated />
              <div className="metric-label mt-3">{s.name ? `${s.name} · ${t('recap.week')}` : t('recap.week')}</div>
              <div className="text-2xl font-bold text-ink">Vyta</div>
            </div>
            <div className="space-y-3">
              {rows.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${row.color}1a`, color: row.color }}>
                      <Icon size={18} />
                    </span>
                    <span className="flex-1 text-[15px] text-ink-2">{row.label}</span>
                    <span className="text-[18px] font-bold tnum text-ink">{row.value}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-[12px] text-ink-3 mt-5">{t('recap.tagline')}</p>
          </Card>
        )}

        {/* Personalised weekly insights */}
        {insights.length > 0 && (
          <Card className="mt-4">
            <CardHeader title={t('recap.insights')} />
            <div className="space-y-3">
              {insights.map((ins, i) => {
                const vars = { ...ins.vars } as Record<string, string | number>;
                if (typeof vars.day === 'string' && vars.day.startsWith('weekday.')) vars.day = t(vars.day as TKey);
                const Icon = ins.tone === 'up' ? TrendingUp : ins.tone === 'down' ? TrendingDown : Sparkles;
                const color = ins.tone === 'up' ? 'var(--c-habit)' : ins.tone === 'down' ? 'var(--c-warning)' : 'var(--c-project)';
                return (
                  <div key={i} className="flex items-start gap-3">
                    <span className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${color}1a`, color }}>
                      <Icon size={16} />
                    </span>
                    <p className="flex-1 text-[14px] text-ink leading-snug">{t(ins.key as TKey, vars)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </Screen>
    </>
  );
}
