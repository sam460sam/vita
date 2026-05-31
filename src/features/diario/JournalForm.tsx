import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Sheet, Button, Field, Input, Textarea, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import { createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/data/repo';
import { todayISO } from '@/lib/format';
import type { JournalEntry, Mood } from '@/data/types';
import { MOODS } from './mood';
import { useT, type TKey } from '@/i18n';

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
  const t = useT();

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
      toast.show(t('journalForm.updated'));
    } else {
      await createJournalEntry(data);
      toast.show(t('journalForm.saved'));
    }
    onClose();
  }

  async function remove() {
    if (entry) {
      await deleteJournalEntry(entry.id);
      toast.show(t('journalForm.deleted'));
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('journalForm.edit') : t('journalForm.new')}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save}>
            {editing ? t('common.save') : t('journalForm.save')}
          </Button>
        </div>
      }
    >
      <Field label={t('journalForm.mood')}>
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
              <span className="text-[10px] font-semibold text-ink-2">{t(`mood.${m.value}` as TKey)}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label={t('journalForm.date')}>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
      </Field>

      <Field label={t('journalForm.notes')}>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('journalForm.notesPh')} className="min-h-[140px]" />
      </Field>

      <Field label={t('journalForm.tags')}>
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
          placeholder={t('journalForm.tagPh')}
        />
      </Field>
    </Sheet>
  );
}
