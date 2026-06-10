import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Heading1, Heading2, List, CheckSquare, Image, Bookmark, BookmarkCheck,
} from 'lucide-react';
import { Sheet, Button, Field, Input, Select } from '@/ui';
import { saveNote, deleteNote, getNoteProjects, INBOX_ID } from '@/data/note-repo';
import type { Note } from '@/data/types';
import { extractTags, wrapLine } from './note-logic';

interface Props {
  open: boolean;
  note?: Note | null;
  /** Pre-fill projectId when opening from a cantiere / work-day context. */
  defaultProjectId?: string;
  /** Pre-fill the calendar date. */
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function NoteSheet({ open, note, defaultProjectId, defaultDate, onClose, onSaved }: Props) {
  const projects = useLiveQuery(() => getNoteProjects(), []) ?? [];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [projectId, setProjectId] = useState(INBOX_ID);
  const [data, setData] = useState('');
  const [inAgenda, setInAgenda] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmDelete(false);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setProjectId(note.projectId);
      setData(note.data ?? '');
      setInAgenda(note.inAgenda);
    } else {
      setTitle('');
      setContent('');
      setProjectId(defaultProjectId ?? INBOX_ID);
      setData(defaultDate ?? '');
      setInAgenda(false);
    }
  }, [open, note, defaultProjectId, defaultDate]);

  async function salva() {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);
    try {
      const tags = extractTags(content);
      await saveNote({
        id: note?.id,
        title: title.trim() || content.split('\n')[0].slice(0, 60).trim(),
        content,
        projectId,
        data: data || undefined,
        inAgenda,
        tags,
        attachments: note?.attachments ?? [],
        cantiereId: note?.cantiereId,
        workDayDate: note?.workDayDate,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function elimina() {
    if (!note) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deleteNote(note.id);
      onSaved();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  function addAttachment() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      const urls: string[] = await Promise.all(
        files.map(
          (f) =>
            new Promise<string>((res) => {
              const r = new FileReader();
              r.onload = () => res(r.result as string);
              r.readAsDataURL(f);
            }),
        ),
      );
      const current = note?.attachments ?? [];
      await saveNote({
        id: note?.id,
        title: title.trim(),
        content,
        projectId,
        data: data || undefined,
        inAgenda,
        tags: extractTags(content),
        attachments: [...current, ...urls],
        cantiereId: note?.cantiereId,
        workDayDate: note?.workDayDate,
      });
      onSaved();
    };
    input.click();
  }

  function applyLinePrefix(prefix: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { newValue, newCursorPos } = wrapLine(el, prefix);
    setContent(newValue);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newCursorPos, newCursorPos);
    });
  }

  const isEmpty = !title.trim() && !content.trim();

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={note ? 'Modifica nota' : 'Nuova nota'}
      size="full"
      footer={
        <div className="space-y-2">
          <Button onClick={salva} block size="lg" disabled={saving || isEmpty}>
            {saving ? 'Salvataggio…' : 'Salva nota'}
          </Button>
          {note && (
            <Button
              onClick={elimina}
              block
              variant="danger"
              size="sm"
              disabled={deleting}
            >
              {deleting ? 'Eliminazione…' : confirmDelete ? 'Tocca ancora per confermare' : 'Elimina nota'}
            </Button>
          )}
        </div>
      }
    >
      {/* Title */}
      <Field label="Titolo">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titolo della nota…"
          autoFocus={!note}
        />
      </Field>

      {/* Markdown toolbar */}
      <div className="flex items-center gap-1 mt-3 mb-1">
        <ToolbarBtn icon={<Heading1 size={16} />} label="H1" onClick={() => applyLinePrefix('# ')} />
        <ToolbarBtn icon={<Heading2 size={16} />} label="H2" onClick={() => applyLinePrefix('## ')} />
        <ToolbarBtn icon={<List size={16} />}      label="Lista" onClick={() => applyLinePrefix('- ')} />
        <ToolbarBtn icon={<CheckSquare size={16} />} label="Checklist" onClick={() => applyLinePrefix('[ ] ')} />
        <div className="flex-1" />
        <button
          onClick={addAttachment}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-ink-2 text-[12px] font-medium bg-section active:bg-line/60 transition-colors"
          aria-label="Allega foto"
        >
          <Image size={15} />
        </button>
      </div>

      {/* Content textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={`Scrivi qui…\n\n# Titolo sezione\n- Punto elenco\n[ ] Cosa da fare\n#tag`}
        className="w-full min-h-[220px] bg-section rounded-xl p-3 text-[14px] text-ink font-mono leading-relaxed resize-none border border-line/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
        spellCheck
      />

      {/* Attachments preview */}
      {(note?.attachments.length ?? 0) > 0 && (
        <div className="mt-3">
          <p className="text-[12px] text-ink-3 font-medium mb-1.5">Allegati</p>
          <div className="flex gap-2 flex-wrap">
            {note!.attachments.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="h-16 w-16 rounded-xl object-cover border border-line/40"
              />
            ))}
          </div>
        </div>
      )}

      {/* Meta: project, date, inAgenda */}
      <div className="mt-4 space-y-3">
        <Field label="Progetto">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Data nota (opzionale)">
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </Field>

        {/* In Agenda toggle */}
        <button
          onClick={() => setInAgenda((v) => !v)}
          className="w-full flex items-center justify-between bg-section rounded-xl px-4 py-3 border border-line/60 active:bg-line/40 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            {inAgenda ? (
              <BookmarkCheck size={18} className="text-primary" />
            ) : (
              <Bookmark size={18} className="text-ink-3" />
            )}
            <span className="text-[14px] font-medium text-ink">In Agenda</span>
          </div>
          <span className="text-[13px] text-ink-3">{inAgenda ? 'Attivo' : 'Non attivo'}</span>
        </button>
      </div>
    </Sheet>
  );
}

function ToolbarBtn({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-ink-2 text-[12px] font-medium bg-section active:bg-line/60 transition-colors"
    >
      {icon}
    </button>
  );
}
