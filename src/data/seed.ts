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
  setWaterMl,
  logWeight,
  updateSettings,
} from './repo';
import { SPORTS, estimateKcal } from '@/features/attivita/sports';
import { getActiveLang } from '@/lib/format';
import type { Mood } from './types';

// Localised demo copy so the sample data matches the UI language.
const COPY = {
  it: {
    projects: { web: ['Lancio sito web', 'Restyling e go-live del nuovo sito.'], casa: ['Casa nuova', 'Trasloco e arredamento.'], studio: ['Studio & crescita', ''] },
    tasksWeb: ['Scrivere i testi della home', 'Implementare la pagina prezzi', 'Test cross-browser', 'Pubblicare in produzione'],
    tasksCasa: ['Chiamare il traslocatore', 'Comprare lampade soggiorno', 'Disdire vecchie utenze'],
    tasksStudio: ['Finire capitolo 4 del corso', 'Esercizi di TypeScript'],
    tasksInbox: ['Prenotare dentista', 'Rispondere alle email arretrate'],
    habits: ["Bere 2L d'acqua", 'Leggere 20 min', 'Meditazione', 'Palestra'],
    journal: ['Giornata produttiva, bella corsa al mattino.', 'Ottima sessione in palestra e cena con amici.', 'Giornata nella media, un po’ stanco.', 'Avanzato bene col progetto del sito.', 'Giornata storta, troppe cose insieme.', 'Nuotata rilassante, mi sono ricaricato.'],
    journalTags: [['sport', 'lavoro'], ['amici'], [], ['lavoro'], ['stress'], ['sport', 'relax']],
    goalSite: ['Lanciare il nuovo sito', 'Online entro fine mese.'],
    goalHydration: 'Costanza nell’idratazione',
    goalBooks: 'Leggere 12 libri quest’anno',
    goalHouse: ['Comprare casa', 'Progetto a lungo termine.'],
    milestones: ['Risparmiare l’anticipo', 'Trovare zona e agenzia', 'Visitare 5 immobili', 'Richiedere il mutuo', 'Rogito'],
    noteRent: 'Affitto', noteUtilities: 'Luce e gas', noteSideGig: 'Lavoretto', noteCinema: 'Cinema',
  },
  en: {
    projects: { web: ['Website launch', 'Restyle and go-live of the new site.'], casa: ['New home', 'Moving and furnishing.'], studio: ['Study & growth', ''] },
    tasksWeb: ['Write the homepage copy', 'Build the pricing page', 'Cross-browser testing', 'Ship to production'],
    tasksCasa: ['Call the movers', 'Buy living-room lamps', 'Cancel old utilities'],
    tasksStudio: ['Finish chapter 4 of the course', 'TypeScript exercises'],
    tasksInbox: ['Book the dentist', 'Reply to backlog emails'],
    habits: ['Drink 2L of water', 'Read 20 min', 'Meditation', 'Gym'],
    journal: ['Productive day, great morning run.', 'Great gym session and dinner with friends.', 'Average day, a bit tired.', 'Made good progress on the website.', 'Rough day, too much at once.', 'Relaxing swim, recharged.'],
    journalTags: [['sport', 'work'], ['friends'], [], ['work'], ['stress'], ['relax']],
    goalSite: ['Launch the new site', 'Live by end of month.'],
    goalHydration: 'Hydration consistency',
    goalBooks: 'Read 12 books this year',
    goalHouse: ['Buy a house', 'Long-term project.'],
    milestones: ['Save the down payment', 'Find area and agency', 'Visit 5 properties', 'Apply for the mortgage', 'Closing'],
    noteRent: 'Rent', noteUtilities: 'Electricity & gas', noteSideGig: 'Side gig', noteCinema: 'Cinema',
  },
} as const;

const iso = (daysAgo: number) => format(subDays(new Date(), daysAgo), 'yyyy-MM-dd');
const ms = (daysAgo: number, hour = 9) => {
  const d = subDays(new Date(), daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.getTime();
};
const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));

