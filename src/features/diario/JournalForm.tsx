import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Sheet, Button, Field, Input, Textarea, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/data/repo';
import { todayISO } from '@/lib/format';
import type { JournalEntry, Mood } from '@/data/types';
import { MOODS } from './mood';

export function JournalForm({
  open,
  onClose,
  entry,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  entry?: JournalEntry | null;
  defaultDate?: string;
}) {
  const editing = !!entry;
  const [date, setDate] = useState(todayISO());
  const [mood, setMood] = useState<Mood>(3);
  const [text, setText] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setDate(entry?.date ?? defaultDate ?? todayISO());
      setMood(entry?.mood ?? 3);
      setText(entry?.text ?? '');
      setTags(entry?.tags ?? []);
      setNewTag('');
    }
  }, [open, entry, defaultDate]);

  function addTag() {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags((p) => [...p, t]);
    setNewTag('');
  }

  async function save() {
    const data = { date, mood, text: text.trim(), tags };
    if (editing && entry) {
      await updateJournalEntry(entry.id, data);
      toast.show('Voce aggiornata');
    } else {
      await createJournalEntry(data);
      toast.show('Voce salvata');
    }
    onClose();
  }

  async function remove() {
    if (entry) {
      await deleteJournalEntry(entry.id);
      toast.show('Voce eliminata');
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Modifica voce' : 'Nuova voce'}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              Elimina
            </Button>
          )}
          <Button block size="lg" onClick={save}>
            {editing ? 'Salva' : 'Salva voce'}
          </Button>
        </div>
      }
    >
      <Field label="Come ti senti?">
        <div className="flex justify-between gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-card transition-all',
                mood === m.value ? 'bg-section ring-2' : 'opacity-50 hover:opacity-100',
              )}
              style={mood === m.value ? ({ '--tw-ring-color': m.color } as React.CSSProperties) : undefined}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-[10px] font-semibold text-ink-2">{m.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Data">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
      </Field>

      <Field label="Note">
        <Textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Com'è andata la giornata?" className="min-h-[140px]" />
      </Field>

      <Field label="Tag">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 bg-section rounded-full pl-2.5 pr-1 h-7 text-[13px] text-ink-2">
                #{t}
                <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="p-0.5" aria-label="Rimuovi tag">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder="Aggiungi un tag e premi Invio"
        />
      </Field>
    </Sheet>
  );
}
