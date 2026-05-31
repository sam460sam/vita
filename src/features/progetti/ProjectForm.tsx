import { useEffect, useState } from 'react';
import { Sheet, Button, Field, Input, Textarea, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import { createProject, updateProject, deleteProject } from '@/data/repo';
import type { Project } from '@/data/types';
import { useT } from '@/i18n';

const COLORS = ['#4F46E5', '#FF6B57', '#10B981', '#F59E0B', '#7C3AED', '#0EA5E9', '#EC4899', '#0A0A0C'];

export function ProjectForm({
  open,
  onClose,
  project,
  onDeleted,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onDeleted?: () => void;
}) {
  const editing = !!project;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (open) {
      setName(project?.name ?? '');
      setDescription(project?.description ?? '');
      setColor(project?.color ?? COLORS[0]);
    }
  }, [open, project]);

  async function save() {
    if (!name.trim()) return;
    if (editing && project) {
      await updateProject(project.id, { name: name.trim(), description: description.trim() || undefined, color });
      toast.show(t('projectForm.updated'));
    } else {
      await createProject({ name: name.trim(), description: description.trim() || undefined, color });
      toast.show(t('projectForm.created'));
    }
    onClose();
  }

  async function remove() {
    if (project) {
      await deleteProject(project.id);
      toast.show(t('projectForm.deleted'));
      onClose();
      onDeleted?.();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('projectForm.edit') : t('projectForm.new')}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!name.trim()}>
            {editing ? t('common.save') : t('projectForm.create')}
          </Button>
        </div>
      }
    >
      <Field label={t('projectForm.name')}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('projectForm.namePh')} />
      </Field>
      <Field label={t('projectForm.color')}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Colore ${c}`}
              className={cn('h-8 w-8 rounded-full transition-transform', color === c && 'ring-2 ring-offset-2 ring-ink scale-110')}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
      <Field label={t('projectForm.desc')}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('projectForm.descPh')} />
      </Field>
    </Sheet>
  );
}
