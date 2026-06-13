import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Drama, Check, Lock, Sparkles, ChevronLeft, RotateCcw } from 'lucide-react';
import { db } from '@/data/db';
import { writePersonalityResult, setPersonalityUnlocked } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Button, useToast } from '@/ui';
import { useT, useI18n, type TKey } from '@/i18n';
import { platform } from '@/platform/platform';
import { isBillingConfigured, getPersonalityPrice, ownsPersonality, purchasePersonality } from '@/premium/billing';
import { PERSONALITY_PRICE_FALLBACK } from '@/premium/config';
import { QUESTIONS, TYPES, type PTypeText } from './content';
import { scoreAnswers, codeFromScores, TOTAL_QUESTIONS, type Answers } from './scoring';
import type { PersonalityResult } from '@/data/types';

const GOLD = '#C9A227';

export function PersonalityPage() {
  // `undefined` = still loading; `null` = loaded but no result yet.
  const result = useLiveQuery(async () => (await db.personality.get('result')) ?? null, [], undefined);
  const [testing, setTesting] = useState(false);

  async function finish(answers: Answers) {
    const scores = scoreAnswers(answers);
    const code = codeFromScores(scores);
    // Preserve an existing unlock (ownership persists across retakes).
    const unlocked = result?.unlocked || (isBillingConfigured() ? await ownsPersonality() : false);
    await writePersonalityResult({ code, scores, unlocked });
    setTesting(false);
  }

  if (result === undefined) return null; // loading
  if (testing) return <TestFlow onDone={finish} onCancel={() => setTesting(false)} />;
  if (!result) return <Intro onStart={() => setTesting(true)} />;
  return <ResultView result={result} onRetake={() => setTesting(true)} />;
}

// --- Intro ------------------------------------------------------------------

function Intro({ onStart }: { onStart: () => void }) {
  const t = useT();
  return (
    <>
      <PageHeader title={t('nav.personality')} />
      <Screen>
        <div className="flex flex-col items-center text-center pt-8">
          <span className="h-20 w-20 rounded-3xl flex items-center justify-center" style={{ background: 'var(--c-personality-tint)', color: 'var(--c-personality)' }}>
            <Drama size={40} />
          </span>
          <h1 className="text-[24px] font-extrabold text-ink mt-5">{t('personality.intro.title')}</h1>
          <p className="text-[14px] text-ink-2 leading-relaxed mt-2 max-w-sm">{t('personality.intro.desc')}</p>
          <div className="w-full max-w-sm mt-8">
            <Button block size="lg" onClick={onStart}>{t('personality.intro.start')}</Button>
          </div>
        </div>
      </Screen>
    </>
  );
}

// --- Test flow --------------------------------------------------------------

