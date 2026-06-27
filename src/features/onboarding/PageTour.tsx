import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { hasOnboarded } from './Onboarding';
import { isTourDone, markTourDone, type TourId } from './tour';
import { CoachMarks, type CoachStep } from './CoachMarks';
import type { TKey } from '@/i18n';

/**
 * Page-scoped contextual tutorial. Auto-starts on the user's first visit to
 * its route, stays on that page for its whole run (the overlay blocks taps so
 * it can never navigate away), and marks its flag on Finish or Skip.
 *
 * If the user leaves the page before completing, the flag is left unset so the
 * tour re-triggers next visit.
 */
function PageTour({ id, match, steps, doneT, doneD }: {
  id: TourId;
  match: string;
  steps: CoachStep[];
  doneT: TKey;
  doneD: TKey;
}) {
  const loc = useLocation();
  const onPage = loc.pathname === match;
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (onPage && !active && hasOnboarded() && !isTourDone(id)) {
      const tm = setTimeout(() => setActive(true), 500); // let async page content mount
      return () => clearTimeout(tm);
    }
    if (!onPage && active) setActive(false);
  }, [onPage, active, id]);

  function close() { markTourDone(id); setActive(false); }

  if (!active) return null;
  return <CoachMarks steps={steps} doneT={doneT} doneD={doneD} onClose={close} />;
}

const WORKOUT_STEPS: CoachStep[] = [
  { sel: '[data-tour="wo-start"]', t: 'tour.workout.start.t', d: 'tour.workout.start.d' },
  { sel: '[data-tour="wo-create"]', t: 'tour.workout.create.t', d: 'tour.workout.create.d' },
  { sel: '[data-tour="wo-templates"]', t: 'tour.workout.templates.t', d: 'tour.workout.templates.d' },
  { sel: '[data-tour="wo-plans"]', t: 'tour.workout.plans.t', d: 'tour.workout.plans.d' },
  { sel: '[data-tour="wo-utils"]', t: 'tour.workout.utils.t', d: 'tour.workout.utils.d' },
];

const HABITS_STEPS: CoachStep[] = [
  { sel: '[data-tour="hb-stats"]', t: 'tour.habits.stats.t', d: 'tour.habits.stats.d' },
  { sel: '[data-tour="hb-tools"]', t: 'tour.habits.tools.t', d: 'tour.habits.tools.d' },
  { sel: '[data-tour="hb-new"]', t: 'tour.habits.new.t', d: 'tour.habits.new.d' },
  { sel: '[data-tour="hb-today"]', t: 'tour.habits.today.t', d: 'tour.habits.today.d' },
  { sel: '[data-tour="hb-suggested"]', t: 'tour.habits.suggested.t', d: 'tour.habits.suggested.d' },
];

export function WorkoutTour() {
  return <PageTour id="workout" match="/allenamento" steps={WORKOUT_STEPS} doneT="tour.workout.done.t" doneD="tour.workout.done.d" />;
}
export function HabitsTour() {
  return <PageTour id="habits" match="/abitudini" steps={HABITS_STEPS} doneT="tour.habits.done.t" doneD="tour.habits.done.d" />;
}
