import { useState, type ReactNode } from 'react';
import { Button, StarMascot, useToast } from '@/ui';
import { useT } from '@/i18n';
import { usePremium } from './premium';
import { MONTHLY_PACKAGE_TYPE, TRIAL_DAYS, PRICE_FALLBACK } from './config';

/**
 * Hard paywall gate. When a subscription is required (RevenueCat configured +
 * not subscribed) it shows the paywall screen ("7 days free, then €2,99/month").
 * Transparent pass-through when billing is dormant (no API key).
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const { requiresSubscription } = usePremium();
  if (!requiresSubscription) return <>{children}</>;
  return <Paywall />;
}

function Paywall() {
  const t = useT();
  const toast = useToast();
  const { packages, purchase, restore } = usePremium();
  const [busy, setBusy] = useState(false);

  const monthly = packages.find((p) => p.type === MONTHLY_PACKAGE_TYPE) ?? packages[0];
  const price = monthly?.priceString || PRICE_FALLBACK;

  async function start() {
    if (!monthly) {
      toast.show(t('pro.soon'));
      return;
    }
    setBusy(true);
    const ok = await purchase(monthly);
    setBusy(false);
    if (!ok) toast.show(t('pro.purchaseError'));
  }

  async function onRestore() {
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    toast.show(ok ? t('pro.restored') : t('pro.noPurchases'));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center px-6 bg-app overflow-hidden">
      <StarMascot size={96} animated />
      <h1 className="text-2xl font-bold text-ink mt-6">{t('gate.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-xs">{t('gate.subtitle')}</p>
      <div className="mt-6 rounded-card bg-section px-5 py-3.5 shadow-chip">
        <p className="text-[15px] font-bold text-ink">{t('gate.headline', { days: TRIAL_DAYS, price })}</p>
      </div>
      <Button size="lg" disabled={busy} className="mt-6 w-full max-w-xs" onClick={start}>
        {t('gate.cta')}
      </Button>
      <button onClick={onRestore} disabled={busy} className="text-[13px] text-ink-2 mt-3 py-2 disabled:opacity-50">
        {t('pro.restore')}
      </button>
      <p className="text-[11px] text-ink-3 mt-2 max-w-xs leading-relaxed">{t('gate.note')}</p>
    </div>
  );
}
