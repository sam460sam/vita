import { Star } from 'lucide-react';
import { platform } from '@/platform/platform';
import { useT } from '@/i18n';

const GOLD = '#C9A227';

/** Vyta's App Store id. */
export const APP_STORE_ID = '6776238780';

/** Open the App Store review/rating page for Vyta. On iOS this opens the
 *  App Store app directly on the "write a review" screen. */
export function openAppStoreReview() {
  platform.openUrl(`https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`);
}

/** "Rate our app" card — cream/gold, links straight to the App Store. */
export function RateCard() {
  const t = useT();
  return (
    <div className="rounded-card bg-card shadow-card border border-line/40 dark:border-transparent p-4">
      <div className="flex items-center gap-3">
        <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}1f`, color: GOLD }}>
          <Star size={22} fill={GOLD} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-ink">{t('rate.title')}</div>
          <div className="text-[13px] text-ink-2 leading-snug">{t('rate.desc')}</div>
        </div>
      </div>
      <button
        onClick={openAppStoreReview}
        className="mt-3 w-full h-11 rounded-full font-bold text-[15px] text-white active:scale-[0.98] transition-transform"
        style={{ background: GOLD }}
      >
        {t('rate.cta')}
      </button>
    </div>
  );
}
