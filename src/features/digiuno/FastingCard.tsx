import { useEffect, useRef, useState } from 'react';
import { Timer, Check } from 'lucide-react';
import { Card, CardHeader, ProgressRing, Button, Sheet, Field } from '@/ui';
import { useT } from '@/i18n';
import { useToast } from '@/ui';
import {
  getActiveFast,
  startFast,
  stopFast,
  elapsedMs,
  formatFastElapsed,
  FAST_PRESETS,
  DEFAULT_GOAL,
  type ActiveFast,
} from './fasting';

export function FastingCard() {
  const t = useT();
  const toast = useToast();
  const [fast, setFast] = useState<ActiveFast | null>(() => getActiveFast());
  const [, force] = useState(0);
  const [pickOpen, setPickOpen] = useState(false);
  const tick = useRef<ReturnType<typeof setInterval>>();

  // Re-render every second while a fast is running.
  useEffect(() => {
    if (fast) {
      tick.current = setInterval(() => force((n) => n + 1), 1000);
      return () => clearInterval(tick.current);
    }
  }, [fast]);

  function begin(goal: number) {
    setFast(startFast(goal));
    setPickOpen(false);
  }

  function end() {
    const hours = stopFast();
    setFast(null);
    toast.show(t('fast.ended', { h: Math.floor(hours), m: Math.round((hours % 1) * 60) }));
  }

  const el = fast ? elapsedMs(fast) : 0;
  const { h, m, s } = formatFastElapsed(el);
  const goalMs = (fast?.goalHours ?? DEFAULT_GOAL) * 3_600_000;
  const progress = fast ? Math.min(1, el / goalMs) : 0;
  const reached = fast ? el >= goalMs : false;
  const startTime = fast ? new Date(fast.startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <Card className="mb-4">
      <CardHeader title={t('fast.title')} />
      {!fast ? (
        <div className="flex items-center gap-3">
          <span className="h-12 w-12 rounded-full bg-section flex items-center justify-center text-ink-2 flex-shrink-0">
            <Timer size={22} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-ink-2 leading-snug">{t('fast.idle')}</div>
          </div>
          <Button size="sm" onClick={() => setPickOpen(true)}>
            {t('fast.start')}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ProgressRing progress={progress} size={84} stroke={8} color={reached ? 'var(--c-habit)' : 'var(--c-activity)'}>
            {reached ? <Check size={26} className="text-habit" /> : <Timer size={22} className="text-activity" />}
          </ProgressRing>
          <div className="flex-1 min-w-0">
            <div className="metric-label">{reached ? t('fast.goalReached') : t('fast.fasting')}</div>
            <div className="text-2xl font-bold tnum text-ink leading-tight mt-0.5">
              {h}<span className="text-base text-ink-3 font-semibold">h</span> {String(m).padStart(2, '0')}<span className="text-base text-ink-3 font-semibold">m</span> {String(s).padStart(2, '0')}<span className="text-base text-ink-3 font-semibold">s</span>
            </div>
            <div className="text-[12px] text-ink-3 mt-0.5">{t('fast.since', { time: startTime, goal: fast.goalHours })}</div>
          </div>
          <Button size="sm" variant="ghost" onClick={end}>
            {t('fast.stop')}
          </Button>
        </div>
      )}

      <Sheet open={pickOpen} onClose={() => setPickOpen(false)} title={t('fast.choose')}>
        <Field label={t('fast.protocol')}>
          <div className="grid grid-cols-3 gap-2.5">
            {FAST_PRESETS.map((hrs) => (
              <button
                key={hrs}
                onClick={() => begin(hrs)}
                className="rounded-btn border border-line dark:border-transparent bg-section py-3 flex flex-col items-center active:bg-divider transition-colors"
              >
                <span className="text-lg font-bold text-ink tnum">{hrs}:{24 - hrs}</span>
                <span className="text-[11px] text-ink-3">{t('fast.hours', { n: hrs })}</span>
              </button>
            ))}
          </div>
        </Field>
        <p className="text-[12px] text-ink-3 mt-2">{t('fast.note')}</p>
      </Sheet>
    </Card>
  );
}
