import { useState } from 'react';
import { Plus, Check, Languages, X, HeartPulse, ListChecks, Brain, Star, ChevronLeft, Sun, Moon } from 'lucide-react';
import { Button, Input } from '@/ui';
import { StarMascot } from '@/ui/StarMascot';
import { useI18n, LANGS, type Lang, type TKey } from '@/i18n';
import { useTheme } from '@/theme/theme';
import { createHabit, updateSettings } from '@/data/repo';
import { RECOMMENDED_HABITS } from '@/features/abitudini/recommended';
import { ALL_MODULES, type ModuleId } from '@/data/types';
import { MODULE_LIST } from '@/features/personalizzazione/modules';

type Focus = 'health' | 'productivity' | 'wellbeing' | 'all';

/** Which modules each focus area enables. Selecting several = the union. */
const FOCUS_MODULES: Record<'health' | 'productivity' | 'wellbeing', ModuleId[]> = {
  health: ['attivita', 'peso', 'abitudini'],
  productivity: ['progetti', 'obiettivi', 'calendario', 'finanze'],
  wellbeing: ['diario', 'abitudini'],
};

/** Modules to enable from a set of chosen focuses (all/empty → everything). */
function modulesForFocus(set: Set<Focus>): Set<ModuleId> {
  if (set.has('all') || set.size === 0) return new Set(ALL_MODULES);
  const out = new Set<ModuleId>();
  for (const f of set) if (f !== 'all') FOCUS_MODULES[f].forEach((m) => out.add(m));
  return out.size ? out : new Set(ALL_MODULES);
}

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

/** Clear the onboarding flag so the flow runs again (Settings → "Redo"). */
export function resetOnboarding() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

type Step = 'lang' | 'welcome1' | 'intro' | 'focus' | 'modules' | 'habits' | 'name' | 'aha';
const STEPS: Step[] = ['lang', 'welcome1', 'intro', 'focus', 'modules', 'habits', 'name', 'aha'];

