import { useState } from 'react';
import { Check, Sparkles, Wallet, Target, CalendarDays, BarChart3, Star } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, Segmented, useToast } from '@/ui';
import { useT } from '@/i18n';

export function ProPage() {
  const t = useT();
  const toast = useToast();
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly');

  const features = [
    { icon: Wallet, key: 'pro.feature.finances' as const, color: 'var(--c-finance)' },
    { icon: Target, key: 'pro.feature.goals' as const, color: 'var(--c-project)' },
    { icon: CalendarDays, key: 'pro.feature.calendar' as const, color: 'var(--c-activity)' },
    { icon: BarChart3, key: 'pro.feature.stats' as const, color: 'var(--c-habit)' },
    { icon: Star, key: 'pro.feature.future' as const, color: 'var(--c-journal)' },
  ];

  return (
    <>
      <PageHeader title={t('pro.title')} back="/altro" />
      <Screen>
        {/* Hero */}
        <div className="flex flex-col items-center text-center pt-2 pb-6">
          <span className="h-16 w-16 rounded-2xl bg-ink flex items-center justify-center text-white mb-4">
            <Sparkles size={30} />
          </span>
          <h1 className="text-2xl font-bold text-ink">{t('pro.title')}</h1>
          <p className="text-[15px] text-ink-2 mt-1 max-w-xs">{t('pro.subtitle')}</p>
        </div>

        {/* Features */}
        <Card className="mb-4">
          <div className="space-y-3.5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.key} className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${f.color}1a`, color: f.color }}>
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink">{t(f.key)}</span>
                  <Check size={18} className="text-habit" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Plan selector */}
        <Segmented
          className="w-full mb-3"
          value={plan}
          onChange={setPlan}
          options={[
            { value: 'yearly', label: t('pro.yearly') },
            { value: 'monthly', label: t('pro.monthly') },
          ]}
        />
        {plan === 'yearly' && (
          <div className="text-center mb-3">
            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-habit bg-habit/10 rounded-full px-3 h-7">
              {t('pro.yearly.badge')}
            </span>
          </div>
        )}

        <Button block size="lg" onClick={() => toast.show(t('pro.soon'))}>
          {t('pro.cta')}
        </Button>
        <button
          onClick={() => toast.show(t('pro.soon'))}
          className="w-full text-center text-[13px] text-ink-2 mt-3 py-2"
        >
          {t('pro.restore')}
        </button>

        <p className="text-center text-[12px] text-ink-3 mt-2">{t('pro.soon')}</p>
      </Screen>
    </>
  );
}
