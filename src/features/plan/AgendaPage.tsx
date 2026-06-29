import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Plus, X } from 'lucide-react';
import { readDayPlan, addDayItem, toggleDayItem, removeDayItem, setDayNotes, GENERAL_PLAN_KEY } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { platform } from '@/platform/platform';
import { DailyInspiration } from '@/features/luxe/DailyInspiration';
import { useT } from '@/i18n';

/** General (not day-bound) to-do list + free-form notes. */
export function AgendaPage() {
  const t = useT();
  const key = GENERAL_PLAN_KEY;
  const plan = useLiveQuery(() => readDayPlan(key), [], undefined);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (plan) setNotes(plan.notes ?? '');
  }, [plan?.notes]);

  const items = plan?.items ?? [];

  function add() {
    const v = draft.trim();
    if (!v) return;
    void addDayItem(key, v);
    setDraft('');
  }
  function commitNotes() {
    if (plan && notes !== (plan.notes ?? '')) void setDayNotes(key, notes);
  }

  return (
    <>
      <PageHeader title={t('agenda.title')} back />
      <Screen>
        {/* To-do list */}
        <h2 className="display-serif text-[20px] text-ink mb-2.5">{t('agenda.todo')}</h2>
        <div className="rounded-card bg-card shadow-card px-4 py-4">
          {items.length === 0 ? (
            <p className="text-[14px] text-ink-3 text-center py-2">{t('agenda.todoEmpty')}</p>
          ) : (
            <div className="-my-1">
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-1 py-1.5">
                  <button
                    onClick={() => { platform.haptic(); void toggleDayItem(key, it.id); }}
                    className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                    style={it.done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
                    aria-label={it.text}
                  >
                    {it.done && <Check size={14} className="text-white" strokeWidth={3} />}
                  </button>
                  <span className={`flex-1 min-w-0 text-[15px] ${it.done ? 'line-through text-ink-3' : 'text-ink'}`}>{it.text}</span>
                  <button onClick={() => void removeDayItem(key, it.id)} aria-label={t('common.close')} className="h-7 w-7 rounded-full flex items-center justify-center text-ink-3 opacity-50 active:opacity-100 flex-shrink-0">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder={t('plan.addPlaceholder')}
              className="flex-1 min-w-0 bg-section rounded-2xl px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-ink-3 outline-none"
            />
            <button
              onClick={add}
              aria-label={t('plan.add')}
              className="h-10 w-10 rounded-full flex items-center justify-center text-on-primary flex-shrink-0 active:scale-90 transition-transform"
              style={{ background: 'var(--c-primary)' }}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* General notes */}
        <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('agenda.notes')}</h2>
        <div className="rounded-card bg-card shadow-card px-4 py-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={commitNotes}
            placeholder={t('agenda.notesPlaceholder')}
            rows={8}
            className="w-full bg-section rounded-2xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Editorial close */}
        <DailyInspiration className="mt-7" />
      </Screen>
    </>
  );
}
