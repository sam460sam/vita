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
import { useT } from '@/i18n';
import type { TKey } from '@/i18n';
import type { Goal, GoalLinkType } from '@/data/types';

export function GoalsPage() {
  const t = useT();
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
        title={t('goals.title')}
        back="/altro"
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            {t('goals.new')}
          </Button>
        }
      />
      <Screen>
        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Target size={22} />}
              title={t('goals.empty.title')}
              description={t('goals.empty.desc')}
              action={<Button onClick={() => setFormOpen(true)}>{t('goals.empty.cta')}</Button>}
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
                      {g.link.type !== 'none' ? linkLabel(t, g.link.type) : t('goals.manual')}
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

function linkLabel(t: (key: TKey, vars?: Record<string, string | number>) => string, type: GoalLinkType): string {
  return type === 'project' ? t('goals.linkedProject') : type === 'habit' ? t('goals.linkedHabit') : t('goals.manual');
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
  const t = useT();

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
      toast.show(t('goalForm.updated'));
    } else {
      await createGoal(data);
      toast.show(t('goalForm.created'));
    }
    onClose();
  }

  async function remove() {
    if (goal) {
      await deleteGoal(goal.id);
      toast.show(t('goalForm.deleted'));
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('goalForm.edit') : t('goalForm.new')}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!title.trim()}>
            {editing ? t('common.save') : t('goalForm.create')}
          </Button>
        </div>
      }
    >
      <Field label={t('goalForm.title')}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('goalForm.titlePh')} />
      </Field>
      <Field label={t('goalForm.desc')}>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('goalForm.descPh')} />
      </Field>
      <Field label={t('goalForm.targetDate')}>
        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
      </Field>
      <Field label={t('goalForm.link')}>
        <Segmented
          value={linkType}
          onChange={(v) => { setLinkType(v); setRefId(''); }}
          options={[
            { value: 'none', label: t('goalForm.link.manual') },
            { value: 'project', label: t('goalForm.link.project') },
            { value: 'habit', label: t('goalForm.link.habit') },
          ]}
        />
      </Field>

      {linkType === 'project' && (
        <Field label={t('goalForm.link.project')}>
          <Select value={refId} onChange={(e) => setRefId(e.target.value)}>
            <option value="">{t('goalForm.select')}</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </Field>
      )}
      {linkType === 'habit' && (
        <Field label={t('goalForm.link.habit')}>
          <Select value={refId} onChange={(e) => setRefId(e.target.value)}>
            <option value="">{t('goalForm.select')}</option>
            {(habits ?? []).map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </Select>
        </Field>
      )}
      {linkType === 'none' && (
        <Field label={t('goalForm.manualProgress', { pct: Math.round(manual * 100) })}>
          <input type="range" min={0} max={100} value={Math.round(manual * 100)} onChange={(e) => setManual(Number(e.target.value) / 100)} className="w-full accent-[var(--c-project)]" />
        </Field>
      )}

      <label className="flex items-center gap-2 mt-1 text-[15px] text-ink">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="h-5 w-5 accent-[var(--c-habit)]" />
        {t('goalForm.markDone')}
      </label>
    </Sheet>
  );
}
