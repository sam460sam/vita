import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Sheet, Input } from '@/ui';
import { SPORTS, type Sport } from './sports';
import { useT } from '@/i18n';

export function SportPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (sport: Sport) => void;
}) {
  const t = useT();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SPORTS;
    return SPORTS.filter((s) => s.name.toLowerCase().includes(t));
  }, [q]);

  return (
    <Sheet open={open} onClose={onClose} title={t('sport.choose')} size="full">
      <div className="sticky top-0 -mt-1 pb-2 bg-card z-10">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('sport.search')}
            className="pl-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {filtered.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onPick(s)}
              className="flex items-center gap-2.5 p-3 rounded-card bg-section hover:bg-divider transition-colors text-left min-w-0"
            >
              <span className="h-9 w-9 rounded-full bg-card flex items-center justify-center flex-shrink-0 text-activity shadow-card">
                <Icon size={18} />
              </span>
              <span className="text-[13px] font-medium text-ink leading-tight min-w-0 break-words hyphens-auto">{s.name}</span>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="col-span-2 text-center text-ink-3 py-8 text-sm">{t('sport.none')}</p>}
      </div>
    </Sheet>
  );
}
