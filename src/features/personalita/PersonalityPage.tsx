import { useState } from 'react';
import { Sparkles, Check, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, useToast } from '@/ui';
import { useI18n } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import { createHabit } from '@/data/repo';
import { RECOMMENDED_HABITS } from '@/features/abitudini/recommended';
import { QUIZ, PROFILES, computeProfile, savedProfile, saveProfile, type ProfileId } from './quiz';

const CHROME = {
  title: { it: 'Test della personalità', en: 'Personality test' },
  intro: {
    it: 'Rispondi a 5 domande veloci e scopri come tenerti motivato e quali abitudini fanno per te. Resta tutto sul tuo dispositivo.',
    en: 'Answer 5 quick questions to find out how to stay motivated and which habits suit you. Everything stays on your device.',
  },
  start: { it: 'Inizia', en: 'Start' },
  question: { it: 'Domanda', en: 'Question' },
  of: { it: 'di', en: 'of' },
  yourProfile: { it: 'Il tuo profilo', en: 'Your profile' },
  howTo: { it: 'Come restare motivato', en: 'How to stay motivated' },
  suggested: { it: 'Abitudini consigliate per te', en: 'Habits suggested for you' },
  addHabits: { it: 'Aggiungi queste abitudini', en: 'Add these habits' },
  added: { it: 'abitudini aggiunte', en: 'habits added' },
  retake: { it: 'Rifai il test', en: 'Retake the test' },
} as const;

export function PersonalityPage() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();

  const existing = savedProfile();
  const [view, setView] = useState<'intro' | 'quiz' | 'result'>(existing ? 'result' : 'intro');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<ProfileId | null>(existing);

  function start() {
    setAnswers([]);
    setStep(0);
    setResult(null);
    setView('quiz');
  }

  function choose(optIdx: number) {
    const next = [...answers, optIdx];
    if (step + 1 >= QUIZ.length) {
      const profile = computeProfile(next);
      saveProfile(profile);
      setResult(profile);
      setView('result');
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  }

  return (
    <>
      <PageHeader title={CHROME.title[lang]} back="/altro" />
      <Screen>
        {view === 'intro' && (
          <div className="flex flex-col items-center text-center pt-4">
            <span className="h-16 w-16 rounded-2xl bg-primary border border-primary-border flex items-center justify-center text-on-primary mb-4">
              <Sparkles size={30} />
            </span>
            <h1 className="text-2xl font-bold text-ink">{CHROME.title[lang]}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{CHROME.intro[lang]}</p>
            <Button size="lg" className="mt-6" onClick={start}>{CHROME.start[lang]}</Button>
          </div>
        )}

        {view === 'quiz' && (
          <div>
            <div className="metric-label mb-2">
              {CHROME.question[lang]} {step + 1} {CHROME.of[lang]} {QUIZ.length}
            </div>
            <div className="h-1.5 rounded-full bg-section overflow-hidden mb-5">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }}
              />
            </div>
            <h2 className="text-xl font-bold text-ink mb-4">{QUIZ[step].text[lang]}</h2>
            <div className="space-y-2.5">
              {QUIZ[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  className="w-full text-left rounded-card border border-line dark:border-transparent dark:bg-section p-4 text-[15px] text-ink active:bg-section transition-colors"
                >
                  {opt.text[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'result' && result && (
          <ResultView profile={result} lang={lang} onRetake={start} onAddHabits={addSuggestedHabits} />
        )}
      </Screen>
    </>
  );

  async function addSuggestedHabits(ids: string[]) {
    let n = 0;
    for (const id of ids) {
      const rec = RECOMMENDED_HABITS.find((r) => r.id === id);
      if (rec) {
        await createHabit({ name: t(rec.labelKey), color: rec.color, frequency: rec.frequency });
        n++;
      }
    }
    toast.show(`${n} ${CHROME.added[lang]}`);
    navigate('/abitudini');
  }
}

function ResultView({
  profile,
  lang,
  onRetake,
  onAddHabits,
}: {
  profile: ProfileId;
  lang: 'it' | 'en';
  onRetake: () => void;
  onAddHabits: (ids: string[]) => void;
}) {
  const { t } = useI18n();
  const p = PROFILES[profile];
  return (
    <div>
      <div className="flex flex-col items-center text-center pt-2 pb-5">
        <div className="text-5xl mb-2">{p.emoji}</div>
        <div className="metric-label">{CHROME.yourProfile[lang]}</div>
        <h1 className="text-2xl font-bold text-ink mt-0.5">{p.name[lang]}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{p.desc[lang]}</p>
      </div>

      <Card className="mb-4">
        <div className="metric-label mb-1.5">{CHROME.howTo[lang]}</div>
        <p className="text-[14px] text-ink leading-relaxed">{p.tips[lang]}</p>
      </Card>

      <Card className="mb-4">
        <div className="metric-label mb-2.5">{CHROME.suggested[lang]}</div>
        <div className="space-y-2">
          {p.habitIds.map((id) => {
            const rec = RECOMMENDED_HABITS.find((r) => r.id === id);
            if (!rec) return null;
            return (
              <div key={id} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: rec.color }} />
                <span className="text-[15px] text-ink">{t(rec.labelKey)}</span>
              </div>
            );
          })}
        </div>
        <Button block className="mt-4" icon={<Check size={17} />} onClick={() => onAddHabits(p.habitIds)}>
          {CHROME.addHabits[lang]}
        </Button>
      </Card>

      <button onClick={onRetake} className="w-full inline-flex items-center justify-center gap-1.5 text-[14px] text-ink-2 py-2">
        <RotateCcw size={15} /> {CHROME.retake[lang]}
      </button>
    </div>
  );
}
