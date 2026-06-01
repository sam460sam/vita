import { useState } from 'react';
import { Plus, Check, Languages, X, HeartPulse, ListChecks, Brain, Star } from 'lucide-react';
import { Button, Input } from '@/ui';
import { StarMascot } from '@/ui/StarMascot';
import { cn } from '@/lib/cn';
import { useI18n, LANGS, type Lang, type TKey } from '@/i18n';
import { createHabit, updateSettings } from '@/data/repo';
import { RECOMMENDED_HABITS } from '@/features/abitudini/recommended';

type Focus = 'health' | 'productivity' | 'wellbeing' | 'all';

const STORAGE_KEY = 'vita.onboarded';

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true; // fail open — never block the app
  }
}

function markOnboarded() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

type Step = 'lang' | 'welcome1' | 'focus' | 'habits' | 'name' | 'aha';
const STEPS: Step[] = ['lang', 'welcome1', 'focus', 'habits', 'name', 'aha'];

/** First-run onboarding: language → welcome → focus → habits → name → aha. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, setPref } = useI18n();
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState('');
  const [focus, setFocus] = useState<Focus>('all');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [customHabits, setCustomHabits] = useState<string[]>([]);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const [committed, setCommitted] = useState(false);

  async function commit() {
    if (committed) return;
    setCommitted(true);
    for (const id of picked) {
      const rec = RECOMMENDED_HABITS.find((r) => r.id === id);
      if (rec) await createHabit({ name: t(rec.labelKey), color: rec.color, frequency: rec.frequency });
    }
    for (const n of customHabits) await createHabit({ name: n, frequency: { type: 'daily' } });
    await updateSettings({ name: name.trim() || undefined, focus });
  }

  async function next() {
    // Persist everything when leaving the "name" step, so the aha screen and
    // the app behind it already reflect the user's choices.
    if (step === 'name') await commit();
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function toggleHabit(id: string) {
    setPicked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function finish() {
    await commit(); // safety: in case "name" was skipped
    markOnboarded();
    onDone();
  }

  const totalPicked = picked.size + customHabits.length;

  function skip() {
    markOnboarded();
    onDone();
  }

  return (
    <div className="fixed inset-0 z-[70] bg-app flex flex-col pt-safe-top pb-safe-bottom animate-fade-in">
      <div className="flex justify-end px-5 pt-3 h-12">
        {step !== 'lang' && (
          <button onClick={skip} className="text-[14px] font-semibold text-ink-3 px-3 py-2">
            {t('onboard.skip')}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-7">
        {step === 'lang' && <LanguageStep onPick={(l) => { setPref(l); }} />}
        {step === 'welcome1' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <StarMascot size={120} animated />
            <h1 className="text-2xl font-bold text-ink mt-4">{t('onboard.1.title')}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.1.desc')}</p>
          </div>
        )}
        {step === 'focus' && <FocusStep value={focus} onPick={setFocus} />}
        {step === 'habits' && (
          <HabitsStep picked={picked} onToggle={toggleHabit} customHabits={customHabits} setCustomHabits={setCustomHabits} />
        )}
        {step === 'name' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <span className="h-20 w-20 rounded-3xl flex items-center justify-center mb-6 bg-activity/15 text-activity">
              <Plus size={40} />
            </span>
            <h1 className="text-2xl font-bold text-ink">{t('onboard.3.title')}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.3.desc')}</p>
            <div className="w-full max-w-xs mt-7 text-left">
              <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.name')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onboard.namePh')} />
            </div>
          </div>
        )}
        {step === 'aha' && <AhaStep name={name} focus={focus} habitCount={totalPicked} />}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 my-4">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-250"
            style={{ width: i === stepIdx ? 24 : 8, background: i === stepIdx ? 'var(--c-ink)' : 'var(--c-line)' }}
          />
        ))}
      </div>

      <div className="px-6 pb-6">
        <Button block size="lg" onClick={() => (isLast ? finish() : next())}>
          {isLast
            ? t('onboard.start')
            : step === 'habits'
              ? `${t('onboard.next')}${totalPicked ? ` (${totalPicked})` : ''}`
              : t('onboard.next')}
        </Button>
      </div>
    </div>
  );
}

const FOCUS_OPTS: { value: Focus; icon: typeof HeartPulse; color: string; titleKey: TKey; descKey: TKey }[] = [
  { value: 'health', icon: HeartPulse, color: 'var(--c-activity)', titleKey: 'onboard.focus.health', descKey: 'onboard.focus.healthDesc' },
  { value: 'productivity', icon: ListChecks, color: 'var(--c-project)', titleKey: 'onboard.focus.productivity', descKey: 'onboard.focus.productivityDesc' },
  { value: 'wellbeing', icon: Brain, color: 'var(--c-journal)', titleKey: 'onboard.focus.wellbeing', descKey: 'onboard.focus.wellbeingDesc' },
  { value: 'all', icon: Star, color: 'var(--c-habit)', titleKey: 'onboard.focus.all', descKey: 'onboard.focus.allDesc' },
];

function FocusStep({ value, onPick }: { value: Focus; onPick: (f: Focus) => void }) {
  const { t } = useI18n();
  return (
    <div className="pt-4">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-ink">{t('onboard.focus.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.focus.desc')}</p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        {FOCUS_OPTS.map((o) => {
          const Icon = o.icon;
          const on = value === o.value;
          return (
            <button
              key={o.value}
              onClick={() => onPick(o.value)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-card border transition-colors text-left',
                on ? 'border-ink bg-section' : 'border-line dark:border-transparent dark:bg-section',
              )}
            >
              <span className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${o.color}1a`, color: o.color }}>
                <Icon size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-ink">{t(o.titleKey)}</div>
                <div className="text-[13px] text-ink-2">{t(o.descKey)}</div>
              </div>
              {on && <Check size={18} className="text-ink" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AhaStep({ name, focus, habitCount }: { name: string; focus: Focus; habitCount: number }) {
  const { t } = useI18n();
  const focusLabel = t(`onboard.focus.${focus}` as TKey);
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
      <StarMascot size={120} mood="starstruck" animated />
      <h1 className="text-2xl font-bold text-ink mt-4">
        {name.trim() ? t('onboard.aha.title', { name: name.trim() }) : t('onboard.aha.titleNoName')}
      </h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.aha.desc')}</p>
      <div className="flex flex-col gap-2 mt-5 w-full max-w-xs">
        <div className="flex items-center gap-2 bg-section rounded-card px-4 py-3 text-[14px] text-ink">
          <Check size={16} className="text-habit" /> {t('onboard.aha.habits', { n: habitCount })}
        </div>
        <div className="flex items-center gap-2 bg-section rounded-card px-4 py-3 text-[14px] text-ink">
          <Check size={16} className="text-habit" /> {t('onboard.aha.focus', { focus: focusLabel })}
        </div>
      </div>
    </div>
  );
}

function LanguageStep({ onPick }: { onPick: (l: Lang) => void }) {
  const { t, lang } = useI18n();
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <span className="h-20 w-20 rounded-3xl flex items-center justify-center mb-6 bg-project/15 text-project">
        <Languages size={40} />
      </span>
      <h1 className="text-2xl font-bold text-ink">{t('onboard.lang.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed mb-6">{t('onboard.lang.desc')}</p>
      <div className="w-full max-w-xs space-y-2">
        {LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => onPick(l.code)}
              className={cn(
                'w-full flex items-center justify-between px-4 h-12 rounded-btn border transition-colors',
                active ? 'border-ink bg-section' : 'border-line',
              )}
            >
              <span className="text-[15px] font-medium text-ink">{l.label}</span>
              {active && <Check size={18} className="text-ink" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HabitsStep({
  picked,
  onToggle,
  customHabits,
  setCustomHabits,
}: {
  picked: Set<string>;
  onToggle: (id: string) => void;
  customHabits: string[];
  setCustomHabits: (v: string[]) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');

  function addCustom() {
    const v = draft.trim();
    if (v && !customHabits.includes(v)) setCustomHabits([...customHabits, v]);
    setDraft('');
  }

  return (
    <div className="pt-2">
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold text-ink">{t('onboard.habits.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.habits.desc')}</p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        {RECOMMENDED_HABITS.map((r) => {
          const on = picked.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => onToggle(r.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 h-14 rounded-card border transition-colors text-left',
                on ? 'border-ink bg-section' : 'border-line',
              )}
            >
              <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
              <span className="flex-1 text-[15px] font-medium text-ink">{t(r.labelKey)}</span>
              <span
                className={cn('h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0')}
                style={{ borderColor: on ? 'var(--c-ink)' : 'var(--c-line)', background: on ? 'var(--c-ink)' : 'transparent' }}
              >
                {on && <Check size={15} className="text-app" strokeWidth={3} />}
              </span>
            </button>
          );
        })}

        {/* User-added custom habits */}
        {customHabits.map((name) => (
          <div key={name} className="w-full flex items-center gap-3 px-4 h-14 rounded-card border border-ink bg-section text-left">
            <span className="h-3 w-3 rounded-full flex-shrink-0 bg-ink" />
            <span className="flex-1 text-[15px] font-medium text-ink">{name}</span>
            <button
              onClick={() => setCustomHabits(customHabits.filter((h) => h !== name))}
              aria-label="−"
              className="h-6 w-6 rounded-full bg-ink text-app flex items-center justify-center flex-shrink-0"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ))}

        {/* Write your own */}
        <div className="pt-2">
          <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.habits.custom')}</label>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              placeholder={t('onboard.habits.customPh')}
            />
            <Button variant="subtle" onClick={addCustom} icon={<Plus size={18} />} aria-label={t('common.add')} />
          </div>
        </div>
      </div>
    </div>
  );
}
