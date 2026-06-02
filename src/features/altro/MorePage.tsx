import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useNavItems } from '@/app/nav';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Divider } from '@/ui';
import { useT } from '@/i18n';

export function MorePage() {
  const t = useT();
  const { more } = useNavItems();
  return (
    <>
      <PageHeader title={t('more.title')} />
      <Screen>
        {/* Vita Pro banner */}
        <Link to="/pro">
          <Card className="flex items-center gap-3 mb-4 active:bg-section transition-colors">
            <span className="h-10 w-10 rounded-full bg-primary border border-primary-border flex items-center justify-center text-on-primary flex-shrink-0">
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
            return (
              <div key={item.to}>
                {i > 0 && <Divider />}
                <Link to={item.to} className="flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors">
                  <span className="h-9 w-9 rounded-full bg-section flex items-center justify-center" style={{ color: item.accent ?? 'var(--c-ink-2)' }}>
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink font-medium">{t(item.labelKey)}</span>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>
              </div>
            );
          })}
          <Divider />
          <Link to="/impostazioni#personalizzazione" className="flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors">
            <span className="h-9 w-9 rounded-full bg-section flex items-center justify-center text-habit">
              <SlidersHorizontal size={18} />
            </span>
            <span className="flex-1 text-[15px] text-ink font-medium">{t('personalize.title')}</span>
            <ChevronRight size={18} className="text-ink-3" />
          </Link>
        </Card>
        <p className="text-center text-[12px] text-ink-3 mt-6">{t('more.tagline')}</p>
      </Screen>
    </>
  );
}
