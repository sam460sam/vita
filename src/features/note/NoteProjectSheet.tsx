import { useState, useEffect } from 'react';
import { Sheet, Button, Field, Input } from '@/ui';
import { saveNoteProject, deleteNoteProject, INBOX_ID } from '@/data/note-repo';
import type { NoteProject } from '@/data/types';

const PRESET_COLORS = [
  '#ea580c', '#16a34a', '#2563eb', '#7c3aed', '#dc2626', '#ca8a04',
  '#0891b2', '#db2777', '#64748b', '#374151',
];

interface Props {
  open: boolean;
  project?: NoteProject | null;
  onClose: () => void;
  onSaved: () => void;
}

export function NoteProjectSheet({ open, project, onClose, onSaved }: Props) {
  const [nome, setNome] = useState('');
  const [colore, setColore] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isInbox = project?.id === INBOX_ID;

  useEffect(() => {
    if (!open) return;
    if (project) {
      setNome(project.nome);
      setColore(project.colore);
    } else {
      setNome('');
      setColore(PRESET_COLORS[0]);
    }
  }, [open, project]);

  async function salva() {
    if (!nome.trim()) return;
    setSaving(true);
    try {
      await saveNoteProject({ id: project?.id, nome: nome.trim(), colore });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function elimina() {
    if (!project || isInbox) return;
    setDeleting(true);
    try {
      await deleteNoteProject(project.id);
      onSaved();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={project ? 'Modifica progetto' : 'Nuovo progetto'}
      footer={
        <div className="space-y-2">
          <Button onClick={salva} block size="lg" disabled={saving || !nome.trim()}>
            {saving ? 'Salvataggio…' : project ? 'Salva modifiche' : 'Crea progetto'}
          </Button>
          {project && !isInbox && (
            <Button onClick={elimina} block variant="danger" size="sm" disabled={deleting}>
              {deleting ? 'Eliminazione…' : 'Elimina progetto'}
            </Button>
          )}
        </div>
      }
    >
      <Field label="Nome progetto">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Es. Rifacimento villa, Lavori 2025…"
          autoFocus
        />
      </Field>

      <div className="mt-4">
        <label className="block text-[13px] font-semibold text-ink-2 mb-2">Colore</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColore(c)}
              className="h-8 w-8 rounded-full border-4 transition-transform active:scale-90"
              style={{
                backgroundColor: c,
                borderColor: colore === c ? c : 'transparent',
                outline: colore === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
    </Sheet>
  );
}
