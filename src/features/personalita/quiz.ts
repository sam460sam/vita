// ============================================================================
// Personality / motivation quiz. Self-contained bilingual content (it/en) so it
// doesn't bloat the shared i18n dictionaries. The result maps the user to a
// motivation profile and suggests starter habits (by RECOMMENDED_HABITS id).
// Everything is local — no data leaves the device.
// ============================================================================
import type { Lang } from '@/i18n';

export type ProfileId = 'challenger' | 'steady' | 'explorer' | 'reflective';

type LangText = Record<Lang, string>;

export interface QuizOption {
  text: LangText;
  /** Points added to one or more profiles when chosen. */
  scores: Partial<Record<ProfileId, number>>;
}

export interface QuizQuestion {
  id: string;
  text: LangText;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'drive',
    text: { it: 'Cosa ti dà più carica?', en: 'What energizes you most?' },
    options: [
      { text: { it: 'Battere un record o una sfida', en: 'Beating a record or a challenge' }, scores: { challenger: 2 } },
      { text: { it: 'Una routine che non salta mai', en: 'A routine that never breaks' }, scores: { steady: 2 } },
      { text: { it: 'Provare cose nuove', en: 'Trying new things' }, scores: { explorer: 2 } },
      { text: { it: 'Capire il perché di quello che faccio', en: 'Understanding the why behind what I do' }, scores: { reflective: 2 } },
    ],
  },
  {
    id: 'setback',
    text: { it: 'Quando salti un giorno…', en: 'When you skip a day…' },
    options: [
      { text: { it: 'Mi arrabbio e voglio recuperare subito', en: 'I get annoyed and want to catch up right away' }, scores: { challenger: 2 } },
      { text: { it: 'Riprendo con calma il giorno dopo', en: 'I calmly pick it back up the next day' }, scores: { steady: 2 } },
      { text: { it: 'Cambio approccio per non annoiarmi', en: 'I switch things up so I don’t get bored' }, scores: { explorer: 2 } },
      { text: { it: 'Mi chiedo cosa è andato storto', en: 'I ask myself what went wrong' }, scores: { reflective: 2 } },
    ],
  },
  {
    id: 'goalsize',
    text: { it: 'Preferisci obiettivi…', en: 'You prefer goals that are…' },
    options: [
      { text: { it: 'Ambiziosi, anche difficili', en: 'Ambitious, even hard' }, scores: { challenger: 2 } },
      { text: { it: 'Piccoli e costanti', en: 'Small and consistent' }, scores: { steady: 2, reflective: 1 } },
      { text: { it: 'Vari, che cambiano spesso', en: 'Varied, changing often' }, scores: { explorer: 2 } },
    ],
  },
  {
    id: 'reward',
    text: { it: 'Cosa ti motiva di più a continuare?', en: 'What keeps you going?' },
    options: [
      { text: { it: 'Vedere numeri e streak crescere', en: 'Seeing numbers and streaks grow' }, scores: { challenger: 2 } },
      { text: { it: 'La sensazione di equilibrio', en: 'A feeling of balance' }, scores: { steady: 1, reflective: 1 } },
      { text: { it: 'La curiosità e le novità', en: 'Curiosity and novelty' }, scores: { explorer: 2 } },
      { text: { it: 'Riflettere sui miei progressi', en: 'Reflecting on my progress' }, scores: { reflective: 2 } },
    ],
  },
  {
    id: 'plan',
    text: { it: 'Come organizzi la giornata?', en: 'How do you plan your day?' },
    options: [
      { text: { it: 'Con obiettivi chiari da spuntare', en: 'With clear goals to check off' }, scores: { challenger: 1, steady: 1 } },
      { text: { it: 'Con orari e abitudini fisse', en: 'With fixed times and habits' }, scores: { steady: 2 } },
      { text: { it: 'In modo flessibile, a sensazione', en: 'Flexibly, by feel' }, scores: { explorer: 2 } },
      { text: { it: 'Con un momento per pensare e scrivere', en: 'With a moment to think and journal' }, scores: { reflective: 2 } },
    ],
  },
];

