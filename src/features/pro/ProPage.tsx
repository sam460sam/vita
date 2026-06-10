import { Check, Sparkles, Wallet, Target, CalendarDays, BarChart3, Star } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, useToast } from '@/ui';
import { useT } from '@/i18n';
import { usePremium } from '@/premium/premium';
import { PRICE_FALLBACK } from '@/premium/config';

export function ProPage() {
  const t = useT();
  const toast = useToast();
  const { billingActive, isPremium, inTrial, trialDaysLeft, presentPaywall } = usePremium();

  const features = [
    { icon: Wallet, key: 'pro.feature.finances' as const, color: 'var(--c-finance)' },
    { icon: Target, key: 'pro.feature.goals' as const, color: 'var(--c-project)' },
    { icon: CalendarDays, key: 'pro.feature.calendar' as const, color: 'var(--c-activity)' },
    { icon: BarChart3, key: 'pro.feature.stats' as const, color: 'var(--c-habit)' },
    { icon: Star, key: 'pro.feature.future' as const, color: 'var(--c-journal)' },
  ];

  function onCta() {
    if (!billingActive) {
      toast.show(t('pro.soon'));
      return;
    }
    void presentPaywall();
  }

  return (
    <>
      <PageHeader title={t('pro.title')} back="/altro" />
      <Screen>
        <div className="flex flex-col items-center text-center pt-2 pb-6">
          <span className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center text-on-accent mb-4 shadow-chip">
            <Sparkles size={30} />
          </span>
          <h1 className="text-2xl font-bold text-ink">{t('pro.title')}</h1>
          <p className="text-[15px] text-ink-2 mt-1 max-w-xs">{t('pro.subtitle')}</p>
          {billingActive && isPremium && !inTrial && (
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-habit bg-habit/10 rounded-full px-3 h-7">
              <Check size={14} /> {t('pro.active')}
            </span>
          )}
          {billingActive && inTrial && (
            <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-accent bg-accent/10 rounded-full px-3 h-7">
              {t('pro.trialLeft', { n: trialDaysLeft })}
            </span>
          )}
        </div>

        <Card className="mb-4">
          <div className="space-y-3.5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}1a`, color: f.color }}>
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink">{t(f.key)}</span>
                  <Check size={18} className="text-habit" />
                </div>
              );
            })}
          </div>
        </Card>

        {!(billingActive && isPremium) && (
          <>
            <div className="text-center mb-3">
              <span className="text-[15px] font-bold text-ink">
                {t('gate.headline', { price: PRICE_FALLBACK })}
              </span>
            </div>
            <Button block size="lg" onClick={onCta}>
              {t('gate.cta')}
            </Button>
          </>
        )}

        {!billingActive && <p className="text-center text-[12px] text-ink-3 mt-3">{t('pro.soon')}</p>}
        {billingActive && <p className="text-center text-[11px] text-ink-3 mt-3 leading-relaxed">{t('pro.legal')}</p>}
      </Screen>
    </>
  );
}
