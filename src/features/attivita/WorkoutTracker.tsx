import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { formatDuration } from '@/lib/format';
import { createWorkout } from '@/data/repo';
import { estimateKcal, type Sport } from './sports';
import { useToast } from '@/ui';
import { useT } from '@/i18n';

/** Live workout tracking: start/pause/stop timer + live metrics, then save. */
export function WorkoutTracker({
  sport,
  open,
  onClose,
  onSaved,
}: {
  sport: Sport | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const startRef = useRef<number>(Date.now());
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (!open) return;
    setElapsed(0);
    setRunning(true);
    startRef.current = Date.now();
  }, [open, sport?.id]);

  useEffect(() => {
    if (!open || !running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [open, running]);

  if (!sport) return null;
  const Icon = sport.icon;
  const kcal = estimateKcal(sport.met, elapsed);

  async function save() {
    if (!sport) return;
    await createWorkout({
      sportId: sport.id,
      startedAt: startRef.current,
      durationSec: elapsed,
      activeKcal: kcal,
      totalKcal: Math.round(kcal * 1.25),
      source: 'manual',
    });
    toast.show(t('workout.saved'));
    onSaved();
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={sport.name} size="full">
      <div className="flex flex-col items-center justify-center text-center py-6">
        <span className="h-16 w-16 rounded-3xl bg-activity-tint flex items-center justify-center text-activity mb-6">
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
          <Button variant="subtle" size="lg" onClick={() => setRunning((r) => !r)} icon={running ? <Pause size={20} /> : <Play size={20} />}>
            {running ? t('workout.pause') : t('workout.resume')}
          </Button>
          <Button variant="primary" size="lg" onClick={save} icon={<Square size={18} />}>
            {t('workout.finish')}
          </Button>
        </div>
        <p className="text-[12px] text-ink-3 mt-4 max-w-xs">
          {t('workout.kcalNote')}
        </p>
      </div>
    </Sheet>
  );
}
