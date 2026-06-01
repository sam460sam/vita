import type { TKey } from '@/i18n';

/** A guided topic Stella can explain. Matched by keywords (IT + EN). */
export interface StellaTopic {
  id: string;
  /** keywords (lowercase) that trigger this answer */
  keywords: string[];
  questionKey: TKey; // suggested-question label
  answerKey: TKey; // the answer body
  /** optional in-app route to jump to */
  route?: string;
}

export const STELLA_TOPICS: StellaTopic[] = [
  {
    id: 'addTask',
    keywords: ['task', 'attività', 'cosa fare', 'to do', 'todo', 'progetti', 'project'],
    questionKey: 'stella.q.addTask',
    answerKey: 'stella.a.addTask',
    route: '/progetti',
  },
  {
    id: 'addHabit',
    keywords: ['abitudine', 'abitudini', 'habit', 'streak', 'routine'],
    questionKey: 'stella.q.addHabit',
    answerKey: 'stella.a.addHabit',
    route: '/abitudini',
  },
  {
    id: 'water',
    keywords: ['acqua', 'water', 'bere', 'drink', 'litri', 'bicchiere'],
    questionKey: 'stella.q.water',
    answerKey: 'stella.a.water',
    route: '/oggi',
  },
  {
    id: 'workout',
    keywords: ['allenamento', 'sport', 'workout', 'palestra', 'corsa', 'attivit', 'health', 'salute', 'strava', 'garmin'],
    questionKey: 'stella.q.workout',
    answerKey: 'stella.a.workout',
    route: '/attivita',
  },
  {
    id: 'finance',
    keywords: ['finanze', 'soldi', 'budget', 'spese', 'banca', 'money', 'csv', 'estratto'],
    questionKey: 'stella.q.finance',
    answerKey: 'stella.a.finance',
    route: '/finanze',
  },
  {
    id: 'goal',
    keywords: ['obiettivo', 'obiettivi', 'goal', 'tappe', 'progetto futuro', 'milestone'],
    questionKey: 'stella.q.goal',
    answerKey: 'stella.a.goal',
    route: '/obiettivi',
  },
  {
    id: 'backup',
    keywords: ['backup', 'salva', 'salvataggio', 'export', 'import', 'dati', 'perdere', 'data'],
    questionKey: 'stella.q.backup',
    answerKey: 'stella.a.backup',
    route: '/impostazioni',
  },
  {
    id: 'language',
    keywords: ['lingua', 'language', 'inglese', 'italiano', 'tema', 'theme', 'scuro', 'dark'],
    questionKey: 'stella.q.language',
    answerKey: 'stella.a.language',
    route: '/impostazioni',
  },
];

/** Find the best matching topic for a free-text query (keyword scoring). */
export function matchTopic(query: string): StellaTopic | null {
  const q = query.toLowerCase();
  let best: { topic: StellaTopic; score: number } | null = null;
  for (const topic of STELLA_TOPICS) {
    let score = 0;
    for (const k of topic.keywords) if (q.includes(k)) score += k.length;
    if (score > 0 && (!best || score > best.score)) best = { topic, score };
  }
  return best?.topic ?? null;
}
