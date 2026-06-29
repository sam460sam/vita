import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Check, Plus, X } from 'lucide-react';
import { readDayPlan, setDayIntention, addDayItem, toggleDayItem, removeDayItem } from '@/data/repo';
import { todayISO } from '@/lib/format';
import { platform } from '@/platform/platform';
import { useT } from '@/i18n';

/** Home "Plan your day" — a light mix of a daily intention + quick to-dos. */
export function DayPlanCard() {
  const t = useT();
  const today = todayISO();
  const plan = useLiveQuery(() => readDayPlan(today), [today], undefined);
  const [intention, setIntention] = useState('');
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (plan) setIntention(plan.intention);
  }, [plan?.intention]);

  if (!plan) return null;
  const items = plan.items;

  function commitIntention() {
    if (plan && intention !== plan.intention) void setDayIntention(today, intention);
  }
  function add() {
    const v = draft.trim();
    if (!v) return;
    void addDayItem(today, v);
    setDraft('');
  }

  return (
    <div className="rounded-card bg-card shadow-card px-4 py-4 mt-4">
      <h2 className="display-serif text-[20px] text-ink mb-2.5">{t('plan.title')}</h2>

      <input
        value={intention}
        onChange={(e) => setIntention(e.target.value)}
        onBlur={commitIntention}
        placeholder={t('plan.intentionPlaceholder')}
        className="w-full bg-section rounded-2xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none"
      />

      {items.length > 0 && (
        <div className="mt-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 px-1 py-1.5">
              <button
                onClick={() => { platform.haptic(); void toggleDayItem(today, it.id); }}
                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                style={it.done ? { background: '#4F9D55', borderColor: '#4F9D55' } : { borderColor: 'var(--c-line)' }}
                aria-label={it.text}
              >
                {it.done && <Check size={14} className="text-white" strokeWidth={3} />}
              </button>
              <span className={`flex-1 min-w-0 text-[15px] ${it.done ? 'line-through text-ink-3' : 'text-ink'}`}>{it.text}</span>
              <button onClick={() => void removeDayItem(today, it.id)} aria-label={t('common.close')} className="h-7 w-7 rounded-full flex items-center justify-center text-ink-3 opacity-50 active:opacity-100 flex-shrink-0">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-2.5">
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
  );
}
