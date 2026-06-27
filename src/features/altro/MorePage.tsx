import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, SlidersHorizontal, Crown } from 'lucide-react';
import { useNavItems } from '@/app/nav';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Divider } from '@/ui';
import { useT } from '@/i18n';
import { useIsPro } from '@/premium/premium';
import { PRO_MODULES } from '@/premium/config';
import { GoalsQuiz } from '@/features/plan/GoalsQuiz';
import { BackupCard } from '@/features/backup';
import { RateCard } from '@/features/rating/rating';

export function MorePage() {
  const t = useT();
  const isPro = useIsPro();
  const { more } = useNavItems();
  const [goalsOpen, setGoalsOpen] = useState(false);
  return (
    <>
      <PageHeader title={t('more.title')} />
      <Screen>
        {/* Vita Pro banner */}
        <Link to="/pro">
          <Card className="flex items-center gap-3 mb-4 active:bg-section transition-colors">
            <span className="h-11 w-11 rounded-2xl bg-accent flex items-center justify-center text-on-accent flex-shrink-0 shadow-chip">
              <Sparkles size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-ink">{t('pro.title')}</div>
              <div className="text-[13px] text-ink-2 truncate">{t('pro.subtitle')}</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </Card>
        </Link>

        <Card inset={false} className="overflow-hidden">
          {more.map((item, i) => {
            const Icon = item.icon;
            const proLocked = !isPro && PRO_MODULES.includes(item.to.replace('/', ''));
            return (
              <div key={item.to}>
                {i > 0 && <Divider />}
                <Link to={item.to} className="flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors">
                  <span
                    className="h-10 w-10 rounded-2xl flex items-center justify-center"
                    style={{ background: (item.accent ?? 'var(--c-ink-2)').replace(')', '-tint)'), color: item.accent ?? 'var(--c-ink-2)' }}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink font-medium">{t(item.labelKey)}</span>
                  {proLocked && (
                    <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--c-gold) 20%, transparent)', color: 'var(--c-gold-2)' }} aria-label="Pro">
                      <Crown size={13} fill="currentColor" />
                    </span>
                  )}
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>
              </div>
            );
          })}
          <Divider />
          <button onClick={() => setGoalsOpen(true)} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors text-left">
            <span className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--c-streak) 16%, transparent)', color: 'var(--c-streak)' }}>
              <span className="text-[18px]" aria-hidden>🎯</span>
            </span>
            <span className="flex-1 text-[15px] text-ink font-medium">{t('goalsq.cta')}</span>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <Divider />
          <Link to="/impostazioni#personalizzazione" className="flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors">
            <span className="h-10 w-10 rounded-2xl flex items-center justify-center bg-habit-tint text-habit">
              <SlidersHorizontal size={18} />
            </span>
            <span className="flex-1 text-[15px] text-ink font-medium">{t('personalize.title')}</span>
            <ChevronRight size={18} className="text-ink-3" />
          </Link>
        </Card>
        {goalsOpen && <GoalsQuiz onClose={() => setGoalsOpen(false)} />}

        {/* Rate the app — links straight to the App Store */}
        <div className="mt-4">
          <RateCard />
        </div>

        {/* Backup & restore (moved here from the Home banner) */}
        <div className="mt-4">
          <BackupCard />
        </div>

        <p className="text-center text-[12px] text-ink-3 mt-6">{t('more.tagline')}</p>
      </Screen>
    </>
  );
}
