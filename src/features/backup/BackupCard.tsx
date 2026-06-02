import { useEffect, useState } from 'react';
import { Download, Upload, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import { Card, CardHeader, Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { platform } from '@/platform/platform';
import { activeDfnLocale } from '@/lib/format';
import { format } from 'date-fns';
import { backupToFile, restoreFromFile, lastBackupAt } from './backup';

export function BackupCard() {
  const t = useT();
  const toast = useToast();
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [last, setLast] = useState<number | null>(lastBackupAt());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void platform.persistStorage().then(setPersisted);
  }, []);

  async function doBackup() {
    setBusy(true);
    try {
      await backupToFile();
      setLast(lastBackupAt());
      toast.show(t('backup.done'));
    } catch {
      toast.show(t('settings.invalidFile'));
    } finally {
      setBusy(false);
    }
  }

  async function doRestore() {
    if (!confirm(t('backup.restoreConfirm'))) return;
    setBusy(true);
    const res = await restoreFromFile();
    setBusy(false);
    if (res === 'ok') toast.show(t('backup.restored'));
    else if (res === 'invalid') toast.show(t('settings.invalidFile'));
  }

  const lastLabel = last ? format(new Date(last), 'd MMM yyyy', { locale: activeDfnLocale() }) : t('backup.never');

  return (
    <Card className="mb-4">
      <CardHeader title={t('backup.title')} />

      {/* Storage durability status */}
      <div className="flex items-start gap-2 mb-3">
        {persisted ? (
          <ShieldCheck size={16} className="text-habit mt-0.5 flex-shrink-0" />
        ) : (
          <ShieldAlert size={16} className="text-warning mt-0.5 flex-shrink-0" />
        )}
        <p className="text-[13px] text-ink-2 leading-snug">
          {persisted == null ? t('backup.checking') : persisted ? t('backup.persisted') : t('backup.notPersisted')}
        </p>
      </div>

      <p className="text-[13px] text-ink-2 mb-3 flex items-start gap-2">
        <Info size={15} className="mt-0.5 flex-shrink-0" />
        {t('backup.note')}
      </p>

      <div className="flex items-center justify-between py-2 text-[13px]">
        <span className="text-ink-2">{t('backup.last')}</span>
        <span className="text-ink font-medium">{lastLabel}</span>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <Button block icon={<Download size={18} />} onClick={doBackup} disabled={busy}>
          {t('backup.export')}
        </Button>
        <Button variant="subtle" block icon={<Upload size={18} />} onClick={doRestore} disabled={busy}>
          {t('backup.restore')}
        </Button>
      </div>
    </Card>
  );
}
