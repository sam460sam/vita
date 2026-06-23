import { useState } from 'react';
import { Plus, Check, Languages, X, HeartPulse, ListChecks, Brain, Star, ChevronLeft, Sun, Moon, Bell, Crown, Droplet } from 'lucide-react';
import { Button, Input, Segmented } from '@/ui';
import { useI18n, LANGS, type Lang, type TKey } from '@/i18n';
import { useTheme } from '@/theme/theme';
import { notifications } from '@/platform/notifications';
import { createHabit, updateSettings, readSettings } from '@/data/repo';
import { RECOMMENDED_HABITS, recommendedForGoal } from '@/features/abitudini/recommended';
import { ALL_MODULES, type ModuleId, type Settings } from '@/data/types';
import { MODULE_LIST } from '@/features/personalizzazione/modules';
import { Paywall } from '@/premium/SubscriptionGate';
import { TRIAL_DAYS } from '@/premium/config';
import { recommendedWaterMl, ACTIVITY_ML, type ActivityLevel } from '@/features/acqua/WaterPage';

const GOLD = '#C9A227';
const WATER = '#0EA5E9';
import vioWelcome from '/vio/vio-happy.png';
import vioBell from '/vio/vio-bell.png';
import vioCelebrate from '/vio/vio-happy.png';
import vioWaiting from '/vio/vio-wait.png';
import iconSun from '/icons3d/sun.png';
import iconLotus from '/icons3d/lotus.png';
import iconMoon from '/icons3d/moon.png';
import iconCompass from '/icons3d/compass.png';
import iconHabits3d from '/icons3d/habits.png';

type Goal = NonNullable<Settings['goal']>;

type Focus = 'health' | 'productivity' | 'wellbeing' | 'all';

/** Which modules each focus area enables. Selecting several = the union. */
const FOCUS_MODULES: Record<'health' | 'productivity' | 'wellbeing', ModuleId[]> = {
  health: ['attivita', 'peso', 'abitudini'],
  productivity: ['progetti', 'obiettivi', 'calendario', 'finanze'],
  wellbeing: ['diario', 'abitudini'],
};

/** The hero pages are always enabled (they lead the tab bar). */
const HERO_MODULES: ModuleId[] = ['abitudini', 'acqua', 'personalita'];

