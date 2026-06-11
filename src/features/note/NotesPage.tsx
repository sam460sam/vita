import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Search, Pin, ListChecks } from 'lucide-react';
import { db } from '@/data/db';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { EmptyState, Button, Input } from '@/ui';
import { cn } from '@/lib/cn';
import { NoteForm } from './NoteForm';
import { noteTint } from './colors';
import type { Note } from '@/data/types';
import { useT, type TKey } from '@/i18n';

type T = (key: TKey, vars?: Record<string, string | number>) => string;

export function NotesPage() {
  const t = useT();
  const notes = useLiveQuery(() => db.notes.orderBy('updatedAt').reverse().toArray(), [], []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = notes ?? [];
    const match = !q
      ? list
      : list.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.body.toLowerCase().includes(q) ||
            n.checklist.some((c) => c.text.toLowerCase().includes(q)),
        );
    // Pinned first, then by recency (already sorted by updatedAt desc).
    return [...match].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [notes, query]);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader
        title={t('nav.notes')}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={openNew}>
            {t('note.new')}
          </Button>
        }
      />
      <Screen>
        {(notes?.length ?? 0) > 0 && (
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('note.searchPh')} className="pl-10" />
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={28} />}
            title={query ? t('note.noResults.title') : t('note.empty.title')}
            description={query ? t('note.noResults.desc') : t('note.empty.desc')}
            action={!query ? <Button onClick={openNew} icon={<Plus size={16} />}>{t('note.new')}</Button> : undefined}
          />
        ) : (
          <div className="columns-2 gap-3 [column-fill:balance]">
            {filtered.map((n) => (
              <NoteCard key={n.id} note={n} onClick={() => { setEditing(n); setFormOpen(true); }} t={t} />
            ))}
          </div>
        )}
      </Screen>

      <NoteForm open={formOpen} onClose={() => setFormOpen(false)} note={editing} />
    </>
  );
}

function NoteCard({ note, onClick, t }: { note: Note; onClick: () => void; t: T }) {
  const done = note.checklist.filter((c) => c.done).length;
  const total = note.checklist.length;
  const preview = note.checklist.slice(0, 4);

  return (
    <button
      onClick={onClick}
      className="mb-3 w-full break-inside-avoid rounded-card p-3.5 text-left shadow-card active:scale-[0.98] transition-transform"
      style={{ background: noteTint(note.color), borderTop: `3px solid ${note.color}` }}
    >
      <div className="flex items-start gap-1.5">
        {note.title && <h3 className="flex-1 min-w-0 text-[15px] font-bold text-ink leading-snug break-words">{note.title}</h3>}
        {note.pinned && <Pin size={13} className="flex-shrink-0 mt-1" style={{ color: note.color, fill: note.color }} />}
      </div>

      {note.body && <p className="text-[13px] text-ink-2 leading-snug mt-1 whitespace-pre-wrap break-words line-clamp-6">{note.body}</p>}

      {total > 0 && (
        <div className="mt-2 space-y-1">
          {preview.map((c) => (
            <div key={c.id} className="flex items-center gap-1.5">
              <span
                className="h-3.5 w-3.5 rounded-[5px] flex-shrink-0"
                style={{ background: c.done ? note.color : 'transparent', border: c.done ? 'none' : `1.5px solid ${note.color}` }}
              />
              <span className={cn('text-[12px] truncate', c.done ? 'line-through text-ink-3' : 'text-ink-2')}>{c.text}</span>
            </div>
          ))}
          {total > 4 && <div className="text-[11px] text-ink-3 pl-5">+{total - 4}</div>}
          <div className="text-[11px] font-semibold tnum pt-0.5" style={{ color: note.color }}>
            {t('note.checkProgress', { done, total })}
          </div>
        </div>
      )}
    </button>
  );
}
