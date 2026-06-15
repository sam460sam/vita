import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import {
  addMonths,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
} from 'date-fns';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, EmptyState, Button, Input, IconButton } from '@/ui';
import { cn } from '@/lib/cn';
import { todayISO, activeDfnLocale } from '@/lib/format';
import { JournalForm } from './JournalForm';
import { moodMeta } from './mood';
import type { JournalEntry } from '@/data/types';
import { useT, type TKey } from '@/i18n';

export function JournalPage() {
  const t = useT();
  const entries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().toArray(), [], []);
  const [cursor, setCursor] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [defaultDate, setDefaultDate] = useState<string | undefined>();
  const [query, setQuery] = useState('');

  const byDate = useMemo(() => {
    const m = new Map<string, JournalEntry>();
    for (const e of entries ?? []) if (!m.has(e.date)) m.set(e.date, e);
    return m;
  }, [entries]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const out: Date[] = [];
    let d = start;
    while (d <= end) {
      out.push(d);
      d = addDays(d, 1);
    }
    return out;
  }, [cursor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = entries ?? [];
    if (!q) return list;
    return list.filter((e) => e.text.toLowerCase().includes(q) || e.tags.some((t) => t.includes(q)));
  }, [entries, query]);

  function openDay(dateISO: string) {
    const existing = byDate.get(dateISO);
    setEditing(existing ?? null);
    setDefaultDate(dateISO);
    setFormOpen(true);
  }

  const weekLabels = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <>
      <PageHeader
        title={t('journal.title')}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditing(null); setDefaultDate(todayISO()); setFormOpen(true); }}>
            {t('journal.voice')}
          </Button>
        }
      />
      <Screen>
        {/* Calendar */}
        <Card heroAccent="var(--c-journal)" className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <IconButton label={t('common.previous')} onClick={() => setCursor((c) => addMonths(c, -1))}>
              <ChevronLeft size={18} />
            </IconButton>
            <span className="text-[15px] font-semibold text-ink capitalize">{format(cursor, 'MMMM yyyy', { locale: activeDfnLocale() })}</span>
            <IconButton label={t('common.next')} onClick={() => setCursor((c) => addMonths(c, 1))}>
              <ChevronRight size={18} />
            </IconButton>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekLabels.map((w, i) => (
              <div key={i} className="text-center text-[11px] font-semibold text-ink-3">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const iso = format(d, 'yyyy-MM-dd');
              const entry = byDate.get(iso);
              const meta = entry ? moodMeta(entry.mood) : null;
              const inMonth = isSameMonth(d, cursor);
              return (
                <button
                  key={iso}
                  onClick={() => openDay(iso)}
                  className={cn(
                    'aspect-square rounded-lg flex flex-col items-center justify-center text-[13px] relative transition-colors',
                    !inMonth && 'opacity-30',
                    isToday(d) && 'ring-1 ring-ink/20',
                  )}
                  style={meta ? { background: meta.color, color: '#fff' } : { background: 'var(--c-section)' }}
                >
                  <span className={cn('tnum font-medium', meta ? 'text-white' : 'text-ink-2')}>{format(d, 'd')}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Search + entries */}
        <Card>
          <CardHeader title={t('journal.entries')} />
          <div className="relative mb-3">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('journal.searchPh')} className="pl-10" />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={query ? t('journal.noResults.title') : t('journal.empty.title')}
              description={query ? t('journal.noResults.desc') : t('journal.empty.desc')}
            />
          ) : (
            <div className="divide-y divide-divider">
              {filtered.map((e) => {
                const meta = moodMeta(e.mood);
                return (
                  <button
                    key={e.id}
                    onClick={() => { setEditing(e); setDefaultDate(e.date); setFormOpen(true); }}
                    className="w-full flex items-start gap-3 py-3 text-left active:bg-section -mx-1 px-1 rounded-lg"
                  >
                    <span
                      className="h-10 w-10 rounded-2xl flex items-center justify-center text-xl leading-none flex-shrink-0 mt-0.5"
                      style={{ background: `${meta.color}24` }}
                      title={t(`mood.${meta.value}` as TKey)}
                    >
                      {meta.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] text-ink-2 capitalize">{format(new Date(e.date), 'EEEE d MMMM', { locale: activeDfnLocale() })}</div>
                      {e.text && <div className="text-[15px] text-ink line-clamp-2 mt-0.5">{e.text}</div>}
                      {e.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {e.tags.map((t) => (
                            <span key={t} className="text-[12px] text-project font-medium">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </Screen>

      <JournalForm open={formOpen} onClose={() => setFormOpen(false)} entry={editing} defaultDate={defaultDate} />
    </>
  );
}
