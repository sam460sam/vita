import { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { platform } from '@/platform/platform';
import { VioCompanion } from '@/ui';
import { useT, type TKey } from '@/i18n';
import type { Routine } from '@/data/types';

/** Full-screen guided player: run through a routine's steps one at a time,
 *  with an optional per-step countdown. */
export function RoutinePlayer({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const t = useT();
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(routine.steps[0]?.durationSec ?? null);

  // Reset the per-step timer whenever the step changes.
  useEffect(() => {
    setRemaining(routine.steps[i]?.durationSec ?? null);
  }, [i, routine]);

  // Tick the countdown down to zero (never auto-advances — the user taps Next).
  useEffect(() => {
    if (remaining == null || done || remaining <= 0) return;
    const id = setTimeout(() => setRemaining((r) => (r == null ? r : r - 1)), 1000);
    return () => clearTimeout(id);
  }, [remaining, done]);

  if (routine.steps.length === 0) {
    onClose();
    return null;
  }
  const step = routine.steps[i];
  const last = i + 1 >= routine.steps.length;

  function next() {
    platform.haptic();
    if (last) setDone(true);
    else setI((n) => n + 1);
  }

  return (
    <div className="fixed inset-0 z-[120] flex flex-col" style={{ background: 'var(--c-app)' }}>
      <div className="flex items-center justify-between px-5 pt-safe-top pt-5">
        <span className="text-[15px] font-bold text-ink truncate pr-3">{routine.emoji} {routine.name}</span>
        <button onClick={onClose} aria-label={t('common.close')} className="h-9 w-9 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 flex-shrink-0">
          <X size={18} />
        </button>
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <VioCompanion mood="happy" size={150} animated />
          <h1 className="display-serif text-[28px] text-ink mt-4">{t('routine.doneTitle')}</h1>
          <p className="text-[15px] text-ink-2 mt-2">{t('routine.doneDesc', { name: routine.name })}</p>
          <button onClick={onClose} className="mt-8 h-12 px-8 rounded-full text-on-primary font-bold active:scale-[0.98] transition-transform" style={{ background: 'var(--c-primary)' }}>
            {t('routine.finish')}
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {routine.steps.map((s, k) => (
              <span key={s.id} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 22 : 8, background: k <= i ? 'var(--c-primary)' : 'var(--c-line)' }} />
            ))}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="text-[13px] font-semibold text-ink-3">{t('routine.stepN' as TKey, { n: i + 1, total: routine.steps.length })}</div>
            <h1 className="display-serif text-[30px] text-ink leading-tight mt-3">{step.title}</h1>
            {remaining != null && <div className="text-[46px] font-black text-primary tnum mt-6">{fmtTime(remaining)}</div>}
          </div>

          <div className="px-6 pb-[calc(28px+env(safe-area-inset-bottom))]">
            <button onClick={next} className="w-full h-14 rounded-full text-on-primary font-bold text-[16px] flex items-center justify-center gap-1 active:scale-[0.98] transition-transform" style={{ background: 'var(--c-primary)' }}>
              {last ? t('routine.finishStep') : t('routine.next')} <ChevronRight size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}
