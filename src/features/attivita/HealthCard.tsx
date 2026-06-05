import { Upload } from 'lucide-react';
import { Card, Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { platform } from '@/platform/platform';
import { parseWorkoutFile } from './importWorkouts';
import { createWorkout } from '@/data/repo';

/**
 * Workout import card. Imports workouts from exported files (Strava, Garmin,
 * Apple Health export). No live HealthKit/Health Connect integration yet, so the
 * UI does not advertise one — it only offers the file import that works on every
 * platform.
 */
export function HealthCard() {
  const t = useT();
  const toast = useToast();

  async function importFromFile() {
    const text = await platform.pickTextFile('.tcx,.gpx,.xml,application/xml,text/xml');
    if (!text) return;
    let parsed;
    try {
      parsed = parseWorkoutFile(text);
    } catch {
      toast.show(t('health.importError'));
      return;
    }
    if (!parsed.length) {
      toast.show(t('health.importNone'));
      return;
    }
    for (const w of parsed) await createWorkout(w);
    toast.show(`${parsed.length} ${t('health.imported')}`);
  }

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-activity/10 flex items-center justify-center text-activity flex-shrink-0">
          <Upload size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink">{t('health.import')}</div>
          <div className="text-[13px] text-ink-2">{t('health.importFileNote')}</div>
        </div>
      </div>

      <div className="mt-3">
        <Button variant="subtle" block icon={<Upload size={17} />} onClick={importFromFile}>
          {t('health.importFile')}
        </Button>
      </div>
    </Card>
  );
}
