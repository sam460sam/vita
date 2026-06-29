import { QUESTIONS, type Axis } from './content';

export type Answers = Record<number, number>; // questionId → 1..5 (Likert)
export type Scores = Record<Axis, number>;

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Sum weighted answers per axis: (answer - 3) * dir. */
export function scoreAnswers(answers: Answers): Scores {
  const s: Scores = { EI: 0, SN: 0, TF: 0, JP: 0 };
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (!a) continue;
    s[q.axis] += (a - 3) * q.dir;
  }
  return s;
}

/** Build the 4-letter code (E/I · S/N · T/F · J/P) from axis scores. Ties
 *  resolve to the negative pole (I/S/T/P) to stay deterministic. */
export function codeFromScores(s: Scores): string {
  return (
    (s.EI > 0 ? 'E' : 'I') +
    (s.SN > 0 ? 'N' : 'S') +
    (s.TF > 0 ? 'F' : 'T') +
    (s.JP > 0 ? 'J' : 'P')
  );
}
