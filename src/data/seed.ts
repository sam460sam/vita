// ============================================================================
// Demo data seed — populates every module with realistic sample data so the
// app can be explored immediately. Triggered from Impostazioni.
// ============================================================================
import { subDays, format } from 'date-fns';
import {
  clearAllData,
  createProject,
  createTask,
  createHabit,
  setHabitLog,
  createWorkout,
  createJournalEntry,
  createGoal,
  createTransaction,
  setBudget,
  updateSettings,
} from './repo';
import { SPORTS, estimateKcal } from '@/features/attivita/sports';
import type { Mood } from './types';

const iso = (daysAgo: number) => format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
const ms = (daysAgo: number, hour = 9) => {
  const d = subDays(new Date(), daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};
const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

/** Replace all data with a curated demo dataset. */
export async function seedDemoData(name = 'Samuele') {
  await clearAllData();
  await updateSettings({ name, goals: { moveKcal: 600, exerciseMin: 30, standHours: 12 } });

  // -- Projects -------------------------------------------------------------
  const web = await createProject({ name: 'Lancio sito web', color: '#4F46E5', description: 'Restyling e go-live del nuovo sito.' });
  const casa = await createProject({ name: 'Casa nuova', color: '#FF6B57', description: 'Trasloco e arredamento.' });
  const studio = await createProject({ name: 'Studio & crescita', color: '#10B981' });

  // -- Tasks ----------------------------------------------------------------
  await createTask({ title: 'Scrivere i testi della home', projectId: web.id, status: 'done', priority: 'medium' });
  await createTask({ title: 'Implementare la pagina prezzi', projectId: web.id, status: 'doing', priority: 'high', dueDate: iso(-1) });
  await createTask({
    title: 'Test cross-browser',
    projectId: web.id,
    status: 'todo',
    priority: 'medium',
    dueDate: iso(-3),
    subtasks: [
      { id: 's1', title: 'Chrome', done: true },
      { id: 's2', title: 'Safari', done: false },
      { id: 's3', title: 'Firefox', done: false },
    ],
  });
  await createTask({ title: 'Pubblicare in produzione', projectId: web.id, status: 'todo', priority: 'high', dueDate: iso(-5) });

  await createTask({ title: 'Chiamare il traslocatore', projectId: casa.id, status: 'todo', priority: 'high', dueDate: iso(0) });
  await createTask({ title: 'Comprare lampade soggiorno', projectId: casa.id, status: 'todo', priority: 'low', dueDate: iso(-4) });
  await createTask({ title: 'Disdire vecchie utenze', projectId: casa.id, status: 'done', priority: 'medium' });

  await createTask({ title: 'Finire capitolo 4 del corso', projectId: studio.id, status: 'doing', priority: 'medium', dueDate: iso(0) });
  await createTask({ title: 'Esercizi di TypeScript', projectId: studio.id, status: 'todo', priority: 'low', dueDate: iso(-7) });

  // Inbox (no project)
  await createTask({ title: 'Prenotare dentista', status: 'todo', priority: 'medium', dueDate: iso(-2) });
  await createTask({ title: 'Rispondere alle email arretrate', status: 'todo', priority: 'low' });

  // -- Habits + logs --------------------------------------------------------
  const habits = [
    await createHabit({ name: "Bere 2L d'acqua", color: '#0EA5E9', frequency: { type: 'daily' } }),
    await createHabit({ name: 'Leggere 20 min', color: '#F59E0B', frequency: { type: 'daily' } }),
    await createHabit({ name: 'Meditazione', color: '#7C3AED', frequency: { type: 'daily' } }),
    await createHabit({ name: 'Palestra', color: '#FF6B57', frequency: { type: 'times_per_week', timesPerWeek: 3 } }),
  ];
  // Generate ~45 days of logs with realistic completion rates per habit.
  const completion = [0.92, 0.78, 0.65, 0.5];
  for (let h = 0; h < habits.length; h++) {
    for (let d = 0; d < 45; d++) {
      const boost = h === 0 && d < 6 ? 1 : 0; // keep a strong recent streak on habit #1
      if (Math.random() < completion[h] + boost) {
        await setHabitLog(habits[h].id, iso(d), true);
      }
    }
  }

  // -- Workouts -------------------------------------------------------------
  const plan: { daysAgo: number; sport: string; min: number }[] = [
    { daysAgo: 0, sport: 'run_outdoor', min: 38 },
    { daysAgo: 1, sport: 'strength', min: 50 },
    { daysAgo: 2, sport: 'walk_outdoor', min: 45 },
    { daysAgo: 4, sport: 'bike_outdoor', min: 65 },
    { daysAgo: 5, sport: 'hiit', min: 25 },
    { daysAgo: 7, sport: 'swim_pool', min: 40 },
    { daysAgo: 8, sport: 'strength', min: 55 },
    { daysAgo: 10, sport: 'run_outdoor', min: 42 },
    { daysAgo: 12, sport: 'yoga', min: 30 },
    { daysAgo: 14, sport: 'bike_outdoor', min: 70 },
  ];
  for (const p of plan) {
    const sport = SPORTS.find((s) => s.id === p.sport)!;
    const durationSec = p.min * 60;
    const activeKcal = estimateKcal(sport.met, durationSec);
    await createWorkout({
      sportId: p.sport,
      startedAt: ms(p.daysAgo, rand(7, 19)),
      durationSec,
      activeKcal,
      totalKcal: Math.round(activeKcal * 1.25),
      distanceM: sport.hasDistance ? rand(3, 12) * 1000 : undefined,
      avgHr: rand(120, 165),
      maxHr: rand(165, 185),
      source: 'manual',
    });
  }

  // -- Journal --------------------------------------------------------------
  const journal: { daysAgo: number; mood: Mood; text: string; tags: string[] }[] = [
    { daysAgo: 0, mood: 4, text: 'Giornata produttiva, bella corsa al mattino.', tags: ['sport', 'lavoro'] },
    { daysAgo: 1, mood: 5, text: 'Ottima sessione in palestra e cena con amici.', tags: ['amici'] },
    { daysAgo: 2, mood: 3, text: 'Giornata nella media, un po’ stanco.', tags: [] },
    { daysAgo: 3, mood: 4, text: 'Avanzato bene col progetto del sito.', tags: ['lavoro'] },
    { daysAgo: 5, mood: 2, text: 'Giornata storta, troppe cose insieme.', tags: ['stress'] },
    { daysAgo: 7, mood: 4, text: 'Nuotata rilassante, mi sono ricaricato.', tags: ['sport', 'relax'] },
  ];
  for (const j of journal) {
    await createJournalEntry({ date: iso(j.daysAgo), mood: j.mood, text: j.text, tags: j.tags });
  }

  // -- Goals ----------------------------------------------------------------
  await createGoal({ title: 'Lanciare il nuovo sito', description: 'Online entro fine mese.', targetDate: iso(-20), link: { type: 'project', refId: web.id } });
  await createGoal({ title: 'Costanza nell’idratazione', link: { type: 'habit', refId: habits[0].id } });
  await createGoal({ title: 'Leggere 12 libri quest’anno', manualProgress: 0.42, link: { type: 'none' }, targetDate: iso(-200) });

  // -- Finances -------------------------------------------------------------
  await setBudget(1500);
  await createTransaction({ type: 'income', amount: 2400, category: 'Stipendio', date: iso(25) });
  await createTransaction({ type: 'expense', amount: 780, category: 'Casa', date: iso(22), note: 'Affitto' });
  await createTransaction({ type: 'expense', amount: 210, category: 'Spesa', date: iso(18) });
  await createTransaction({ type: 'expense', amount: 95, category: 'Bollette', date: iso(15), note: 'Luce e gas' });
  await createTransaction({ type: 'expense', amount: 60, category: 'Trasporti', date: iso(12) });
  await createTransaction({ type: 'expense', amount: 45, category: 'Ristoranti', date: iso(8) });
  await createTransaction({ type: 'expense', amount: 120, category: 'Shopping', date: iso(5) });
  await createTransaction({ type: 'income', amount: 150, category: 'Extra', date: iso(4), note: 'Lavoretto' });
  await createTransaction({ type: 'expense', amount: 35, category: 'Svago', date: iso(2), note: 'Cinema' });
  await createTransaction({ type: 'expense', amount: 72, category: 'Spesa', date: iso(1) });
}
