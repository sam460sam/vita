import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { backupToFile, needsBackupNudge } from './backup';

const DISMISS_KEY = 'vita.backup.nudgeDismissed';

/** Gentle, dismissible reminder shown on Home when a backup is overdue. */
export function BackupNudge({ hasData }: { hasData: boolean }) {
  const t = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === today();
    } catch {
      return false;
    }
  });

  if (hidden || !needsBackupNudge(hasData)) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, today());
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  async function backup() {
    setBusy(true);
    try {
      await backupToFile();
      toast.show(t('backup.done'));
      setHidden(true);
    } catch {
      toast.show(t('settings.invalidFile'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 rounded-card border border-warning/40 bg-warning/10 p-3.5 flex items-start gap-3">
      <ShieldAlert size={18} className="text-warning mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink">{t('backup.nudge.title')}</div>
        <p className="text-[13px] text-ink-2 leading-snug mt-0.5">{t('backup.nudge.desc')}</p>
        <div className="mt-2.5">
          <Button size="sm" onClick={backup} disabled={busy}>
            {t('backup.export')}
          </Button>
        </div>
      </div>
      <button onClick={dismiss} aria-label={t('common.close')} className="h-7 w-7 -mr-1 -mt-1 rounded-full flex items-center justify-center text-ink-3 active:bg-section">
        <X size={16} />
      </button>
    </div>
  );
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
