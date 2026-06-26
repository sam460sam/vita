// ============================================================================
// "Refine the result" — the AI proposes 2-3 quick physical tests; the user
// answers and we re-run identification with their answers (BUILD-SPEC §2.5).
// Makes the app genuinely interactive AND improves accuracy.
// ============================================================================
import { useState } from 'react';
import { Sheet, Button } from '@/ui';
import type { RefineAnswer } from '@/lib/api';

// Quick-answer suggestions inferred from the question text, so most answers are
// one tap (still allows free text).
function suggestionsFor(q: string): string[] {
  const s = q.toLowerCase();
  if (s.includes('magnet')) return ['Yes, magnetic', 'No', 'Not sure'];
  if (s.includes('streak')) return ['White', 'Black', 'Red/brown', 'Colourless'];
  if (s.includes('scratch') || s.includes('hard') || s.includes('glass'))
    return ['Scratches glass', 'Glass scratches it', 'Not sure'];
  if (s.includes('transparen') || s.includes('translucen') || s.includes('clear'))
    return ['Transparent', 'Translucent', 'Opaque'];
  if (s.includes('lustre') || s.includes('luster') || s.includes('shiny') || s.includes('metallic'))
    return ['Metallic', 'Glassy', 'Dull/earthy'];
  if (s.includes('colour') || s.includes('color'))
    return ['Purple', 'Green', 'Blue', 'Red/pink', 'White/clear', 'Black'];
  if (s.includes('heav') || s.includes('dens')) return ['Feels heavy', 'Feels light', 'Not sure'];
  return ['Yes', 'No', 'Not sure'];
}

export function RefineSheet({
  open,
  onClose,
  questions,
  loading,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  questions: string[];
  loading: boolean;
  onSubmit: (answers: RefineAnswer[]) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const set = (i: number, v: string) => setAnswers((a) => ({ ...a, [i]: v }));

  const submit = () => {
    const out: RefineAnswer[] = questions
      .map((q, i) => ({ question: q, answer: (answers[i] || '').trim() }))
      .filter((a) => a.answer.length > 0);
    onSubmit(out);
  };

  const answeredCount = Object.values(answers).filter((v) => v.trim()).length;

  return (
    <Sheet open={open} onClose={onClose} title="Refine the result">
      <p className="mb-4 text-sm text-ink-2">
        Answer a couple of quick physical tests and we’ll sharpen the identification. Skip any you’re unsure about.
      </p>

      <div className="space-y-5">
        {questions.map((q, i) => (
          <div key={i}>
            <div className="mb-2 text-[15px] font-medium text-ink">{q}</div>
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestionsFor(q).map((s) => (
                <button
                  key={s}
                  onClick={() => set(i, s)}
                  className={
                    'rounded-pill px-3 py-1.5 text-sm transition-colors ' +
                    (answers[i] === s
                      ? 'bg-amethyst text-white'
                      : 'bg-white/5 text-ink-2 hover:bg-white/10')
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              value={answers[i] && !suggestionsFor(q).includes(answers[i]) ? answers[i] : ''}
              onChange={(e) => set(i, e.target.value)}
              placeholder="…or type your own"
              className="w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 outline-none ring-1 ring-white/5 focus:ring-amethyst/50"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 mb-2">
        <Button block size="lg" loading={loading} disabled={answeredCount === 0} onClick={submit}>
          {answeredCount === 0 ? 'Answer at least one' : `Re-identify with ${answeredCount} answer${answeredCount > 1 ? 's' : ''}`}
        </Button>
      </div>
    </Sheet>
  );
}
