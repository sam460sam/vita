import { useMemo, useState } from 'react';
import { subDays } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { Droplet, ChevronDown, Bell } from 'lucide-react';
import { db } from '@/data/db';
import { setWaterMl, updateSettings, readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { Sheet, Field, Input, Button, Segmented, Card, VioCompanion } from '@/ui';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { notifications } from '@/platform/notifications';
import { useT, type TKey } from '@/i18n';
import glassEmpty from '/icons3d/glass-empty.png';
import glassHalf from '/icons3d/glass-half.png';
import glassFull from '/icons3d/glass-full.png';

const WATER = '#0EA5E9';
const INTERVALS = [30, 45, 60, 90, 120];
const QUICK = [250, 500, 750] as const; // ml — glass · big glass · bottle

/** Full "Water tracking" screen — glass hero + quick-add + weekly stats + reminder. */
export function WaterPage() {
  const t = useT();
  const today = todayISO();

  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);

  const [goalOpen, setGoalOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const glassMl = s.water.glassMl || 200;
  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = log?.ml ?? 0;
  const pct = Math.min(100, Math.round((ml / goalMl) * 100));

  // Average / minimum / maximum daily intake (l) over the last 30 days that had
  // any intake — computed from real logs, so it varies with the user's history.
  // This week's water habits: daily average, best day, and how many of the last
  // 7 days hit the goal. Clear and motivating (no confusing "weekly min").
  const stats = useMemo(() => {
    const cutoff = todayISO(subDays(new Date(), 6)); // last 7 days incl. today
    const recent = (waters ?? []).filter((w) => w.date >= cutoff && w.ml > 0);
    const liters = recent.map((w) => w.ml / 1000);
    if (liters.length === 0) return { avg: 0, best: 0, goalDays: 0, n: 0 };
    const avg = liters.reduce((a, b) => a + b, 0) / liters.length;
    const goalDays = recent.filter((w) => w.ml >= goalMl).length;
    return { avg, best: Math.max(...liters), goalDays, n: liters.length };
  }, [waters, goalMl]);

  function add(deltaMl: number) {
    platform.haptic();
    void setWaterMl(today, Math.max(0, ml + deltaMl));
  }

  const reminderOn = (s.water.reminderEveryMin ?? 0) > 0;
  const waterTicks = () => Array.from({ length: 8 }, (_, i) => t(`reminder.waterTick.${i + 1}` as TKey));
  async function toggleReminder() {
    const next = reminderOn ? 0 : 60;
    await updateSettings({ water: { ...s.water, reminderEveryMin: next || undefined } });
    if (next && notifications.supported()) await notifications.requestPermission();
    await notifications.setWaterInterval(next || undefined, waterTicks());
  }
  async function setInterval(min: number) {
    await updateSettings({ water: { ...s.water, reminderEveryMin: min } });
    if (notifications.supported()) await notifications.requestPermission();
    await notifications.setWaterInterval(min, waterTicks());
  }

  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} L`;

  return (
    <>
      <PageHeader title={t('nav.water')} />
      <Screen>
        {/* Hero — glass + today's litres + Vio */}
        <Card className="flex items-center gap-4 overflow-hidden">
          <img src={pct < 33 ? glassEmpty : pct < 66 ? glassHalf : glassFull} alt="" aria-hidden draggable={false} className="h-24 w-auto object-contain flex-shrink-0 -ml-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-1.5 whitespace-nowrap">
              <span className="text-[32px] font-extrabold text-ink leading-none tnum">{fmtL(ml / 1000)}</span>
              <span className="text-[16px] font-bold text-ink-3 mb-0.5">/ {fmtL(goalMl / 1000)}</span>
            </div>
            <div className="text-[14px] font-semibold text-ink-2 mt-1.5">{t('water.hydrationToday')}</div>
            <div className="mt-2 h-2 rounded-full bg-section overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: WATER }} />
            </div>
          </div>
          <VioCompanion mood={pct >= 60 ? 'happy' : 'waiting'} size={70} animated className="-mr-1 self-end flex-shrink-0" />
        </Card>

        {/* Quick add */}
        <h2 className="text-[17px] font-extrabold text-ink mt-6 mb-3">{t('water.quickAdd')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK.map((q, i) => (
            <button
              key={q}
              onClick={() => add(q)}
              className="rounded-card bg-card border border-line/70 dark:border-white/5 py-4 flex flex-col items-center gap-1.5 active:scale-95 transition-transform shadow-chip"
            >
              <Droplet size={i === 2 ? 30 : 24} strokeWidth={2} style={{ color: WATER }} fill={`${WATER}22`} />
              <span className="text-[14px] font-bold text-ink">{i === 2 ? t('water.bottle') : `${q} ml`}</span>
              {i === 2 && <span className="text-[11px] text-ink-3 -mt-1">{q} ml</span>}
            </button>
          ))}
        </div>

        {/* This week */}
        <h2 className="text-[15px] font-bold text-ink mt-5 mb-2.5">{t('water.thisWeek')}</h2>
        <div className="grid grid-cols-3 gap-3">
          <WeekStat value={stats.n ? fmtL(stats.avg) : '—'} label={t('water.screen.average')} />
          <WeekStat value={stats.n ? fmtL(stats.best) : '—'} label={t('water.bestDay')} />
          <WeekStat value={`${stats.goalDays}/7`} label={t('water.goalMet')} />
        </div>

        {/* Reminder card */}
        <Card className="mt-4">
          <button onClick={toggleReminder} className="flex items-center gap-3 w-full">
            <span className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${WATER}1f`, color: WATER }}>
              <Bell size={18} />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[15px] font-semibold text-ink">{t('water.reminderTitle')}</span>
              <span className="block text-[12px] text-ink-2">{t('water.screen.remind')}</span>
            </span>
            <span className="h-7 w-12 rounded-full relative transition-colors flex-shrink-0" style={{ background: reminderOn ? WATER : 'var(--c-line)' }}>
              <span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all" style={{ left: reminderOn ? '22px' : '2px' }} />
            </span>
          </button>
          {reminderOn && (
            <div className="relative mt-3">
              <select
                value={s.water.reminderEveryMin ?? 60}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                className="appearance-none w-full h-12 rounded-btn bg-section text-ink text-[15px] font-medium px-4 pr-10"
              >
                {INTERVALS.map((m) => (
                  <option key={m} value={m}>{t('water.screen.every', { n: m })}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 pointer-events-none" />
            </div>
          )}
        </Card>

        {/* Secondary actions */}
        <button onClick={() => setCalcOpen(true)} className="mt-4 w-full h-12 rounded-full font-bold text-[15px] active:scale-[0.98] transition-transform" style={{ background: `${WATER}29`, color: WATER }}>
          {t('water.calc.cta')}
        </button>
        <button onClick={() => setGoalOpen(true)} className="mt-3 w-full h-[52px] rounded-full bg-ink text-app font-bold text-[15px] active:scale-[0.98] transition-transform">
          {t('water.screen.changeGoal')}
        </button>
      </Screen>

      <WaterGoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} goalMl={goalMl} glassMl={glassMl} />
      <HydrationCalcSheet open={calcOpen} onClose={() => setCalcOpen(false)} glassMl={glassMl} />
    </>
  );
}

function WeekStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card bg-card border border-line/70 dark:border-white/5 p-3 text-center shadow-chip">
      <div className="text-[18px] font-extrabold text-ink tnum leading-none">{value}</div>
      <div className="text-[10.5px] font-bold uppercase tracking-wide text-ink-3 mt-1.5">{label}</div>
    </div>
  );
}

/** Extra daily water (ml) by how active the person is — roughly the fluid lost
 *  through a typical day's exertion at each level. */
export const ACTIVITY_ML = { sedentary: 0, light: 350, active: 650, intense: 1000 } as const;
export type ActivityLevel = keyof typeof ACTIVITY_ML;

/** Evidence-based daily water estimate from weight (≈35 ml/kg) with a small
 *  height adjustment plus an activity bonus. Rounded to 100 ml and clamped. */
export function recommendedWaterMl(weightKg: number, heightCm: number, activityMl = 0): number {
  const base = weightKg * 35 + (heightCm - 170) * 10 + activityMl;
  const rounded = Math.round(base / 100) * 100;
  return Math.min(4000, Math.max(1500, rounded));
}

function HydrationCalcSheet({ open, onClose, glassMl }: { open: boolean; onClose: () => void; glassMl: number }) {
  const t = useT();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('light');
  const w = parseFloat(weight);
  const h = parseFloat(height);
  const valid = w > 0 && h > 0;
  const ml = valid ? recommendedWaterMl(w, h, ACTIVITY_ML[activity]) : 0;
  const glasses = Math.max(1, Math.round(ml / (glassMl || 200)));

  async function apply() {
    if (!valid) return;
    const s = await readSettings();
    await updateSettings({ water: { ...s.water, dailyGoalMl: ml } });
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('water.calc.title')}
      footer={<Button block size="lg" disabled={!valid} onClick={apply}>{t('water.calc.apply')}</Button>}
    >
      <p className="text-[13px] text-ink-2 leading-snug mb-4">{t('water.calc.intro')}</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('water.calc.weight')}><Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label={t('water.calc.height')}><Input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
      </div>
      <div className="mt-3">
        <Field label={t('water.calc.activity')}>
          <Segmented
            className="w-full"
            value={activity}
            onChange={(v) => setActivity(v as ActivityLevel)}
            options={[
              { value: 'sedentary', label: t('water.calc.act.sedentary') },
              { value: 'light', label: t('water.calc.act.light') },
              { value: 'active', label: t('water.calc.act.active') },
              { value: 'intense', label: t('water.calc.act.intense') },
            ]}
          />
        </Field>
      </div>
      <div className="mt-4 rounded-card p-4" style={{ background: 'color-mix(in srgb, #0EA5E9 12%, transparent)' }}>
        {valid ? (
          <>
            <div className="text-[18px] font-extrabold text-ink">{t('water.calc.result', { l: (ml / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') })}</div>
            <div className="text-[13px] text-ink-2 mt-1">{t('water.calc.resultHint', { n: glasses, ml: glassMl || 200 })}</div>
          </>
        ) : (
          <div className="text-[13px] text-ink-2">{t('water.calc.fill')}</div>
        )}
      </div>
      <p className="text-[12px] text-ink-3 mt-3 leading-snug">{t('water.calc.note')}</p>
    </Sheet>
  );
}

function WaterGoalSheet({ open, onClose, goalMl, glassMl }: { open: boolean; onClose: () => void; goalMl: number; glassMl: number }) {
  const t = useT();
  const [goalL, setGoalL] = useState(String(goalMl / 1000));
  const [glass, setGlass] = useState(String(glassMl));
  useMemo(() => { if (open) { setGoalL(String(goalMl / 1000)); setGlass(String(glassMl)); } }, [open, goalMl, glassMl]);

  async function save() {
    const s = await readSettings();
    await updateSettings({ water: { ...s.water, dailyGoalMl: Math.round((parseFloat(goalL) || 2) * 1000), glassMl: parseInt(glass) || 200 } });
    onClose();
  }
  return (
    <Sheet open={open} onClose={onClose} title={t('water.screen.changeGoal')} footer={<Button block size="lg" onClick={save}>{t('common.save')}</Button>}>
      <Field label={t('water.goal')}><Input type="number" inputMode="decimal" value={goalL} onChange={(e) => setGoalL(e.target.value)} /></Field>
      <Field label={t('water.glassSize')}><Input type="number" inputMode="numeric" value={glass} onChange={(e) => setGlass(e.target.value)} /></Field>
    </Sheet>
  );
}
