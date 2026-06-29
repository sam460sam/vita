import { useState } from 'react';
import { HeartPulse, Check, Info, Upload, Footprints, Flame } from 'lucide-react';
import { Card, Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { health, useHealthSummary } from '@/platform/health';
import { platform } from '@/platform/platform';
import { parseWorkoutFile } from './importWorkouts';
import { createWorkout } from '@/data/repo';

/** Apple Health / Health Connect connection card (native-ready, web shows note). */
export function HealthCard() {
  const t = useT();
  const toast = useToast();
  const [status, setStatus] = useState(health.status());
  const summary = useHealthSummary();

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

  async function connect() {
    const ok = await health.connect();
    setStatus(health.status());
    if (ok) {
      const n = await health.importRecentWorkouts();
      if (n > 0) toast.show(`${n} ${t('health.imported')}`);
    }
  }

  async function disconnect() {
    await health.disconnect();
    setStatus(health.status());
  }

  const connectLabel = status.provider === 'healthconnect' ? t('health.connectAndroid') : t('health.connect');

  return (
    <Card className="mb-4">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-2xl bg-activity-tint flex items-center justify-center text-activity flex-shrink-0">
          <HeartPulse size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-ink">{t('health.title')}</div>
          <div className="text-[13px] text-ink-2">
            {status.authorized ? t('health.connectedDesc') : t('health.desc')}
          </div>
        </div>
        {status.authorized && <Check size={20} className="text-habit flex-shrink-0" />}
      </div>

      {!status.available ? (
        <p className="text-[12px] text-ink-3 mt-3 flex items-start gap-1.5">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          {t('health.webNote')}
        </p>
      ) : status.authorized ? (
        <>
          {summary && (
            <div className="flex items-center gap-4 mt-3 text-[13px]">
              <span className="inline-flex items-center gap-1 text-ink-2">
                <Footprints size={14} className="text-activity" /> {summary.steps.toLocaleString()} {t('activity.unit.steps')}
              </span>
              <span className="inline-flex items-center gap-1 text-ink-2">
                <Flame size={14} className="text-activity" /> {summary.activeKcal} {t('activity.unit.kcal')}
              </span>
              <span className="ml-auto text-[11px] text-ink-3">{t('health.syncedToday')}</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="subtle" className="flex-1" onClick={() => connect()}>
              {t('health.import')}
            </Button>
            <Button variant="ghost" className="text-danger" onClick={disconnect}>
              {t('health.disconnect')}
            </Button>
          </div>
        </>
      ) : (
        <Button block className="mt-3" onClick={connect}>
          {connectLabel}
        </Button>
      )}

      {/* File import works everywhere (web + native): Strava/Garmin/Apple Health export */}
      <div className="mt-3 pt-3 border-t border-divider">
        <Button variant="subtle" block icon={<Upload size={17} />} onClick={importFromFile}>
          {t('health.importFile')}
        </Button>
        <p className="text-[11px] text-ink-3 mt-1.5">{t('health.importFileNote')}</p>
      </div>
    </Card>
  );
}
