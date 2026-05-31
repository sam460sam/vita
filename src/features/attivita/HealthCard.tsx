import { useState } from 'react';
import { HeartPulse, Check, Info } from 'lucide-react';
import { Card, Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { health } from '@/platform/health';

/** Apple Health / Health Connect connection card (native-ready, web shows note). */
export function HealthCard() {
  const t = useT();
  const toast = useToast();
  const [status, setStatus] = useState(health.status());

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
        <span className="h-10 w-10 rounded-full bg-activity/10 flex items-center justify-center text-activity flex-shrink-0">
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
        <div className="flex gap-2 mt-3">
          <Button variant="subtle" className="flex-1" onClick={() => connect()}>
            {t('health.import')}
          </Button>
          <Button variant="ghost" className="text-danger" onClick={disconnect}>
            {t('health.disconnect')}
          </Button>
        </div>
      ) : (
        <Button block className="mt-3" onClick={connect}>
          {connectLabel}
        </Button>
      )}
    </Card>
  );
}
