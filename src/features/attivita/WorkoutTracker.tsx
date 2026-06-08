import { useState } from 'react';
import { Pause, Play, Square, ChevronDown } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { formatDuration } from '@/lib/format';
import { estimateKcal, type Sport } from './sports';
import { useT } from '@/i18n';

/**
 * Live workout view. Presentational: the session (timer/running) lives in the
 * parent so it keeps going when this sheet is minimized. Closing the sheet
 * (the X) only minimizes — it does NOT stop the workout. Stopping is explicit:
 * "Finish" saves it, "Discard" cancels it (with confirmation).
 */
export function WorkoutTracker({
  sport,
  open,
  elapsed,
  running,
  onMinimize,
  onToggle,
  onFinish,
  onDiscard,
}: {
  sport: Sport | null;
  open: boolean;
  elapsed: number;
  running: boolean;
  onMinimize: () => void;
  onToggle: () => void;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  const t = useT();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  if (!sport) return null;
  const Icon = sport.icon;
  const kcal = estimateKcal(sport.met, elapsed);

  return (
    <Sheet open={open} onClose={onMinimize} title={sport.name} size="full">
      <div className="flex flex-col items-center justify-center text-center py-6">
        {/* Minimize hint button */}
        <button onClick={onMinimize} className="inline-flex items-center gap-1 text-[13px] text-ink-2 mb-4 active:opacity-60">
          <ChevronDown size={16} /> {t('workout.minimize')}
        </button>

        <span className="h-16 w-16 rounded-full bg-activity/10 flex items-center justify-center text-activity mb-6">
          <Icon size={30} />
        </span>
        <div className="text-6xl font-semibold tnum text-ink tracking-tight">{formatDuration(elapsed)}</div>
        <p className="metric-label mt-2">{t('workout.duration')}</p>

        <div className="grid grid-cols-2 gap-3 w-full mt-8">
          <div className="bg-section rounded-card p-4">
            <div className="metric-label">{t('workout.activeKcal')}</div>
            <div className="text-2xl font-semibold tnum text-activity mt-1">{kcal}</div>
          </div>
          <div className="bg-section rounded-card p-4">
            <div className="metric-label">{t('workout.state')}</div>
            <div className="text-2xl font-semibold mt-1 text-ink">{running ? t('workout.running') : t('workout.paused')}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-10">
          <Button variant="subtle" size="lg" onClick={onToggle} icon={running ? <Pause size={20} /> : <Play size={20} />}>
            {running ? t('workout.pause') : t('workout.resume')}
          </Button>
          <Button variant="primary" size="lg" onClick={onFinish} icon={<Square size={18} />}>
            {t('workout.finish')}
          </Button>
        </div>

        {confirmDiscard ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[13px] text-ink-2">{t('workout.discardConfirm')}</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>{t('common.cancel')}</Button>
              <Button variant="ghost" className="text-danger" onClick={onDiscard}>{t('workout.discard')}</Button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmDiscard(true)} className="text-[13px] text-ink-3 mt-6 py-1 active:opacity-60">
            {t('workout.discard')}
          </button>
        )}

        <p className="text-[12px] text-ink-3 mt-4 max-w-xs">{t('workout.kcalNote')}</p>
      </div>
    </Sheet>
  );
}
