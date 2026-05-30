import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target, Plus, Check } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { db } from '@/data/db';
import { createGoal, updateGoal, deleteGoal } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, ProgressRing, EmptyState, Button, Sheet, Field, Input, Textarea, Select, Segmented, useToast } from '@/ui';
import { projectProgress } from '@/features/progetti/logic';
import { completionRate } from '@/features/abitudini/logic';
import type { Goal, GoalLinkType } from '@/data/types';

export function GoalsPage() {
  const goals = useLiveQuery(() => db.goals.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  function progressOf(g: Goal): number {
    if (g.done) return 1;
    if (g.link.type === 'project' && g.link.refId) return projectProgress(tasks ?? [], g.link.refId);
    if (g.link.type === 'habit' && g.link.refId) {
      const h = (habits ?? []).find((x) => x.id === g.link.refId);
      return h ? completionRate(h, logs ?? [], 30) : 0;
    }
    return g.manualProgress;
  }

  const sorted = [...(goals ?? [])].sort((a, b) => Number(a.done) - Number(b.done) || (a.targetDate ?? '').localeCompare(b.targetDate ?? ''));

  return (
    <>
      <PageHeader
        title="Obiettivi"
        back="/altro"
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nuovo
          </Button>
        }
      />
      <Screen>
        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Target size={22} />}
              title="Nessun obiettivo"
              description="Definisci un obiettivo e collegalo a un progetto o a un'abitudine per tracciarne il progresso."
              action={<Button onClick={() => setFormOpen(true)}>Nuovo obiettivo</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {sorted.map((g) => {
              const prog = progressOf(g);
              return (
                <Card key={g.id} className="flex items-center gap-4" onClick={() => { setEditing(g); setFormOpen(true); }}>
                  <ProgressRing progress={prog} size={52} stroke={6} color={g.done ? 'var(--c-habit)' : 'var(--c-project)'}>
                    {g.done ? <Check size={20} className="text-habit" /> : <span className="text-[11px] font-semibold tnum text-ink">{Math.round(prog * 100)}%</span>}
                  </ProgressRing>
                  <div className="min-w-0 flex-1 cursor-pointer">
                    <div className="text-[15px] font-semibold text-ink truncate">{g.title}</div>
                    <div className="text-[13px] text-ink-2">
                      {g.link.type !== 'none' ? linkLabel(g.link.type) : 'Progresso manuale'}
                      {g.targetDate && ` · ${format(parseISO(g.targetDate), 'd MMM yyyy', { locale: it })}`}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Screen>

      <GoalForm open={formOpen} onClose={() => setFormOpen(false)} goal={editing} />
    </>
  );
}

function linkLabel(t: GoalLinkType): string {
  return t === 'project' ? 'Collegato a un progetto' : t === 'habit' ? "Collegato a un'abitudine" : 'Manuale';
}

function GoalForm({ open, onClose, goal }: { open: boolean; onClose: () => void; goal?: Goal | null }) {
  const editing = !!goal;
  const projects = useLiveQuery(() => db.projects.filter((p) => !p.archived).toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.filter((h) => !h.archived).toArray(), [], []);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkType, setLinkType] = useState<GoalLinkType>('none');
  const [refId, setRefId] = useState('');
  const [manual, setManual] = useState(0);
  const [done, setDone] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      setTitle(goal?.title ?? '');
      setDescription(goal?.description ?? '');
      setTargetDate(goal?.targetDate ?? '');
      setLinkType(goal?.link.type ?? 'none');
      setRefId(goal?.link.refId ?? '');
      setManual(goal?.manualProgress ?? 0);
      setDone(goal?.done ?? false);
    }
  }, [open, goal]);

  async function save() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      manualProgress: manual,
      link: { type: linkType, refId: linkType === 'none' ? undefined : refId || undefined },
      done,
    };
    if (editing && goal) {
      await updateGoal(goal.id, data);
      toast.show('Obiettivo aggiornato');
    } else {
      await createGoal(data);
      toast.show('Obiettivo creato');
    }
    onClose();
  }

  async function remove() {
    if (goal) {
      await deleteGoal(goal.id);
      toast.show('Obiettivo eliminato');
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? 'Modifica obiettivo' : 'Nuovo obiettivo'}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              Elimina
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!title.trim()}>
            {editing ? 'Salva' : 'Crea obiettivo'}
          </Button>
        </div>
      }
    >
      <Field label="Titolo">
        <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="es. Correre una 10k" />
      </Field>
      <Field label="Descrizione (opzionale)">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Perché è importante…" />
      </Field>
      <Field label="Data target (opzionale)">
        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </Field>
      <Field label="Collegamento progresso">
        <Segmented
          value={linkType}
          onChange={(v) => { setLinkType(v); setRefId(''); }}
          options={[
            { value: 'none', label: 'Manuale' },
            { value: 'project', label: 'Progetto' },
            { value: 'habit', label: 'Abitudine' },
          ]}
        />
      </Field>

      {linkType === 'project' && (
        <Field label="Progetto">
          <Select value={refId} onChange={(e) => setRefId(e.target.value)}>
            <option value="">Seleziona…</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>
      )}
      {linkType === 'habit' && (
        <Field label="Abitudine">
          <Select value={refId} onChange={(e) => setRefId(e.target.value)}>
            <option value="">Seleziona…</option>
            {(habits ?? []).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </Select>
        </Field>
      )}
      {linkType === 'none' && (
        <Field label={`Progresso manuale: ${Math.round(manual * 100)}%`}>
          <input type="range" min={0} max={100} value={Math.round(manual * 100)} onChange={(e) => setManual(Number(e.target.value) / 100)} className="w-full accent-[var(--c-project)]" />
        </Field>
      )}

      <label className="flex items-center gap-2 mt-1 text-[15px] text-ink">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-5 w-5 accent-[var(--c-habit)]" />
        Segna come completato
      </label>
    </Sheet>
  );
}
