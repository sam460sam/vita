import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useT } from '@/i18n';
import { hasOnboarded } from './Onboarding';
import { isTourDone, markTourDone, TOUR_START_EVENT } from './tour';
import { CoachMarks, type CoachStep } from './CoachMarks';

// Home-only steps. No bottom-nav / other-tab steps — the tour never leaves Home.
const STEPS: CoachStep[] = [
  { sel: '[data-tour="focus"]', t: 'tour.focus.t', d: 'tour.focus.d' },
  { sel: '[data-tour="addtask"]', t: 'tour.addtask.t', d: 'tour.addtask.d' },
  { sel: '[data-tour="habit"]', t: 'tour.habit.t', d: 'tour.habit.d' },
  { sel: '[data-tour="workout"]', t: 'tour.workout.t', d: 'tour.workout.d' },
  { sel: '[data-tour="chips"]', t: 'tour.chips.t', d: 'tour.chips.d' },
  { sel: '[data-tour="momentum"]', t: 'tour.momentum.t', d: 'tour.momentum.d' },
  { sel: '[data-tour="saved"]', t: 'tour.saved.t', d: 'tour.saved.d' },
];

/** First-run interactive tutorial — entirely on the Home page. */
export function HomeTour() {
  const t = useT();
  const loc = useLocation();
  const onHome = loc.pathname === '/oggi' || loc.pathname === '/';
  const [phase, setPhase] = useState<'off' | 'welcome' | 'run'>('off');

  useEffect(() => {
    if (onHome && phase === 'off' && hasOnboarded() && !isTourDone('home')) {
      const id = setTimeout(() => setPhase('welcome'), 450);
      return () => clearTimeout(id);
    }
  }, [onHome, phase]);
  useEffect(() => {
    const onStart = () => { if (onHome) setPhase('welcome'); };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [onHome]);

  // Lock scroll behind the welcome card (CoachMarks handles the run phase).
  useEffect(() => {
    if (phase !== 'welcome') return;
    const root = document.getElementById('root');
    const prev = root?.style.overflow;
    if (root) root.style.overflow = 'hidden';
    return () => { if (root) root.style.overflow = prev ?? ''; };
  }, [phase]);

  function finish() { markTourDone('home'); setPhase('off'); }

  if (phase === 'off') return null;

  if (phase === 'welcome') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-7" style={{ background: 'rgba(0,0,0,0.78)' }}>
        <div className="w-full max-w-sm rounded-card bg-card p-6 text-center animate-rise" style={{ boxShadow: 'inset 0 0 0 1px var(--c-hairline), 0 24px 60px rgba(0,0,0,0.6)' }}>
          <div className="display-serif text-[24px] text-ink leading-tight">{t('tour.welcome.t')}</div>
          <p className="text-[14.5px] text-ink-2 mt-2.5 leading-relaxed">{t('tour.welcome.d')}</p>
          <button onClick={() => setPhase('run')} className="w-full mt-6 h-12 rounded-full font-bold text-[15.5px]" style={{ background: 'var(--c-primary)', color: 'var(--c-on-primary)' }}>
            {t('tour.start')}
          </button>
          <button onClick={finish} className="mt-2.5 text-[14px] font-semibold text-ink-3 py-2">{t('tour.skip')}</button>
        </div>
      </div>
    );
  }

  return <CoachMarks steps={STEPS} doneT="tour.done.t" doneD="tour.done.d" onClose={finish} />;
}