/** First-run onboarding: language → welcome → focus → sections → habits → name → aha. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t, setPref } = useI18n();
  const { resolved, setPref: setThemePref } = useTheme();
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState('');
  const [focusSet, setFocusSet] = useState<Set<Focus>>(new Set(['all']));
  const [modules, setModules] = useState<Set<ModuleId>>(new Set(ALL_MODULES));
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [customHabits, setCustomHabits] = useState<string[]>([]);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const [committed, setCommitted] = useState(false);

  // A single representative focus for settings/AhaStep (several or 'all' → 'all').
  const primaryFocus: Focus = focusSet.has('all') || focusSet.size !== 1 ? 'all' : [...focusSet][0];

  async function commit() {
    if (committed) return;
    setCommitted(true);
    for (const id of picked) {
      const rec = RECOMMENDED_HABITS.find((r) => r.id === id);
      if (rec) await createHabit({ name: t(rec.labelKey), color: rec.color, frequency: rec.frequency });
    }
    for (const n of customHabits) await createHabit({ name: n, frequency: { type: 'daily' } });
    // Persist chosen interests (in canonical order) alongside name + focus.
    const selected = ALL_MODULES.filter((m) => modules.has(m));
    await updateSettings({ name: name.trim() || undefined, focus: primaryFocus, enabledModules: selected, moduleOrder: selected });
  }

  async function next() {
    // Pre-select modules from the chosen focus areas (the user can still tweak).
    if (step === 'focus') setModules(modulesForFocus(focusSet));
    // Persist everything when leaving the "name" step, so the aha screen and
    // the app behind it already reflect the user's choices.
    if (step === 'name') await commit();
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function toggleFocus(f: Focus) {
    setFocusSet((prev) => {
      if (f === 'all') return new Set<Focus>(['all']);
      const n = new Set(prev);
      n.delete('all');
      n.has(f) ? n.delete(f) : n.add(f);
      return n;
    });
  }

  function back() {
    setStepIdx((i) => Math.max(0, i - 1));
  }

  function toggleHabit(id: string) {
    setPicked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function toggleModule(id: ModuleId) {
    setModules((prev) => {
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
    <div className="fixed inset-0 z-[70] bg-app flex flex-col pt-safe-top pb-safe-bottom animate-fade-in overflow-hidden">
      {/* warm sunrise glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[140%]"
        style={{ background: 'radial-gradient(ellipse at top, var(--c-glow), transparent 70%)' }}
      />
      <div className="relative flex items-center justify-between px-4 pt-3 h-12">
        {stepIdx > 0 ? (
          <button onClick={back} aria-label={t('common.back')} className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 active:bg-section">
            <ChevronLeft size={24} />
          </button>
        ) : (
          <span className="w-10" />
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setThemePref(resolved === 'dark' ? 'light' : 'dark')}
            aria-label={t('theme.toggle')}
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 active:bg-section"
          >
            {resolved === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {step !== 'lang' && (
            <button onClick={skip} className="text-[14px] font-semibold text-ink-3 px-3 py-2">
              {t('onboard.skip')}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-7">
        {step === 'lang' && <LanguageStep onPick={(l) => { setPref(l); }} />}
        {step === 'welcome1' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <span className="h-36 w-36 rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
              <StarMascot size={104} animated />
            </span>
            <h1 className="text-[28px] font-extrabold text-ink tracking-tight mt-4">{t('onboard.1.title')}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.1.desc')}</p>
          </div>
        )}
        {step === 'intro' && <IntroStep />}
        {step === 'focus' && <FocusStep value={focusSet} onToggle={toggleFocus} />}
        {step === 'modules' && <ModulesStep selected={modules} onToggle={toggleModule} />}
        {step === 'habits' && (
          <HabitsStep picked={picked} onToggle={toggleHabit} customHabits={customHabits} setCustomHabits={setCustomHabits} />
        )}
        {step === 'name' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <span className="h-24 w-24 rounded-[28px] flex items-center justify-center mb-6 text-primary" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
              <Plus size={44} />
            </span>
            <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.3.title')}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.3.desc')}</p>
            <div className="w-full max-w-xs mt-7 text-left">
              <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.name')}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onboard.namePh')} />
            </div>
          </div>
        )}
        {step === 'aha' && <AhaStep name={name} focus={primaryFocus} habitCount={totalPicked} />}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 my-4">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-250"
            style={{ width: i === stepIdx ? 26 : 8, background: i === stepIdx ? 'var(--c-primary)' : 'var(--c-line)' }}
          />
        ))}
      </div>

      <div className="px-6 pb-6">
        <Button block size="lg" disabled={(step === 'modules' && modules.size === 0) || (step === 'focus' && focusSet.size === 0)} onClick={() => (isLast ? finish() : next())}>
          {isLast
            ? t('onboard.start')
            : step === 'habits'
              ? `${t('onboard.next')}${totalPicked ? ` (${totalPicked})` : ''}`
              : step === 'modules'
                ? `${t('onboard.next')}${modules.size ? ` (${modules.size})` : ''}`
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

function FocusStep({ value, onToggle }: { value: Set<Focus>; onToggle: (f: Focus) => void }) {
  const { t } = useI18n();
  return (
    <div className="pt-4">
      <div className="text-center mb-5">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.focus.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.focus.desc')}</p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        {FOCUS_OPTS.map((o) => {
          const Icon = o.icon;
          const on = value.has(o.value);
          return (
            <button
              key={o.value}
              onClick={() => onToggle(o.value)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-card bg-card shadow-chip transition-all text-left active:scale-[0.99]"
              style={{ boxShadow: on ? `0 0 0 2.5px ${o.color}, 0 4px 14px ${o.color}22` : undefined }}
            >
              <span className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${o.color} 16%, transparent)`, color: o.color }}>
                <Icon size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-ink">{t(o.titleKey)}</div>
                <div className="text-[13px] text-ink-2">{t(o.descKey)}</div>
              </div>
              {on && (
                <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: o.color }}>
                  <Check size={15} className="text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntroStep() {
  const { t } = useI18n();
  const rows: { emoji: string; titleKey: TKey; descKey: TKey }[] = [
    { emoji: '🎯', titleKey: 'onboard.why.1.title', descKey: 'onboard.why.1.desc' },
    { emoji: '📈', titleKey: 'onboard.why.2.title', descKey: 'onboard.why.2.desc' },
    { emoji: '🔒', titleKey: 'onboard.why.3.title', descKey: 'onboard.why.3.desc' },
    { emoji: '🐼', titleKey: 'onboard.why.4.title', descKey: 'onboard.why.4.desc' },
  ];
  return (
    <div className="pt-4">
      <div className="text-center mb-6">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.why.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.why.desc')}</p>
      </div>
      <div className="space-y-3 max-w-md mx-auto">
        {rows.map((r) => (
          <div key={r.titleKey} className="flex items-start gap-3 px-4 py-3.5 rounded-card bg-card shadow-chip">
            <span className="text-2xl leading-none mt-0.5">{r.emoji}</span>
            <div className="min-w-0">
              <div className="text-[15px] font-semibold text-ink">{t(r.titleKey)}</div>
              <div className="text-[13px] text-ink-2 leading-snug">{t(r.descKey)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModulesStep({ selected, onToggle }: { selected: Set<ModuleId>; onToggle: (id: ModuleId) => void }) {
  const { t } = useI18n();
  return (
    <div className="pt-4">
      <div className="text-center mb-5">
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.modules.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.modules.desc')}</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto">
        {MODULE_LIST.map((m) => {
          const Icon = m.icon;
          const on = selected.has(m.id);
          return (
            <button
              key={m.id}
              onClick={() => onToggle(m.id)}
              className="flex flex-col items-start gap-2 p-3.5 rounded-card bg-card shadow-chip transition-all text-left relative active:scale-[0.98]"
              style={{ boxShadow: on ? `0 0 0 2.5px ${m.accent}, 0 4px 14px ${m.accent}22` : undefined }}
            >
              <span className="h-11 w-11 rounded-2xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${m.accent} 16%, transparent)`, color: m.accent }}>
                <Icon size={21} />
              </span>
              <span className="text-[14px] font-bold text-ink">{t(m.labelKey)}</span>
              <span className="text-[12px] text-ink-2 leading-snug">{t(m.descKey)}</span>
              {on && (
                <span className="absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: m.accent }}>
                  <Check size={13} className="text-white" strokeWidth={3} />
                </span>
              )}
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
      <span className="h-36 w-36 rounded-full flex items-center justify-center mb-2" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
        <StarMascot size={104} mood="starstruck" animated />
      </span>
      <h1 className="text-[28px] font-extrabold text-ink tracking-tight mt-4">
        {name.trim() ? t('onboard.aha.title', { name: name.trim() }) : t('onboard.aha.titleNoName')}
      </h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.aha.desc')}</p>
      <div className="flex flex-col gap-2.5 mt-5 w-full max-w-xs">
        <div className="flex items-center gap-2.5 bg-card shadow-chip rounded-card px-4 py-3.5 text-[14px] font-semibold text-ink">
          <span className="h-6 w-6 rounded-full bg-habit flex items-center justify-center flex-shrink-0"><Check size={14} className="text-white" strokeWidth={3} /></span>
          {t('onboard.aha.habits', { n: habitCount })}
        </div>
        <div className="flex items-center gap-2.5 bg-card shadow-chip rounded-card px-4 py-3.5 text-[14px] font-semibold text-ink">
          <span className="h-6 w-6 rounded-full bg-habit flex items-center justify-center flex-shrink-0"><Check size={14} className="text-white" strokeWidth={3} /></span>
          {t('onboard.aha.focus', { focus: focusLabel })}
        </div>
      </div>
    </div>
  );
}

function LanguageStep({ onPick }: { onPick: (l: Lang) => void }) {
  const { t, lang } = useI18n();
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <span className="h-24 w-24 rounded-[28px] flex items-center justify-center mb-6 text-primary" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
        <Languages size={44} />
      </span>
      <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.lang.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed mb-6">{t('onboard.lang.desc')}</p>
      <div className="w-full max-w-xs space-y-2.5">
        {LANGS.map((l) => {
          const active = lang === l.code;
          return (
            <button
              key={l.code}
              onClick={() => onPick(l.code)}
              className="w-full flex items-center justify-between px-4 h-14 rounded-card bg-card shadow-chip transition-all active:scale-[0.99]"
              style={{ boxShadow: active ? '0 0 0 2.5px var(--c-primary), 0 4px 14px rgba(255,122,69,0.18)' : undefined }}
            >
              <span className="text-[15px] font-semibold text-ink">{l.label}</span>
              {active && (
                <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check size={15} className="text-white" strokeWidth={3} />
                </span>
              )}
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
        <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.habits.title')}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.habits.desc')}</p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        {RECOMMENDED_HABITS.map((r) => {
          const on = picked.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => onToggle(r.id)}
              className="w-full flex items-center gap-3 px-4 h-[60px] rounded-card bg-card shadow-chip transition-all text-left active:scale-[0.99]"
              style={{ boxShadow: on ? `0 0 0 2.5px ${r.color}, 0 4px 14px ${r.color}22` : undefined }}
            >
              <span className="h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${r.color} 16%, transparent)` }}>
                <span className="h-3 w-3 rounded-full" style={{ background: r.color }} />
              </span>
              <span className="flex-1 text-[15px] font-semibold text-ink">{t(r.labelKey)}</span>
              <span
                className="h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: on ? r.color : 'var(--c-line)', background: on ? r.color : 'transparent' }}
              >
                {on && <Check size={15} className="text-white" strokeWidth={3} />}
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
