import { useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { useToast } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { usePremium } from './premium';
import { PRICE_FALLBACK, TRIAL_DAYS, TERMS_URL, PRIVACY_URL, type PlanPeriod } from './config';
import vioBloom from '/vio/fioritura.png';

/** Wrap a Pro-only area: shows the children when subscribed, else the paywall. */
export function ProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePremium();
  if (isPro) return <>{children}</>;
  return <Paywall />;
}

/**
 * Vyta Pro paywall — cream/gold, two plans (yearly highlighted), 3-day trial,
 * restore + legal links. On web the purchase actions are hidden (status only).
 */
export function Paywall({ onClose }: { onClose?: () => void }) {
  const t = useT();
  const toast = useToast();
  const { billingActive, packages, purchase, restore } = usePremium();
  const [period, setPeriod] = useState<PlanPeriod>('yearly');
  const [busy, setBusy] = useState(false);

  const priceOf = (p: PlanPeriod) => packages.find((x) => x.period === p)?.priceString || PRICE_FALLBACK[p];
  const selected = packages.find((x) => x.period === period);

  async function subscribe() {
    if (!billingActive || !selected) {
      toast.show(t('paywall.web'));
      return;
    }
    setBusy(true);
    const ok = await purchase(selected.productId);
    setBusy(false);
    if (ok) {
      toast.show(t('paywall.purchased'));
      onClose?.();
    } else {
      toast.show(t('paywall.purchaseError'));
    }
  }

  async function onRestore() {
    if (!billingActive) {
      toast.show(t('paywall.web'));
      return;
    }
    setBusy(true);
    const ok = await restore();
    setBusy(false);
    toast.show(ok ? t('paywall.restored') : t('paywall.noPurchases'));
    if (ok) onClose?.();
  }

  const benefits: TKey[] = ['paywall.benefit.all', 'paywall.benefit.unlimited', 'paywall.benefit.insights', 'paywall.benefit.exclusive'];

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[300px]" style={{ background: 'radial-gradient(125% 80% at 50% -12%, color-mix(in srgb, var(--c-hero-2) 55%, transparent), transparent 70%)' }} />
      <div className="relative max-w-md mx-auto px-5 pt-safe-top pb-[calc(24px+env(safe-area-inset-bottom))] min-h-[100dvh] flex flex-col">
        <div className="h-10 flex items-center justify-end pt-2">
          {onClose && (
            <button onClick={onClose} aria-label={t('common.close')} className="h-9 w-9 rounded-full bg-card shadow-chip flex items-center justify-center text-ink-2 active:scale-90 transition-transform">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Header + Vio in bloom */}
        <div className="relative pr-28">
          <h1 className="display-serif text-[30px] text-ink leading-tight">{t('paywall.unlockTitle')}</h1>
          <img src={vioBloom} alt="" aria-hidden draggable={false} className="vio-bob absolute -right-2 -top-4 w-32 h-32 object-contain" />
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          {benefits.map((k) => (
            <div key={k} className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#4F9D55' }}>
                <Check size={15} className="text-white" strokeWidth={3} />
              </span>
              <span className="text-[15px] font-medium text-ink">{t(k)}</span>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="mt-6 space-y-3">
          <PlanCard period="yearly" price={priceOf('yearly')} selected={period === 'yearly'} onSelect={() => setPeriod('yearly')} highlight />
          <PlanCard period="monthly" price={priceOf('monthly')} selected={period === 'monthly'} onSelect={() => setPeriod('monthly')} />
        </div>

        <div className="flex-1 min-h-[16px]" />

        {billingActive ? (
          <button
            disabled={busy}
            onClick={subscribe}
            className="w-full h-[54px] rounded-2xl font-bold text-[16px] flex items-center justify-center active:scale-[0.97] transition-transform shadow-glow-gold disabled:opacity-60"
            style={{ background: 'linear-gradient(180deg, var(--c-gold-2), var(--c-gold))', color: '#1a1206' }}
          >
            {t('paywall.startTrial')}
          </button>
        ) : (
          <div className="rounded-card bg-section px-4 py-3 text-center text-[13px] text-ink-2">{t('paywall.web')}</div>
        )}

        <p className="text-center text-[12px] text-ink-2 mt-3">{t('paywall.trust')}</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-[12px] text-ink-3">
          <button onClick={onRestore} disabled={busy} className="py-1 disabled:opacity-50">{t('paywall.restore')}</button>
          <span>·</span>
          <a href={TERMS_URL} target="_blank" rel="noreferrer" className="py-1">{t('paywall.terms')}</a>
          <span>·</span>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="py-1">{t('paywall.privacy')}</a>
        </div>
        <p className="text-center text-[10.5px] text-ink-3 mt-2 leading-relaxed">{t('paywall.legal')}</p>
      </div>
    </div>
  );
}

function PlanCard({ period, price, selected, onSelect, highlight }: { period: PlanPeriod; price: string; selected: boolean; onSelect: () => void; highlight?: boolean }) {
  const t = useT();
  const GREEN = '#4F9D55';
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-2xl bg-card p-4 text-left relative transition-all active:scale-[0.99]"
      style={{ boxShadow: selected ? `0 0 0 2.5px ${GREEN}, 0 6px 18px ${GREEN}22` : '0 4px 14px rgba(83,52,20,0.06)' }}
    >
      {highlight && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full" style={{ background: GREEN }}>
          {t('paywall.bestValue')}
        </span>
      )}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[18px] font-extrabold text-ink">{t(period === 'yearly' ? 'paywall.yearly' : 'paywall.monthly')}</div>
          <div className="mt-0.5">
            <span className="text-[18px] font-extrabold text-ink tnum">{price}</span>
            <span className="text-[13px] font-semibold text-ink-3"> / {t(period === 'yearly' ? 'paywall.perYear' : 'paywall.perMonth')}</span>
          </div>
          {period === 'yearly' && <div className="text-[13px] font-semibold mt-0.5" style={{ color: GREEN }}>{t('paywall.withTrial', { n: TRIAL_DAYS })}</div>}
        </div>
        <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: selected ? GREEN : 'transparent', border: selected ? 'none' : '2px solid var(--c-line)' }}>
          {selected && <Check size={14} className="text-white" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}
