import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, X } from 'lucide-react';
import { Sheet, Button, Field, Input, Textarea, Select, Segmented, Checkbox, useToast } from '@/ui';
import { db } from '@/data/db';
import { createTask, updateTask, deleteTask, newSubtask } from '@/data/repo';
import type { Priority, Subtask, Task } from '@/data/types';

export function TaskForm({
  open,
  onClose,
  task,
  defaultProjectId,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultProjectId?: string;
}) {
  const editing = !!task;
  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).toArray(), [], []);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSub, setNewSub] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setTitle(task?.title ?? '');
      setNotes(task?.notes ?? '');
      setProjectId(task?.projectId ?? defaultProjectId ?? '');
      setPriority(task?.priority ?? 'medium');
      setDueDate(task?.dueDate ?? '');
      setSubtasks(task?.subtasks ?? []);
      setNewSub('');
    }
  }, [open, task, defaultProjectId]);

  function addSub() {
    if (!newSub.trim()) return;
    setSubtasks((p) => [...p, newSubtask(newSub.trim())]);
    setNewSub('');
  }

  async function save() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      projectId: projectId || undefined,
      priority,
      dueDate: dueDate || undefined,
      subtasks,
    };
    if (editing && task) {
      await updateTask(task.id, data);
      toast.show('Task aggiornata');
    } else {
      await createTask(data);
      toast.show('Task creata');
    }
    onClose();
  }

  async function remove() {
    if (task) {
      await deleteTask(task.id);
      toast.show('Task eliminata');
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Modifica task' : 'Nuova task'}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              Elimina
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!title.trim()}>
            {editing ? 'Salva' : 'Crea task'}
          </Button>
        </div>
      }
    >
      <Field label="Titolo">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cosa c'è da fare?" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Progetto">
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Inbox</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Scadenza">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>

      <Field label="Priorità">
        <Segmented
          value={priority}
          onChange={setPriority}
          options={[
            { value: 'low', label: 'Bassa' },
            { value: 'medium', label: 'Media' },
            { value: 'high', label: 'Alta' },
          ]}
        />
      </Field>

      <Field label="Sottotask">
        <div className="space-y-1.5 mb-2">
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Checkbox
                checked={s.done}
                size={20}
                onChange={() => setSubtasks((p) => p.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)))}
              />
              <span className={s.done ? 'text-ink-3 line-through text-sm flex-1' : 'text-ink text-sm flex-1'}>{s.title}</span>
              <button onClick={() => setSubtasks((p) => p.filter((x) => x.id !== s.id))} className="text-ink-3 p-1" aria-label="Rimuovi">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSub())}
            placeholder="Aggiungi sottotask"
          />
          <Button variant="subtle" onClick={addSub} icon={<Plus size={18} />} aria-label="Aggiungi sottotask" />
        </div>
      </Field>

      <Field label="Note">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dettagli aggiuntivi…" />
      </Field>
    </Sheet>
  );
}
