import { useEffect, useRef, useState } from 'react';
import { Check, GripVertical, Plus, X } from 'lucide-react';
import { Sheet, Button, Input, Textarea, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import { createNote, updateNote, deleteNote, newChecklistItem } from '@/data/repo';
import type { Note, NoteChecklistItem } from '@/data/types';
import { NOTE_COLORS, DEFAULT_NOTE_COLOR } from './colors';
import { useT } from '@/i18n';

export function NoteForm({ open, onClose, note }: { open: boolean; onClose: () => void; note?: Note | null }) {
  const editing = !!note;
  const t = useT();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [checklist, setChecklist] = useState<NoteChecklistItem[]>([]);
  const [color, setColor] = useState(DEFAULT_NOTE_COLOR);
  const [pinned, setPinned] = useState(false);
  const [newItem, setNewItem] = useState('');
  const newItemRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? '');
      setBody(note?.body ?? '');
      setChecklist(note?.checklist ?? []);
      setColor(note?.color ?? DEFAULT_NOTE_COLOR);
      setPinned(note?.pinned ?? false);
      setNewItem('');
    }
  }, [open, note]);

  function addItem() {
    const text = newItem.trim();
    if (!text) return;
    setChecklist((p) => [...p, newChecklistItem(text)]);
    setNewItem('');
    // Keep focus so several items can be added in a row.
    requestAnimationFrame(() => newItemRef.current?.focus());
  }

  function toggleItem(id: string) {
    setChecklist((p) => p.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  }

  function editItem(id: string, text: string) {
    setChecklist((p) => p.map((it) => (it.id === id ? { ...it, text } : it)));
  }

  function removeItem(id: string) {
    setChecklist((p) => p.filter((it) => it.id !== id));
  }

  async function save() {
    // Drop empty checklist lines before persisting.
    const cleanList = checklist.filter((it) => it.text.trim());
    const data = { title: title.trim(), body: body.trim(), checklist: cleanList, color, pinned };
    if (editing && note) {
      await updateNote(note.id, data);
      toast.show(t('noteForm.updated'));
    } else if (data.title || data.body || cleanList.length) {
      await createNote(data);
      toast.show(t('noteForm.saved'));
    }
    onClose();
  }

  async function remove() {
    if (note) {
      await deleteNote(note.id);
      toast.show(t('noteForm.deleted'));
      onClose();
    }
  }

  const doneCount = checklist.filter((it) => it.done).length;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('noteForm.edit') : t('noteForm.new')}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save} style={{ background: color }}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('noteForm.titlePh')}
        className="!text-[17px] !font-semibold border-none !bg-transparent !px-0"
      />

      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={t('noteForm.bodyPh')}
        className="min-h-[120px] border-none !bg-transparent !px-0 mt-1"
      />

      {/* Checklist */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="metric-label">{t('noteForm.checklist')}</span>
          {checklist.length > 0 && (
            <span className="text-[12px] font-semibold tnum" style={{ color }}>
              {doneCount}/{checklist.length}
            </span>
          )}
        </div>

        <div className="space-y-1">
          {checklist.map((it) => (
            <div key={it.id} className="flex items-center gap-2 group">
              <GripVertical size={15} className="text-ink-3 flex-shrink-0 opacity-40" />
              <button
                onClick={() => toggleItem(it.id)}
                aria-label={it.done ? t('noteForm.uncheck') : t('noteForm.check')}
                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: it.done ? color : 'transparent',
                  border: it.done ? 'none' : '2px solid var(--c-line)',
                }}
              >
                {it.done && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
              <input
                value={it.text}
                onChange={(e) => editItem(it.id, e.target.value)}
                className={cn(
                  'flex-1 min-w-0 bg-transparent text-[15px] text-ink outline-none py-1.5',
                  it.done && 'line-through text-ink-3',
                )}
              />
              <button
                onClick={() => removeItem(it.id)}
                aria-label={t('common.delete')}
                className="p-1 text-ink-3 flex-shrink-0"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Add a checklist item */}
        <div className="flex items-center gap-2 mt-1">
          <Plus size={15} className="text-ink-3 flex-shrink-0 ml-[30px]" />
          <input
            ref={newItemRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
            onBlur={addItem}
            placeholder={t('noteForm.addItem')}
            className="flex-1 min-w-0 bg-transparent text-[15px] text-ink placeholder:text-ink-3 outline-none py-1.5"
          />
        </div>
      </div>

      {/* Color swatches */}
      <div className="mt-5">
        <span className="metric-label">{t('noteForm.color')}</span>
        <div className="flex gap-2.5 mt-2">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.key}
              onClick={() => setColor(c.value)}
              aria-label={c.key}
              className="h-8 w-8 rounded-full flex items-center justify-center transition-transform active:scale-90"
              style={{ background: c.value, outline: color === c.value ? `2px solid ${c.value}` : 'none', outlineOffset: 2 }}
            >
              {color === c.value && <Check size={15} className="text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Pin toggle */}
      <button
        onClick={() => setPinned((p) => !p)}
        className="mt-5 flex items-center gap-2 text-[14px] font-medium"
        style={{ color: pinned ? color : 'var(--c-ink-2)' }}
      >
        <span
          className="h-5 w-9 rounded-full relative transition-colors flex-shrink-0"
          style={{ background: pinned ? color : 'var(--c-line)' }}
        >
          <span
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all"
            style={{ left: pinned ? '18px' : '2px' }}
          />
        </span>
        {t('noteForm.pin')}
      </button>
    </Sheet>
  );
}
