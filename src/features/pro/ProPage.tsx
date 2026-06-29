import { Crown, Check, Settings2 } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Button } from '@/ui';
import { useT } from '@/i18n';
import { usePremium } from '@/premium/premium';
import { Paywall } from '@/premium/SubscriptionGate';

const GOLD = '#C9A227';

/** The "Vyta Pro" destination — paywall when not subscribed, status when Pro. */
export function ProPage() {
  const t = useT();
  const { isPro, manage } = usePremium();

  if (!isPro) {
    return <Paywall />;
  }

  return (
    <>
      <PageHeader title={t('pro.title')} back="/altro" />
      <Screen>
        <div className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent p-6 text-center">
          <span className="inline-flex h-16 w-16 rounded-3xl items-center justify-center" style={{ background: `${GOLD}1f`, color: GOLD }}>
            <Crown size={32} fill={GOLD} />
          </span>
          <h2 className="text-[20px] font-extrabold text-ink mt-4">{t('pro.activeTitle')}</h2>
          <p className="text-[14px] text-ink-2 mt-1.5">{t('pro.activeDesc')}</p>
          <div className="mt-5 space-y-2 text-left max-w-xs mx-auto">
            {(['pro.feat.water', 'pro.feat.finances', 'pro.feat.goals', 'pro.feat.calendar', 'pro.feat.stats', 'pro.feat.personality', 'pro.feat.future'] as const).map((k) => (
              <div key={k} className="flex items-center gap-2 text-[14px] text-ink">
                <span className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GOLD }}>
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
                {t(k)}
              </div>
            ))}
          </div>
          <Button variant="subtle" className="mt-6" icon={<Settings2 size={16} />} onClick={() => void manage()}>
            {t('pro.manage')}
          </Button>
        </div>
      </Screen>
    </>
  );
}
