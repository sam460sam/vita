import { ArrowUpCircle, X } from 'lucide-react';
import { Button } from '@/ui';
import { useT } from '@/i18n';
import { platform } from '@/platform/platform';
import { APP_STORE_ID } from '@/features/rating/rating';
import { useAppUpdate } from './update';

/** Gentle, dismissible "Update available" banner shown on Home when a newer
 *  version is live on the App Store. */
export function UpdateNudge() {
  const t = useT();
  const { storeVersion, dismiss } = useAppUpdate();

  if (!storeVersion) return null;

  return (
    <div className="mb-4 rounded-card border border-habit/40 bg-habit/10 p-3.5 flex items-start gap-3">
      <ArrowUpCircle size={18} className="text-habit mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-ink">{t('update.nudge.title')}</div>
        <p className="text-[13px] text-ink-2 leading-snug mt-0.5">{t('update.nudge.desc')}</p>
        <div className="mt-2.5">
          <Button size="sm" onClick={() => platform.openUrl(`https://apps.apple.com/app/id${APP_STORE_ID}`)}>
            {t('update.nudge.cta')}
          </Button>
        </div>
      </div>
      <button onClick={dismiss} aria-label={t('common.close')} className="h-7 w-7 -mr-1 -mt-1 rounded-full flex items-center justify-center text-ink-3 active:bg-section">
        <X size={16} />
      </button>
    </div>
  );
}