function TestFlow({ onDone, onCancel }: { onDone: (a: Answers) => void; onCancel: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const [answers, setAnswers] = useState<Answers>({});
  const [i, setI] = useState(0);
  const q = QUESTIONS[i];
  const progress = (i + (answers[q.id] ? 1 : 0)) / TOTAL_QUESTIONS;

  function pick(value: number) {
    platform.haptic();
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (i + 1 >= TOTAL_QUESTIONS) onDone(next);
    else setTimeout(() => setI(i + 1), 140);
  }

  return (
    <div className="min-h-[100dvh] bg-app">
      <div className="max-w-xl mx-auto px-5 pt-safe-top pb-[calc(120px+env(safe-area-inset-bottom))] min-h-[100dvh] flex flex-col">
        {/* Top bar: back + progress */}
        <div className="flex items-center gap-3 h-14 pt-2">
          <button
            onClick={() => (i === 0 ? onCancel() : setI(i - 1))}
            aria-label={t('personality.back')}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 active:scale-90 transition-transform"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 h-2 rounded-full bg-section overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(progress * 100)}%`, background: 'var(--c-personality)' }} />
          </div>
        </div>

        <p className="text-[12px] font-bold uppercase tracking-wider text-ink-3 mt-6">{t('personality.q.of', { n: i + 1, total: TOTAL_QUESTIONS })}</p>
        <h1 className="text-[22px] font-extrabold text-ink leading-snug mt-2 min-h-[96px]">{lang === 'it' ? q.it : q.en}</h1>

        <div className="flex-1 min-h-[12px]" />

        {/* Likert 1..5 */}
        <div className="space-y-2.5">
          {[5, 4, 3, 2, 1].map((v) => {
            const active = answers[q.id] === v;
            return (
              <button
                key={v}
                onClick={() => pick(v)}
                className="w-full h-[52px] rounded-card text-[15px] font-semibold flex items-center justify-center transition-all active:scale-[0.99]"
                style={{
                  background: active ? 'var(--c-personality)' : 'var(--c-card)',
                  color: active ? '#fff' : 'var(--c-ink)',
                  boxShadow: active ? 'none' : '0 2px 10px rgba(83,52,20,0.06)',
                }}
              >
                {t(`personality.likert.${v}` as TKey)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Result -----------------------------------------------------------------

function ResultView({ result, onRetake }: { result: PersonalityResult; onRetake: () => void }) {
  const t = useT();
  const { lang } = useI18n();
  const toast = useToast();
  const type = TYPES[result.code];
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState<string | null>(null);
  const billingActive = isBillingConfigured();

  useEffect(() => {
    if (billingActive) void getPersonalityPrice().then(setPrice);
  }, [billingActive]);

  // Unknown code safeguard (shouldn't happen with all 16 present).
  if (!type) {
    return (
      <>
        <PageHeader title={t('nav.personality')} />
        <Screen><Button block onClick={onRetake}>{t('personality.result.retake')}</Button></Screen>
      </>
    );
  }

  const tx: PTypeText = lang === 'it' ? type.it : type.en;
  const accent = type.accent;

  async function unlock() {
    if (!billingActive) {
      toast.show(t('personality.web'));
      return;
    }
    setBusy(true);
    const ok = await purchasePersonality();
    if (ok) await setPersonalityUnlocked(true);
    setBusy(false);
    toast.show(ok ? t('personality.purchased') : t('personality.purchaseError'));
  }

  async function restore() {
    if (!billingActive) {
      toast.show(t('personality.web'));
      return;
    }
    setBusy(true);
    const ok = await ownsPersonality();
    if (ok) await setPersonalityUnlocked(true);
    setBusy(false);
    toast.show(ok ? t('personality.restored') : t('personality.noPurchase'));
  }

  return (
    <>
      <PageHeader title={t('personality.result.title')} action={
        <button onClick={onRetake} aria-label={t('personality.result.retake')} className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 active:scale-90 transition-transform">
          <RotateCcw size={20} />
        </button>
      } />
      <Screen>
        {/* Hero */}
        <div className="rounded-card p-6 text-center" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
          <div className="text-[44px] font-black tracking-tight" style={{ color: accent }}>{result.code}</div>
          <div className="text-[20px] font-extrabold text-ink mt-1">{tx.name}</div>
          <div className="text-[14px] font-semibold mt-1" style={{ color: accent }}>{tx.tagline}</div>
          <p className="text-[14px] text-ink-2 leading-relaxed mt-3">{tx.summary}</p>
        </div>

        {/* Full profile */}
        <h2 className="text-[16px] font-extrabold text-ink mt-6 mb-2 flex items-center gap-2">
          <Sparkles size={18} style={{ color: GOLD }} /> {t('personality.full.title')}
        </h2>

        {result.unlocked ? (
          <div className="space-y-4">
            <Section title={t('personality.section.strengths')} accent={accent}>
              <ul className="space-y-1.5">
                {tx.strengths.map((sgth, k) => (
                  <li key={k} className="flex gap-2 text-[14px] text-ink leading-snug">
                    <Check size={16} style={{ color: accent }} className="mt-0.5 flex-shrink-0" /> {sgth}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title={t('personality.section.growth')} accent={accent}>
              <ul className="space-y-1.5">
                {tx.growth.map((g, k) => (
                  <li key={k} className="flex gap-2 text-[14px] text-ink leading-snug">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: accent }}>•</span> {g}
                  </li>
                ))}
              </ul>
            </Section>
            <Section title={t('personality.section.work')} accent={accent}><p className="text-[14px] text-ink leading-relaxed">{tx.work}</p></Section>
            <Section title={t('personality.section.careers')} accent={accent}>
              <div className="flex flex-wrap gap-2">
                {tx.careers.map((c, k) => (
                  <span key={k} className="text-[13px] font-semibold px-3 py-1.5 rounded-full" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}>{c}</span>
                ))}
              </div>
            </Section>
            <Section title={t('personality.section.stress')} accent={accent}><p className="text-[14px] text-ink leading-relaxed">{tx.stress}</p></Section>
            <Section title={t('personality.section.relationships')} accent={accent}><p className="text-[14px] text-ink leading-relaxed">{tx.relationships}</p></Section>
            <Section title={t('personality.section.traits')} accent={accent}><p className="text-[14px] text-ink leading-relaxed">{tx.famousTraits}</p></Section>
          </div>
        ) : (
          <div className="rounded-card bg-card shadow-card p-5 relative overflow-hidden">
            {/* blurred teaser */}
            <div className="space-y-2 select-none" style={{ filter: 'blur(5px)', opacity: 0.5 }} aria-hidden>
              <div className="h-3.5 rounded-full bg-section w-3/4" />
              <div className="h-3.5 rounded-full bg-section w-full" />
              <div className="h-3.5 rounded-full bg-section w-2/3" />
              <div className="h-3.5 rounded-full bg-section w-5/6" />
            </div>
            <div className="mt-4 flex flex-col items-center text-center">
              <span className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: `${GOLD}1f`, color: GOLD }}>
                <Lock size={22} />
              </span>
              <p className="text-[14px] text-ink-2 leading-snug mt-3 max-w-xs">{t('personality.full.locked')}</p>
              {billingActive ? (
                <Button block size="lg" disabled={busy} onClick={unlock} className="!bg-[#C9A227] !text-white mt-4">
                  {t('personality.full.unlock', { price: price ?? PERSONALITY_PRICE_FALLBACK })}
                </Button>
              ) : (
                <div className="rounded-card bg-section px-4 py-3 text-center text-[13px] text-ink-2 mt-4 w-full">{t('personality.web')}</div>
              )}
              <button onClick={restore} disabled={busy} className="mt-3 text-[12px] text-ink-3 py-1 disabled:opacity-50">{t('personality.restore')}</button>
            </div>
          </div>
        )}

        <button onClick={onRetake} className="mt-6 w-full h-12 rounded-full bg-section text-ink font-bold text-[15px] active:scale-[0.98] transition-transform">
          {t('personality.result.retake')}
        </button>
      </Screen>
    </>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-card shadow-card p-4">
      <h3 className="text-[13px] font-extrabold uppercase tracking-wide mb-2" style={{ color: accent }}>{title}</h3>
      {children}
    </div>
  );
}