/** Modules to enable from a set of chosen focuses (all/empty → everything). */
function modulesForFocus(set: Set<Focus>): Set<ModuleId> {
  if (set.has('all') || set.size === 0) return new Set(ALL_MODULES);
  const out = new Set<ModuleId>(HERO_MODULES);
  for (const f of set) if (f !== 'all') FOCUS_MODULES[f].forEach((m) => out.add(m));
  return out;
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

type Step =
  | 'lang' | 'welcome1' | 'intro' | 'focus' | 'personal' | 'water' | 'goal' | 'modules' | 'habits' | 'name' | 'aha'
  // Mandatory monetization sequence at the end: trial → notify → paywall.
  | 'trial' | 'notify' | 'paywall';
const STEPS: Step[] = ['lang', 'welcome1', 'intro', 'focus', 'personal', 'water', 'goal', 'modules', 'habits', 'name', 'aha', 'trial', 'notify', 'paywall'];
/** Steps the user can't skip (the trial/paywall flow). */
const NO_SKIP: Step[] = ['trial', 'notify', 'paywall'];

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
  const [wantNotif, setWantNotif] = useState(true);
  const [goals, setGoals] = useState<Set<Goal>>(new Set());
  // Personal details (strings while editing) + activity level for the water test.
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('light');

  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;
  const waterMl = weightNum > 0 && heightNum > 0 ? recommendedWaterMl(weightNum, heightNum, ACTIVITY_ML[activity]) : 0;

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
      if (rec) await createHabit({ name: t(rec.labelKey), recId: rec.id, icon: rec.icon, color: rec.color, frequency: rec.frequency });
    }
    for (const n of customHabits) await createHabit({ name: n, frequency: { type: 'daily' } });
    // Opt-in to daily reminders: ask permission + schedule a gentle morning nudge
    // and a heads-up shortly before the free trial ends.
    if (wantNotif) {
      if (notifications.supported()) await notifications.requestPermission();
      await notifications.setDailyReminder('motivation', t('reminder.motivation.title'), t('reminder.motivation.body'), '09:00');
      if (notifications.supported()) {
        const at = new Date(Date.now() + Math.max(1, TRIAL_DAYS - 1) * 86_400_000);
        await notifications.scheduleAt('trialEnd', t('reminder.trialEnd.title'), t('reminder.trialEnd.body', { n: TRIAL_DAYS }), at);
        // Sunday evening weekly recap (weekday 1 = Sunday).
        await notifications.setWeeklyReminder('recap', 1, t('reminder.recap.title'), t('reminder.recap.body'), '18:00');
      }
    }
    // Persist chosen interests (in canonical order) alongside name + focus +
    // personal answers + the calculated water goal. Merge nested objects so we
    // don't drop defaults (unit, glass size).
    const selected = ALL_MODULES.filter((m) => modules.has(m));
    const cur = await readSettings();
    await updateSettings({
      name: name.trim() || undefined,
      focus: primaryFocus,
      age: parseInt(age) || undefined,
      goal: [...goals][0],
      body: { ...cur.body, heightCm: heightNum || cur.body.heightCm, startWeightKg: weightNum || cur.body.startWeightKg },
      water: waterMl ? { ...cur.water, dailyGoalMl: waterMl } : cur.water,
      enabledModules: selected,
      moduleOrder: selected,
      reminders: wantNotif ? { motivation: '09:00' } : {},
    });
  }

  async function next() {
    // Pre-select modules from the chosen focus areas (the user can still tweak).
    if (step === 'focus') setModules(modulesForFocus(focusSet));
    // Persist everything when leaving the "notify" step (the last choice before
    // the aha screen), so the app behind it already reflects the user's setup.
    if (step === 'notify') await commit();
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function toggleGoal(g: Goal) {
    setGoals((prev) => {
      const n = new Set(prev);
      n.has(g) ? n.delete(g) : n.add(g);
      return n;
    });
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

  // Final step: the paywall takes over the whole screen (its own layout). Closing
  // it (X) or subscribing both finish onboarding and enter the app.
  if (step === 'paywall') {
    return (
      <div className="fixed inset-0 z-[70] bg-app overflow-y-auto">
        <Paywall onClose={() => void finish()} />
      </div>
    );
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
          {step !== 'lang' && !NO_SKIP.includes(step) && (
            <button onClick={skip} className="text-[14px] font-semibold text-ink-3 px-3 py-2">
              {t('onboard.skip')}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-7 ob-content">
        {step === 'lang' && <LanguageStep onPick={(l) => { setPref(l); }} />}
        {step === 'welcome1' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <img src={vioWelcome} alt="" aria-hidden draggable={false} className="vio-bob w-40 h-40 object-contain mb-2" />
            <h1 className="display-serif text-[30px] text-ink leading-tight mt-4">{t('onboard.1.title')}</h1>
            <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.1.desc')}</p>
          </div>
        )}
        {step === 'intro' && <IntroStep />}
        {step === 'focus' && <FocusStep value={focusSet} onToggle={toggleFocus} />}
        {step === 'personal' && <PersonalStep age={age} setAge={setAge} weight={weight} setWeight={setWeight} height={height} setHeight={setHeight} />}
        {step === 'water' && <WaterIntroStep weightKg={weightNum} heightCm={heightNum} activity={activity} setActivity={setActivity} ml={waterMl} />}
        {step === 'goal' && <GoalStep value={goals} onToggle={toggleGoal} />}
        {step === 'modules' && <ModulesStep selected={modules} onToggle={toggleModule} />}
        {step === 'habits' && (
          <HabitsStep goal={[...goals][0]} picked={picked} onToggle={toggleHabit} customHabits={customHabits} setCustomHabits={setCustomHabits} />
        )}
        {step === 'name' && (
          <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
            <span className="h-24 w-24 rounded-card flex items-center justify-center mb-6 text-primary" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
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
        {step === 'trial' && <TrialStep />}
        {step === 'notify' && <NotifyStep value={wantNotif} onChange={setWantNotif} />}
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
            : step === 'trial'
              ? t('onboard.trial.cta')
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
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left active:scale-[0.99]"
              style={{
                background: on ? `color-mix(in srgb, ${o.color} 12%, var(--c-card))` : 'var(--c-card)',
                boxShadow: on ? `inset 0 0 0 2px ${o.color}` : '0 2px 10px rgba(83,52,20,0.05)',
              }}
            >
              <span className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `color-mix(in srgb, ${o.color} 16%, transparent)`, color: o.color }}>
                <Icon size={22} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold text-ink">{t(o.titleKey)}</div>
                <div className="text-[13px] text-ink-2">{t(o.descKey)}</div>
              </div>
              <span
                className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: on ? o.color : 'transparent', border: on ? 'none' : '2px solid var(--c-line)' }}
              >
                {on && <Check size={15} className="text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A single-select list row (WhatsApp/Instagram-style: tint fill + round check). */
function PersonalStep({ age, setAge, weight, setWeight, height, setHeight }: {
  age: string; setAge: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  height: string; setHeight: (v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <img src={vioWaiting} alt="" aria-hidden draggable={false} className="vio-bob w-28 h-28 object-contain mb-3" />
      <h1 className="display-serif text-[28px] text-ink leading-tight">{t('onboard.personal.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.personal.desc')}</p>
      <div className="w-full max-w-xs mt-7 space-y-3 text-left">
        <div>
          <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.personal.age')}</label>
          <Input type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} placeholder={t('onboard.personal.agePh')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.personal.weight')}</label>
            <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.personal.height')}</label>
            <Input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterIntroStep({ weightKg, heightCm, activity, setActivity, ml }: {
  weightKg: number; heightCm: number; activity: ActivityLevel; setActivity: (a: ActivityLevel) => void; ml: number;
}) {
  const { t } = useI18n();
  const hasData = weightKg > 0 && heightCm > 0;
  const liters = (ml / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',');
  const glasses = Math.max(1, Math.round(ml / 200));
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <span className="h-24 w-24 rounded-card flex items-center justify-center mb-6" style={{ background: `${WATER}1f`, color: WATER }}>
        <Droplet size={44} fill={WATER} />
      </span>
      <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.water.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.water.desc')}</p>

      {hasData ? (
        <div className="w-full max-w-xs mt-6 rounded-card p-5" style={{ background: `color-mix(in srgb, ${WATER} 12%, transparent)` }}>
          <div className="text-[40px] font-extrabold text-ink leading-none tnum">{liters} <span className="text-[20px]">L</span></div>
          <div className="text-[13px] text-ink-2 mt-1">{t('onboard.water.perDay', { n: glasses })}</div>
        </div>
      ) : (
        <div className="w-full max-w-xs mt-6 rounded-card p-4 bg-card shadow-chip text-[13px] text-ink-2">{t('onboard.water.needData')}</div>
      )}

      <div className="w-full max-w-xs mt-5 text-left">
        <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.water.activity')}</label>
        <Segmented
          className="w-full"
          value={activity}
          onChange={(v) => setActivity(v as ActivityLevel)}
          options={[
            { value: 'sedentary', label: t('water.calc.act.sedentary') },
            { value: 'light', label: t('water.calc.act.light') },
            { value: 'active', label: t('water.calc.act.active') },
            { value: 'intense', label: t('water.calc.act.intense') },
          ]}
        />
      </div>
    </div>
  );
}

const GOAL_OPTS: { value: Goal; key: TKey; icon: string }[] = [
  { value: 'feel_better', key: 'onboard.goal.feel_better', icon: iconSun },
  { value: 'get_organized', key: 'onboard.goal.get_organized', icon: iconCompass },
  { value: 'reduce_stress', key: 'onboard.goal.reduce_stress', icon: iconLotus },
  { value: 'build_consistency', key: 'onboard.goal.build_consistency', icon: iconHabits3d },
  { value: 'reach_goal', key: 'onboard.goal.reach_goal', icon: iconMoon },
];

function GoalStep({ value, onToggle }: { value: Set<Goal>; onToggle: (g: Goal) => void }) {
  const { t } = useI18n();
  return (
    <div className="pt-6">
      <h1 className="display-serif text-[28px] text-ink leading-tight text-center">{t('onboard.goal.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed text-center">{t('onboard.goal.desc')}</p>
      <div className="w-full max-w-sm mx-auto mt-7 space-y-2.5">
        {GOAL_OPTS.map((o) => {
          const selected = value.has(o.value);
          return (
            <button
              key={o.value}
              onClick={() => onToggle(o.value)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl bg-card text-left transition-all active:scale-[0.99]"
              style={{ boxShadow: selected ? '0 0 0 2.5px #4F9D55, 0 6px 18px rgba(79,157,85,0.18)' : '0 2px 10px rgba(83,52,20,0.05)' }}
            >
              <img src={o.icon} alt="" aria-hidden draggable={false} className="h-10 w-10 object-contain flex-shrink-0" />
              <span className="flex-1 text-[15.5px] font-bold text-ink">{t(o.key)}</span>
              <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: selected ? '#4F9D55' : 'transparent', border: selected ? 'none' : '2px solid var(--c-line)' }}>
                {selected && <Check size={14} className="text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrialStep() {
  const { t } = useI18n();
  const bullets: TKey[] = ['onboard.trial.b1', 'onboard.trial.b2', 'onboard.trial.b3'];
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <span className="h-24 w-24 rounded-card flex items-center justify-center mb-6" style={{ background: `${GOLD}1f`, color: GOLD }}>
        <Crown size={44} fill={GOLD} />
      </span>
      <h1 className="text-[28px] font-extrabold text-ink tracking-tight">{t('onboard.trial.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.trial.desc', { n: TRIAL_DAYS })}</p>
      <div className="w-full max-w-xs mt-7 space-y-2.5 text-left">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-3 bg-card shadow-chip rounded-card px-4 py-3.5">
            <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: GOLD }}>
              <Check size={14} className="text-white" strokeWidth={3} />
            </span>
            <span className="text-[14px] font-semibold text-ink">{t(b)}</span>
          </div>
        ))}
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
    { emoji: '✨', titleKey: 'onboard.why.4.title', descKey: 'onboard.why.4.desc' },
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
              className="flex flex-col items-start gap-2 p-3.5 rounded-2xl transition-all text-left relative active:scale-[0.98]"
              style={{
                background: on ? `color-mix(in srgb, ${m.accent} 12%, var(--c-card))` : 'var(--c-card)',
                boxShadow: on ? `inset 0 0 0 2px ${m.accent}` : '0 2px 10px rgba(83,52,20,0.05)',
              }}
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

function NotifyStep({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center text-center pt-6">
      <img src={vioBell} alt="" aria-hidden draggable={false} className="vio-bob w-32 h-32 object-contain mb-3" />
      <h1 className="display-serif text-[28px] text-ink leading-tight">{t('onboard.notify.title')}</h1>
      <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{t('onboard.notify.desc')}</p>
      <button
        onClick={() => onChange(!value)}
        className="w-full max-w-sm mt-7 flex items-center gap-3 px-4 py-4 rounded-2xl transition-all active:scale-[0.99]"
        style={{
          background: value ? 'color-mix(in srgb, var(--c-primary) 12%, var(--c-card))' : 'var(--c-card)',
          boxShadow: value ? 'inset 0 0 0 2px var(--c-primary)' : '0 2px 10px rgba(83,52,20,0.05)',
        }}
      >
        <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--c-primary) 16%, transparent)', color: 'var(--c-primary)' }}>
          <Bell size={20} />
        </span>
        <span className="flex-1 text-left text-[15px] font-bold text-ink">{t('onboard.notify.toggle')}</span>
        <span className="h-6 w-11 rounded-full relative transition-colors flex-shrink-0" style={{ background: value ? 'var(--c-primary)' : 'var(--c-line)' }}>
          <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all" style={{ left: value ? '22px' : '2px' }} />
        </span>
      </button>
      <p className="text-[12px] text-ink-3 mt-3 max-w-xs">{t('onboard.notify.hint')}</p>
      <p className="text-[12px] font-semibold mt-2 max-w-xs" style={{ color: GOLD }}>{t('onboard.notify.trialNote', { n: TRIAL_DAYS })}</p>
    </div>
  );
}

function AhaStep({ name, focus, habitCount }: { name: string; focus: Focus; habitCount: number }) {
  const { t } = useI18n();
  const focusLabel = t(`onboard.focus.${focus}` as TKey);
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-full py-8">
      <img src={vioCelebrate} alt="" aria-hidden draggable={false} className="vio-bob w-40 h-40 object-contain mb-2" />
      <h1 className="display-serif text-[28px] text-ink leading-tight mt-4">
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
      <span className="h-24 w-24 rounded-card flex items-center justify-center mb-6 text-primary" style={{ background: 'linear-gradient(140deg, var(--c-hero-1), var(--c-hero-2))' }}>
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
              className="w-full flex items-center justify-between px-4 h-14 rounded-2xl transition-all active:scale-[0.99]"
              style={{
                background: active ? 'color-mix(in srgb, var(--c-primary) 12%, var(--c-card))' : 'var(--c-card)',
                boxShadow: active ? 'inset 0 0 0 2px var(--c-primary)' : '0 2px 10px rgba(83,52,20,0.05)',
              }}
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
  goal,
  picked,
  onToggle,
  customHabits,
  setCustomHabits,
}: {
  goal?: Goal;
  picked: Set<string>;
  onToggle: (id: string) => void;
  customHabits: string[];
  setCustomHabits: (v: string[]) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState('');
  const recs = recommendedForGoal(goal);

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
        {recs.map((r) => {
          const on = picked.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => onToggle(r.id)}
              className="w-full flex items-center gap-3 px-4 h-[60px] rounded-2xl transition-all text-left active:scale-[0.99]"
              style={{
                background: on ? `color-mix(in srgb, ${r.color} 12%, var(--c-card))` : 'var(--c-card)',
                boxShadow: on ? `inset 0 0 0 2px ${r.color}` : '0 2px 10px rgba(83,52,20,0.05)',
              }}
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
