import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, ProgressRing, StarMascot } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { cn } from '@/lib/cn';
import {
  type LifeData,
  lifetimePoints,
  computeLevel,
  computeAchievements,
  computeChallenges,
} from './logic';

export function GamificationPage() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const weights = useLiveQuery(() => db.weightLogs.toArray(), [], []);

  const d: LifeData = {
    settings: settings ?? defaultSettings(),
    habits: habits ?? [],
    logs: logs ?? [],
    tasks: tasks ?? [],
    workouts: workouts ?? [],
    waters: waters ?? [],
    journals: journals ?? [],
    weights: weights ?? [],
  };

  const points = lifetimePoints(d);
  const lvl = computeLevel(points);
  const achievements = computeAchievements(d);
  const challenges = computeChallenges(d);
  const earned = achievements.filter((a) => a.earned).length;

  return (
    <>
      <PageHeader title={t('rewards.title')} back="/altro" />
      <Screen>
        {/* Level + panda */}
        <Card className="mb-4">
          <div className="flex items-center gap-4">
            <ProgressRing progress={lvl.progress} size={84} stroke={8} color="var(--c-habit)">
              <div className="text-center leading-none">
                <div className="text-[10px] text-ink-3 font-semibold">{t('rewards.level')}</div>
                <div className="text-2xl font-bold text-ink tnum">{lvl.level}</div>
              </div>
            </ProgressRing>
            <div className="flex-1 min-w-0">
              <div className="text-[17px] font-bold text-ink">{t(lvl.titleKey as TKey)}</div>
              <div className="text-[13px] text-ink-2 mt-0.5">{t('rewards.points', { n: points })}</div>
              {!lvl.max && (
                <div className="text-[12px] text-ink-3 mt-0.5">{t('rewards.toNext', { n: lvl.toNext })}</div>
              )}
            </div>
          </div>
        </Card>

        {/* Panda intro for challenges */}
        <Card className="mb-4 flex items-center gap-3">
          <StarMascot size={56} animated />
          <p className="flex-1 text-[14px] text-ink-2 leading-snug">{t('rewards.pandaIntro')}</p>
        </Card>

        {/* Weekly challenges */}
        <Card className="mb-4">
          <CardHeader title={t('rewards.challenges')} />
          <div className="space-y-3.5">
            {challenges.map((c) => (
              <div key={c.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{c.emoji}</span>
                  <span className="flex-1 text-[14px] text-ink font-medium">{t(c.titleKey as TKey)}</span>
                  <span className={cn('text-[13px] font-semibold tnum', c.done ? 'text-habit' : 'text-ink-3')}>
                    {c.value}/{c.target}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-section overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((c.value / c.target) * 100)}%`, background: c.done ? 'var(--c-habit)' : 'var(--c-activity)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader title={t('rewards.badges')} action={<span className="text-[13px] text-ink-3 tnum">{earned}/{achievements.length}</span>} />
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'rounded-2xl p-3 text-center border transition-colors',
                  a.earned ? 'bg-habit/10 border-habit/30' : 'bg-section border-transparent opacity-60',
                )}
              >
                <div className={cn('text-3xl', !a.earned && 'grayscale')}>{a.emoji}</div>
                <div className="text-[12px] font-semibold text-ink mt-1.5 leading-tight">{t(a.titleKey as TKey)}</div>
                <div className="text-[10px] text-ink-3 mt-0.5 leading-tight">{t(a.descKey as TKey)}</div>
                {!a.earned && a.progress > 0 && (
                  <div className="h-1 rounded-full bg-divider overflow-hidden mt-1.5">
                    <div className="h-full rounded-full bg-ink-3" style={{ width: `${Math.round(a.progress * 100)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </Screen>
    </>
  );
}
