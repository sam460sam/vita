import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SECONDARY_NAV } from '@/app/nav';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Divider } from '@/ui';

export function MorePage() {
  return (
    <>
      <PageHeader title="Altro" />
      <Screen>
        <Card inset={false} className="overflow-hidden">
          {SECONDARY_NAV.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={item.to}>
                {i > 0 && <Divider />}
                <Link to={item.to} className="flex items-center gap-3 px-4 py-3.5 active:bg-section transition-colors">
                  <span className="h-9 w-9 rounded-full bg-section flex items-center justify-center" style={{ color: item.accent ?? 'var(--c-ink-2)' }}>
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-[15px] text-ink font-medium">{item.label}</span>
                  <ChevronRight size={18} className="text-ink-3" />
                </Link>
              </div>
            );
          })}
        </Card>
        <p className="text-center text-[12px] text-ink-3 mt-6">Vita · il tuo life OS</p>
      </Screen>
    </>
  );
}