/** Replace all data with a curated demo dataset. */
export async function seedDemoData(name = 'Samuele') {
  const C = COPY[getActiveLang()];
  await clearAllData();
  await updateSettings({
    name,
    goals: { moveKcal: 600, exerciseMin: 30, standHours: 12 },
    body: { unit: 'kg', heightCm: 178, startWeightKg: 80, goalWeightKg: 74 },
  });

  // -- Projects -------------------------------------------------------------
  const web = await createProject({ name: C.projects.web[0], color: '#4F46E5', description: C.projects.web[1] });
  const casa = await createProject({ name: C.projects.casa[0], color: '#FF6B57', description: C.projects.casa[1] });
  const studio = await createProject({ name: C.projects.studio[0], color: '#10B981' });

  // -- Tasks ----------------------------------------------------------------
  await createTask({ title: C.tasksWeb[0], projectId: web.id, status: 'done', priority: 'medium' });
  await createTask({ title: C.tasksWeb[1], projectId: web.id, status: 'doing', priority: 'high', dueDate: iso(-1) });
  await createTask({
    title: C.tasksWeb[2],
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
  await createTask({ title: C.tasksWeb[3], projectId: web.id, status: 'todo', priority: 'high', dueDate: iso(-5) });

  await createTask({ title: C.tasksCasa[0], projectId: casa.id, status: 'todo', priority: 'high', dueDate: iso(0) });
  await createTask({ title: C.tasksCasa[1], projectId: casa.id, status: 'todo', priority: 'low', dueDate: iso(-4) });
  await createTask({ title: C.tasksCasa[2], projectId: casa.id, status: 'done', priority: 'medium' });

  await createTask({ title: C.tasksStudio[0], projectId: studio.id, status: 'doing', priority: 'medium', dueDate: iso(0) });
  await createTask({ title: C.tasksStudio[1], projectId: studio.id, status: 'todo', priority: 'low', dueDate: iso(-7) });

  // Inbox (no project)
  await createTask({ title: C.tasksInbox[0], status: 'todo', priority: 'medium', dueDate: iso(-2) });
  await createTask({ title: C.tasksInbox[1], status: 'todo', priority: 'low' });

  // -- Habits + logs --------------------------------------------------------
  const habits = [
    await createHabit({ name: C.habits[0], color: '#0EA5E9', frequency: { type: 'daily' } }),
    await createHabit({ name: C.habits[1], color: '#F59E0B', frequency: { type: 'daily' } }),
    await createHabit({ name: C.habits[2], color: '#7C3AED', frequency: { type: 'daily' } }),
    await createHabit({ name: C.habits[3], color: '#FF6B57', frequency: { type: 'times_per_week', timesPerWeek: 3 } }),
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
  const moods: Mood[] = [4, 5, 3, 4, 2, 4];
  const journalDays = [0, 1, 2, 3, 5, 7];
  for (let i = 0; i < journalDays.length; i++) {
    await createJournalEntry({ date: iso(journalDays[i]), mood: moods[i], text: C.journal[i], tags: [...C.journalTags[i]] });
  }

  // -- Goals ----------------------------------------------------------------
  await createGoal({ title: C.goalSite[0], description: C.goalSite[1], targetDate: iso(-20), link: { type: 'project', refId: web.id } });
  await createGoal({ title: C.goalHydration, link: { type: 'habit', refId: habits[0].id } });
  await createGoal({ title: C.goalBooks, manualProgress: 0.42, link: { type: 'none' }, targetDate: iso(-200) });
  await createGoal({
    title: C.goalHouse[0],
    description: C.goalHouse[1],
    targetDate: iso(-300),
    link: { type: 'milestones' },
    milestones: C.milestones.map((title, i) => ({ id: `m${i + 1}`, title, done: i < 2 })),
  });

  // -- Finances -------------------------------------------------------------
  await setBudget(1500);
  await createTransaction({ type: 'income', amount: 2400, category: 'salary', date: iso(25) });
  await createTransaction({ type: 'expense', amount: 780, category: 'home', date: iso(22), note: C.noteRent });
  await createTransaction({ type: 'expense', amount: 210, category: 'groceries', date: iso(18) });
  await createTransaction({ type: 'expense', amount: 95, category: 'bills', date: iso(15), note: C.noteUtilities });
  await createTransaction({ type: 'expense', amount: 60, category: 'transport', date: iso(12) });
  await createTransaction({ type: 'expense', amount: 45, category: 'restaurants', date: iso(8) });
  await createTransaction({ type: 'expense', amount: 120, category: 'shopping', date: iso(5) });
  await createTransaction({ type: 'income', amount: 150, category: 'extra', date: iso(4), note: C.noteSideGig });
  await createTransaction({ type: 'expense', amount: 35, category: 'leisure', date: iso(2), note: C.noteCinema });
  await createTransaction({ type: 'expense', amount: 72, category: 'groceries', date: iso(1) });

  // Current-month set so the money-flow (Sankey) always has data to show.
  const mDay = (d: number) => format(new Date(new Date().getFullYear(), new Date().getMonth(), d), 'yyyy-MM-dd');
  await createTransaction({ type: 'income', amount: 2400, category: 'salary', date: mDay(1) });
  await createTransaction({ type: 'expense', amount: 860, category: 'home', date: mDay(1), note: C.noteRent });
  await createTransaction({ type: 'expense', amount: 220, category: 'groceries', date: mDay(2) });
  await createTransaction({ type: 'expense', amount: 95, category: 'bills', date: mDay(3) });
  await createTransaction({ type: 'expense', amount: 60, category: 'transport', date: mDay(4) });
  await createTransaction({ type: 'expense', amount: 120, category: 'shopping', date: mDay(5) });
  await createTransaction({ type: 'expense', amount: 45, category: 'restaurants', date: mDay(6) });

  // -- Water (ml; ~1L–1.8L per day) -----------------------------------------
  for (let d = 0; d < 7; d++) await setWaterMl(iso(d), rand(5, 9) * 200);

  // -- Weight (gentle downward trend 80 → 77.4 over 60 days) ----------------
  for (let d = 60; d >= 0; d -= 3) {
    const base = 80 - (60 - d) * 0.043; // ~2.6kg over 60 days
    await logWeight({ date: iso(d), weightKg: Math.round((base + (Math.random() - 0.5) * 0.5) * 10) / 10 });
  }
}
