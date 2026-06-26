import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, Link } from 'react-router-dom';
import { Dumbbell, ChevronRight, Watch } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { db } from '@/data/db';
import { createWorkoutSession } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { activeDfnLocale } from '@/lib/format';
import { useT } from '@/i18n';

/** Strength-training hub: start a session, see history, jump to cardio/Health. */
export function WorkoutPage() {
  const t = useT();
  const nav = useNavigate();
  const sessions = useLiveQuery(() => db.workoutSessions.orderBy('createdAt').reverse().toArray(), [], []);

  async function start() {
    const s = await createWorkoutSession(t('workout.session.default'));
    nav(`/allenamento/s/${s.id}`);
  }

  return (
    <>
      <PageHeader title={t('workout.title')} />
      <Screen>
        <button onClick={() => void start()} className="w-full h-[60px] rounded-2xl text-white font-bold text-[17px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-card" style={{ background: 'linear-gradient(180deg, #6FBE6F, #2F7D43)' }}>
          <Dumbbell size={22} /> {t('workout.start')}
        </button>

        <Link to="/attivita" className="rounded-card bg-card shadow-card px-4 py-3.5 mt-3 flex items-center justify-between active:bg-section transition-colors">
          <span className="flex items-center gap-2.5 text-[15px] font-semibold text-ink"><Watch size={18} className="text-activity" /> {t('workout.activityLink')}</span>
          <ChevronRight size={18} className="text-ink-3" />
        </Link>

        <h2 className="display-serif text-[20px] text-ink mt-6 mb-2.5">{t('workout.history')}</h2>
        {(sessions ?? []).length === 0 ? (
          <p className="text-center text-[13px] text-ink-3 py-6">{t('workout.empty')}</p>
        ) : (
          (sessions ?? []).map((s) => {
            const sets = s.entries.reduce((n, e) => n + e.sets.length, 0);
            return (
              <Link key={s.id} to={`/allenamento/s/${s.id}`} className="rounded-card bg-card shadow-card p-4 mb-2.5 flex items-center justify-between active:bg-section transition-colors">
                <div className="min-w-0">
                  <div className="text-[15.5px] font-bold text-ink truncate flex items-center gap-2">
                    <span className="truncate">{s.title}</span>
                    {!s.finishedAt && <span className="text-[10px] font-bold text-on-primary px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--c-primary)' }}>{t('workout.inProgress')}</span>}
                  </div>
                  <div className="text-[12.5px] text-ink-3 mt-0.5 capitalize">{format(parseISO(s.date), 'EEE d MMM', { locale: activeDfnLocale() })} · {t('workout.summary', { ex: s.entries.length, sets })}</div>
                </div>
                <ChevronRight size={18} className="text-ink-3 flex-shrink-0" />
              </Link>
            );
          })
        )}
      </Screen>
    </>
  );
}