export interface Profile {
  id: ProfileId;
  emoji: string;
  name: LangText;
  desc: LangText;
  /** How to stay motivated, tailored to this profile. */
  tips: LangText;
  /** Suggested starter habits, by RECOMMENDED_HABITS id. */
  habitIds: string[];
}

export const PROFILES: Record<ProfileId, Profile> = {
  challenger: {
    id: 'challenger',
    emoji: '🔥',
    name: { it: 'Lo Sfidante', en: 'The Challenger' },
    desc: {
      it: 'Ti accendi davanti a una sfida e ami vedere i progressi misurabili.',
      en: 'You light up in front of a challenge and love measurable progress.',
    },
    tips: {
      it: 'Punta su streak e obiettivi ambiziosi: tieni d’occhio i numeri e festeggia i record. Una piccola competizione con te stesso ti tiene in pista.',
      en: 'Lean into streaks and ambitious goals: watch the numbers and celebrate records. A little competition with yourself keeps you on track.',
    },
    habitIds: ['gym', 'move', 'water'],
  },
  steady: {
    id: 'steady',
    emoji: '🌱',
    name: { it: 'Il Costante', en: 'The Steady One' },
    desc: {
      it: 'Cresci con la costanza: piccoli passi ripetuti ogni giorno.',
      en: 'You grow through consistency: small steps repeated every day.',
    },
    tips: {
      it: 'Scegli poche abitudini facili e ancorale a orari fissi. Non puntare alla perfezione: la regolarità batte l’intensità.',
      en: 'Pick a few easy habits and anchor them to fixed times. Don’t aim for perfection: regularity beats intensity.',
    },
    habitIds: ['water', 'sleep', 'stretch'],
  },
  explorer: {
    id: 'explorer',
    emoji: '🧭',
    name: { it: 'L’Esploratore', en: 'The Explorer' },
    desc: {
      it: 'Ti annoi con la routine: hai bisogno di varietà e novità.',
      en: 'Routine bores you: you need variety and novelty.',
    },
    tips: {
      it: 'Cambia spesso le tue attività e prova nuove abitudini ogni settimana. La curiosità è la tua benzina: rendila un gioco.',
      en: 'Rotate your activities and try new habits each week. Curiosity is your fuel: make it a game.',
    },
    habitIds: ['move', 'read', 'gym'],
  },
  reflective: {
    id: 'reflective',
    emoji: '🪞',
    name: { it: 'Il Riflessivo', en: 'The Reflective' },
    desc: {
      it: 'Ti muovi meglio quando capisci il senso di ciò che fai.',
      en: 'You move best when you understand the meaning of what you do.',
    },
    tips: {
      it: 'Dedica un momento a scrivere e rivedere i progressi. Collega ogni abitudine a un “perché” e usa il diario per restare motivato.',
      en: 'Spend a moment journaling and reviewing your progress. Tie each habit to a “why” and use the diary to stay motivated.',
    },
    habitIds: ['meditate', 'read', 'sleep'],
  },
};

/** Tally answers (option index per question) into the winning profile. */
export function computeProfile(answers: number[]): ProfileId {
  const totals: Record<ProfileId, number> = { challenger: 0, steady: 0, explorer: 0, reflective: 0 };
  answers.forEach((optIdx, qIdx) => {
    const opt = QUIZ[qIdx]?.options[optIdx];
    if (!opt) return;
    for (const k in opt.scores) {
      const id = k as ProfileId;
      totals[id] += opt.scores[id] ?? 0;
    }
  });
  return (Object.keys(totals) as ProfileId[]).reduce((best, id) => (totals[id] > totals[best] ? id : best), 'steady');
}

const STORAGE_KEY = 'vita.personality';

export function savedProfile(): ProfileId | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && v in PROFILES ? (v as ProfileId) : null;
  } catch {
    return null;
  }
}

export function saveProfile(id: ProfileId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
