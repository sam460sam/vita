import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, Check, Droplet, ChevronDown } from 'lucide-react';
import { db } from '@/data/db';
import { setWaterMl, updateSettings, readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { Sheet, Field, Input, Button } from '@/ui';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { notifications } from '@/platform/notifications';
import { useT } from '@/i18n';

const WATER = '#0EA5E9';
const INTERVALS = [30, 45, 60, 90, 120];

/** Full "Water tracking" screen — drop grid + reminder + daily goal stats. */
export function WaterPage() {
  const t = useT();
  const navigate = useNavigate();
  const today = todayISO();

  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const log = useLiveQuery(() => db.waterLogs.get(today), [today], undefined);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);

  const [goalOpen, setGoalOpen] = useState(false);

  const glassMl = s.water.glassMl || 200;
  const goalMl = s.water.dailyGoalMl || 2000;
  const ml = log?.ml ?? 0;
  const total = Math.max(1, Math.round(goalMl / glassMl));
  const done = Math.round(ml / glassMl);
  const left = Math.max(0, total - done);
  // Balanced columns so drops sit symmetrically (e.g. 10 → 5×2, 15 → 8+7).
  const cols = total <= 6 ? total : Math.ceil(total / 2);
  const dropSize = cols <= 5 ? 52 : cols <= 6 ? 46 : 38;

  // Average / minimum / maximum daily intake (l/d) over days with any intake.
  const stats = useMemo(() => {
    const days = (waters ?? []).map((w) => w.ml / 1000).filter((v) => v > 0);
    if (days.length === 0) return { avg: goalMl / 1000, min: goalMl / 1000, max: goalMl / 1000 };
    const avg = days.reduce((a, b) => a + b, 0) / days.length;
    return { avg, min: Math.min(...days), max: Math.max(...days) };
  }, [waters, goalMl]);

  function setGlasses(n: number) {
    platform.haptic();
    void setWaterMl(today, Math.max(0, n) * glassMl);
  }

  const reminderOn = (s.water.reminderEveryMin ?? 0) > 0;
  async function toggleReminder() {
    const next = reminderOn ? 0 : 60;
    await updateSettings({ water: { ...s.water, reminderEveryMin: next || undefined } });
    if (next && notifications.supported()) await notifications.requestPermission();
    await notifications.setWaterInterval(next || undefined);
  }
  async function setInterval(min: number) {
    await updateSettings({ water: { ...s.water, reminderEveryMin: min } });
    if (notifications.supported()) await notifications.requestPermission();
    await notifications.setWaterInterval(min);
  }

  const fmtL = (n: number) => `${n.toFixed(1).replace(/\.0$/, '')} l/d`;

  return (
    <div className="min-h-[100dvh] bg-app">
      <div className="max-w-2xl mx-auto px-5 pt-safe-top pb-[calc(108px+env(safe-area-inset-bottom))] min-h-[100dvh] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14 pt-2">
          <button onClick={() => navigate(-1)} aria-label={t('common.close')} className="h-10 w-10 rounded-full border-2 border-dashed border-line flex items-center justify-center text-ink-2 active:scale-90 transition-transform">
            <X size={18} />
          </button>
          <span className="text-[15px] font-bold text-ink">{t('water.screen.title')}</span>
          <button onClick={() => navigate(-1)} aria-label={t('common.done')} className="h-10 w-10 rounded-full bg-section flex items-center justify-center text-ink active:scale-90 transition-transform">
            <Check size={18} />
          </button>
        </div>

        {/* Today */}
        <div className="mt-4">
          <div className="text-[15px] font-semibold text-ink-2">{t('water.screen.today')}</div>
          <h1 className="text-[34px] font-extrabold text-ink leading-tight mt-1">
            {done} <span className="text-ink-3 font-bold">{t('water.screen.of')}</span> {total} {t('water.screen.glasses')}
          </h1>
          <p className="text-[13px] text-ink-2 leading-snug mt-1.5 max-w-md">
            {t('water.screen.sub', { name: s.name || t('water.screen.you'), done, total, left })}
          </p>
        </div>

        {/* Drops grid */}
        <div className="mt-6 grid gap-3.5 justify-items-center" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: total }, (_, i) => {
            const filled = i < done;
            const isLastFilled = i + 1 === done;
            return (
              <button
                key={i}
                onClick={() => setGlasses(isLastFilled ? i : i + 1)}
                aria-label={`${i + 1}`}
                className="relative flex items-center justify-center active:scale-90 transition-transform"
              >
                <Droplet size={dropSize} strokeWidth={1.5} style={{ color: WATER }} fill={filled ? WATER : `${WATER}22`} />
                {!filled && <span className="absolute font-bold" style={{ color: WATER, fontSize: dropSize * 0.4 }}>+</span>}
              </button>
            );
          })}
        </div>

        {/* Notification */}
        <h2 className="text-[18px] font-extrabold text-ink mt-7">{t('water.screen.notification')}</h2>
        <button onClick={toggleReminder} className="mt-3 flex items-center gap-3 w-full">
          <span className="h-7 w-12 rounded-full relative transition-colors flex-shrink-0" style={{ background: reminderOn ? 'var(--c-primary)' : 'var(--c-line)' }}>
            <span className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all" style={{ left: reminderOn ? '22px' : '2px' }} />
          </span>
          <span className="text-[15px] font-semibold text-ink">{t('water.screen.remind')}</span>
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

        {/* push the goal + button toward the bottom so the screen feels full */}
        <div className="flex-1 min-h-[24px]" />

        {/* Daily goal */}
        <div className="rounded-card p-4 relative overflow-hidden" style={{ background: 'color-mix(in srgb, #0EA5E9 14%, transparent)' }}>
          <div className="text-[16px] font-extrabold text-ink">{t('water.screen.dailyGoal', { n: total })}</div>
          <div className="flex gap-6 mt-3">
            <GoalStat value={fmtL(stats.avg)} label={t('water.screen.average')} />
            <GoalStat value={fmtL(stats.min)} label={t('water.screen.minimum')} />
            <GoalStat value={fmtL(stats.max)} label={t('water.screen.maximum')} />
          </div>
          <Droplet size={90} className="absolute -right-3 -bottom-3 opacity-20" style={{ color: WATER }} fill={WATER} />
        </div>

        {/* Change goal */}
        <button onClick={() => setGoalOpen(true)} className="mt-4 w-full h-[52px] rounded-full bg-ink text-app font-bold text-[15px] active:scale-[0.98] transition-transform">
          {t('water.screen.changeGoal')}
        </button>
      </div>

      <WaterGoalSheet open={goalOpen} onClose={() => setGoalOpen(false)} goalMl={goalMl} glassMl={glassMl} />
    </div>
  );
}

function GoalStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[15px] font-extrabold text-ink tnum leading-none">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-2 mt-1">{label}</div>
    </div>
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
