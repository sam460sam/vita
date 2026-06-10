import { useEffect, type ReactNode } from 'react';
import { Button, StarMascot } from '@/ui';
import { useT } from '@/i18n';
import { usePremium } from './premium';
import { TRIAL_DAYS, PRICE_FALLBACK } from './config';

/**
 * Hard paywall gate. When a subscription is required (Superwall configured + not
 * subscribed) it presents the Superwall paywall and shows a branded fallback
 * screen behind it (so the app is never accessible without an active trial/sub).
 * When billing is dormant (no API key) it's a transparent pass-through.
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { requiresSubscription, presentPaywall } = usePremium();

  useEffect(() => {
    if (requiresSubscription) void presentPaywall();
  }, [requiresSubscription, presentPaywall]);

  if (!requiresSubscription) return <>{children}</>;
  return <LockedScreen onUnlock={() => void presentPaywall()} />;
}

function LockedScreen({ onUnlock }: { onUnlock: () => void }) {
  const t = useT();
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 bg-app pt-safe-top pb-safe-bottom">
      <StarMascot size={96} animated />
      <h1 className="text-2xl font-bold text-ink mt-6">{t('gate.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-xs">{t('gate.subtitle')}</p>
      <div className="mt-6 rounded-card bg-section px-5 py-3.5 shadow-chip">
        <p className="text-[15px] font-bold text-ink">{t('gate.headline', { days: TRIAL_DAYS, price: PRICE_FALLBACK })}</p>
      </div>
      <Button size="lg" className="mt-6 w-full max-w-xs" onClick={onUnlock}>
        {t('gate.cta')}
      </Button>
      <p className="text-[12px] text-ink-3 mt-3 max-w-xs leading-relaxed">{t('gate.note')}</p>
    </div>
  );
}
