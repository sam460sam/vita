import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, ChevronRight, Flame, CheckSquare, StickyNote, BookHeart, FolderKanban, Target, Wallet } from 'lucide-react';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Input, EmptyState } from '@/ui';
import { habitDisplayName } from '@/features/abitudini/recommended';
import { categoryLabelKey } from '@/features/finanze/categories';
import { formatMoney, activeDfnLocale } from '@/lib/format';
import { format, parseISO } from 'date-fns';
import { useT, type TKey } from '@/i18n';
import { readSettings } from '@/data/repo';
import type { LucideIcon } from 'lucide-react';

interface Hit {
  id: string;
  group: TKey;
  icon: LucideIcon;
  color: string;
  title: string;
  subtitle?: string;
  to: string;
}

export function SearchPage() {
  const t = useT();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const notes = useLiveQuery(() => db.notes.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const projects = useLiveQuery(() => db.projects.toArray(), [], []);
  const goals = useLiveQuery(() => db.goals.toArray(), [], []);
  const txs = useLiveQuery(() => db.transactions.toArray(), [], []);
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const currency = settings?.currency ?? 'EUR';

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const has = (...parts: (string | undefined)[]) => parts.some((p) => p && p.toLowerCase().includes(term));
    const out: Hit[] = [];

    for (const h of (habits ?? []).filter((x) => !x.archived)) {
      const name = habitDisplayName(h, t);
      if (has(name)) out.push({ id: h.id, group: 'nav.habits', icon: Flame, color: 'var(--c-habit)', title: name, to: '/abitudini' });
    }
    for (const k of tasks ?? []) {
      if (has(k.title, k.notes)) out.push({ id: k.id, group: 'search.tasks', icon: CheckSquare, color: 'var(--c-project)', title: k.title, subtitle: k.notes, to: k.projectId ? `/progetti/${k.projectId}` : '/oggi' });
    }
    for (const n of notes ?? []) {
      if (has(n.title, n.body)) out.push({ id: n.id, group: 'nav.notes', icon: StickyNote, color: 'var(--c-note)', title: n.title || n.body.slice(0, 40), subtitle: n.title ? n.body.slice(0, 60) : undefined, to: '/note' });
    }
    for (const j of journals ?? []) {
      if (has(j.text, ...(j.tags ?? []))) out.push({ id: j.id, group: 'nav.journal', icon: BookHeart, color: 'var(--c-journal)', title: format(parseISO(j.date), 'd MMM yyyy', { locale: activeDfnLocale() }), subtitle: j.text.slice(0, 60), to: '/diario' });
    }
    for (const p of (projects ?? []).filter((x) => !x.archived)) {
      if (has(p.name, p.description)) out.push({ id: p.id, group: 'nav.projects', icon: FolderKanban, color: p.color || 'var(--c-project)', title: p.name, subtitle: p.description, to: `/progetti/${p.id}` });
    }
    for (const g of goals ?? []) {
      if (has(g.title, g.description)) out.push({ id: g.id, group: 'nav.goals', icon: Target, color: 'var(--c-project)', title: g.title, subtitle: g.description, to: '/obiettivi' });
    }
    for (const x of txs ?? []) {
      const cat = t(categoryLabelKey(x.category));
      if (has(x.note, cat)) out.push({ id: x.id, group: 'nav.finances', icon: Wallet, color: 'var(--c-finance)', title: x.note || cat, subtitle: `${format(parseISO(x.date), 'd MMM', { locale: activeDfnLocale() })} · ${x.type === 'income' ? '+' : '−'}${formatMoney(x.amount, currency)}`, to: '/finanze' });
    }
    return out;
  }, [q, habits, tasks, notes, journals, projects, goals, txs, currency, t]);

  // Group hits by their section, capped per group.
  const groups = useMemo(() => {
    const m = new Map<TKey, Hit[]>();
    for (const h of hits) {
      const arr = m.get(h.group) ?? [];
      if (arr.length < 8) arr.push(h);
      m.set(h.group, arr);
    }
    return [...m.entries()];
  }, [hits]);

  return (
    <>
      <PageHeader title={t('search.title')} />
      <Screen>
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <Input autoFocus className="!pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('search.ph')} />
        </div>

        {q.trim().length < 2 ? (
          <EmptyState mascot title={t('search.title')} description={t('search.start')} />
        ) : hits.length === 0 ? (
          <EmptyState mascot title={t('search.noResults')} description={t('search.noResultsDesc')} />
        ) : (
          <div className="space-y-5">
            {groups.map(([group, items]) => (
              <div key={group}>
                <div className="metric-label mb-2 px-1">{t(group)}</div>
                <div className="bg-card rounded-card shadow-card border border-line/40 dark:border-transparent overflow-hidden">
                  {items.map((h, i) => {
                    const Icon = h.icon;
                    return (
                      <button
                        key={h.id}
                        onClick={() => navigate(h.to)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 text-left active:bg-section transition-colors ${i > 0 ? 'border-t border-line/40 dark:border-white/5' : ''}`}
                      >
                        <span className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${h.color} 16%, transparent)`, color: h.color }}>
                          <Icon size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold text-ink truncate">{h.title}</span>
                          {h.subtitle && <span className="block text-[12px] text-ink-2 truncate">{h.subtitle}</span>}
                        </span>
                        <ChevronRight size={16} className="text-ink-3 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Screen>
    </>
  );
}
