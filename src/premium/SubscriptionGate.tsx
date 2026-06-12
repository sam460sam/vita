import { useState, type ReactNode } from 'react';
import { Crown, Check, X, Wallet, Target, CalendarDays, BarChart3 } from 'lucide-react';
import { Button, useToast } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { usePremium } from './premium';
import { PRICE_FALLBACK, TRIAL_DAYS, YEARLY_SAVINGS_PCT, TERMS_URL, PRIVACY_URL, type PlanPeriod } from './config';

const GOLD = '#C9A227';

/** Wrap a Pro-only area: shows the children when subscribed, else the paywall. */
export function ProGate({ children }: { children: ReactNode }) {
  const { isPro } = usePremium();
  if (isPro) return <>{children}</>;
  return <Paywall />;
}

/**
 * Vyta Pro paywall — cream/gold, two plans (yearly highlighted), 7-day trial,
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

  const features: { icon: typeof Wallet; key: TKey; color: string }[] = [
    { icon: Wallet, key: 'paywall.feature.finances', color: 'var(--c-finance)' },
    { icon: Target, key: 'paywall.feature.goals', color: 'var(--c-project)' },
    { icon: CalendarDays, key: 'paywall.feature.calendar', color: 'var(--c-activity)' },
    { icon: BarChart3, key: 'paywall.feature.stats', color: 'var(--c-habit)' },
  ];

  return (
    <div className="min-h-[100dvh] bg-app relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[140%]" style={{ background: `radial-gradient(ellipse at top, ${GOLD}33, transparent 70%)` }} />
      <div className="relative max-w-md mx-auto px-6 pt-safe-top pb-[calc(28px+env(safe-area-inset-bottom))] min-h-[100dvh] flex flex-col">
        <div className="h-12 flex items-center justify-end pt-2">
          {onClose && (
            <button onClick={onClose} aria-label={t('common.close')} className="h-9 w-9 rounded-full bg-section flex items-center justify-center text-ink-2 active:scale-90 transition-transform">
              <X size={18} />
            </button>
          )}
        </div>

        <div className="text-center mt-2">
          <span className="inline-flex h-16 w-16 rounded-3xl items-center justify-center" style={{ background: `${GOLD}1f`, color: GOLD }}>
            <Crown size={32} fill={GOLD} />
          </span>
          <h1 className="text-[26px] font-extrabold text-ink tracking-tight mt-4">{t('paywall.title')}</h1>
          <p className="text-[14px] text-ink-2 mt-1.5 leading-snug">{t('paywall.subtitle')}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.key} className="flex items-center gap-2 bg-card rounded-2xl shadow-chip px-3 py-2.5">
                <span style={{ color: f.color }}><Icon size={18} /></span>
                <span className="text-[13px] font-semibold text-ink">{t(f.key)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 space-y-2.5">
          <PlanCard period="yearly" price={priceOf('yearly')} selected={period === 'yearly'} onSelect={() => setPeriod('yearly')} highlight />
          <PlanCard period="monthly" price={priceOf('monthly')} selected={period === 'monthly'} onSelect={() => setPeriod('monthly')} />
        </div>

        <p className="text-center text-[13px] font-bold mt-4" style={{ color: GOLD }}>
          {t('paywall.trial', { n: TRIAL_DAYS, price: priceOf(period) })}
        </p>

        <div className="flex-1 min-h-[12px]" />

        {billingActive ? (
          <Button block size="lg" disabled={busy} onClick={subscribe} className="!bg-[#C9A227] !text-white">
            {t('paywall.cta', { n: TRIAL_DAYS })}
          </Button>
        ) : (
          <div className="rounded-card bg-section px-4 py-3 text-center text-[13px] text-ink-2">{t('paywall.web')}</div>
        )}

        <div className="flex items-center justify-center gap-4 mt-3 text-[12px] text-ink-3">
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
  return (
    <button
      onClick={onSelect}
      className="w-full rounded-card bg-card p-4 text-left relative transition-all active:scale-[0.99]"
      style={{ boxShadow: selected ? `0 0 0 2.5px ${GOLD}, 0 6px 18px ${GOLD}22` : '0 4px 14px rgba(83,52,20,0.06)' }}
    >
      {highlight && (
        <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full" style={{ background: GOLD }}>
          {t('paywall.bestValue')}
        </span>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[16px] font-extrabold text-ink">{t(period === 'yearly' ? 'paywall.yearly' : 'paywall.monthly')}</div>
          {period === 'yearly' && <div className="text-[12px] font-bold mt-0.5" style={{ color: GOLD }}>{t('paywall.save', { n: YEARLY_SAVINGS_PCT })}</div>}
        </div>
        <div className="text-right">
          <div className="text-[18px] font-extrabold text-ink tnum">{price}</div>
          <div className="text-[11px] text-ink-3">{t(period === 'yearly' ? 'paywall.perYear' : 'paywall.perMonth')}</div>
        </div>
        <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3" style={{ background: selected ? GOLD : 'transparent', border: selected ? 'none' : '2px solid var(--c-line)' }}>
          {selected && <Check size={14} className="text-white" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}
