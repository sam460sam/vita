// ============================================================================
// Widget registry + components for the Apple-style home dashboard.
// Every widget reads real data from its module via Dexie liveQuery. The
// registry is the single source of truth used by the home grid and the gallery.
// ============================================================================
import type { FC } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link, useNavigate } from 'react-router-dom';
import {
  Flame, Droplet, Timer, Trophy, Quote, Scale, Wallet, BookHeart, Target,
  CheckCircle2, ListTodo, Plus, ChevronRight, Activity, type LucideIcon,
} from 'lucide-react';
import { db } from '@/data/db';
import { readSettings, addWaterMl, toggleTaskDone, toggleHabitLog } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import type { ModuleId, WidgetInstance, WidgetSize, WidgetType } from '@/data/types';
import { ActivityRings, ProgressRing, StarMascot, LineChart } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { cn } from '@/lib/cn';
import { todayISO, formatMoney, longDate } from '@/lib/format';
import { todayRings, ringsToData } from '@/features/attivita/logic';
import { currentStreak, pendingToday, isDone, isScheduled } from '@/features/abitudini/logic';
import { computeMomentum, stellaMood, momentumMessageKey } from '@/features/oggi/momentum';
import { dailyAffirmation } from '@/features/oggi/coach';
import { lifetimePoints, computeLevel } from '@/features/gamification/logic';
import { FastingCard } from '@/features/digiuno';
import { quickAddAmounts, formatWaterAmount } from '@/features/acqua/WaterCard';
import { useQuickAdd } from '@/app/QuickAdd';
import { subDays, startOfDay } from 'date-fns';

// ---------------------------------------------------------------------------
// Shared frame — every widget fills its grid cell with a consistent card.
// ---------------------------------------------------------------------------
function Frame({ to, accent, className, children, onClick }: {
  to?: string;
  accent?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <div
      className={cn(
        'h-full w-full bg-card rounded-card shadow-card border border-line/60 dark:border-transparent p-3 overflow-hidden flex flex-col',
        (to || onClick) && 'active:bg-section transition-colors',
        className,
      )}
      style={accent ? { borderColor: undefined } : undefined}
    >
      {children}
    </div>
  );
  if (to) return <Link to={to} className="block h-full">{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="block h-full w-full text-left">{inner}</button>;
  return inner;
}

function Head({ icon: Icon, label, accent }: { icon: LucideIcon; label: string; accent: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <Icon size={14} style={{ color: accent }} />
      <span className="metric-label truncate">{label}</span>
    </div>
  );
}

type WidgetProps = { instance: WidgetInstance };

// ---------------------------------------------------------------------------
// Core widgets
// ---------------------------------------------------------------------------
function MomentumWidget({ instance }: WidgetProps) {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const water = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const s = settings ?? defaultSettings();
  const m = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], water, journals ?? []);
  const big = instance.size !== 'small';
  return (
    <Frame to="/recap">
      <Head icon={Flame} label={t('momentum.title')} accent="var(--c-habit)" />
      <div className="flex-1 flex items-center gap-3 min-h-0">
        <ProgressRing progress={m.score / 100} size={big ? 72 : 54} stroke={7} color="var(--c-habit)">
          <StarMascot size={big ? 44 : 32} mood={stellaMood(m.score)} />
        </ProgressRing>
        <div className="min-w-0">
          <div className="text-2xl font-bold tnum text-ink leading-none">{m.score}<span className="text-ink-3 text-sm font-semibold">/100</span></div>
          {big && <p className="text-[12px] text-ink-2 leading-snug mt-1 line-clamp-2">{t(momentumMessageKey(m.score) as TKey)}</p>}
        </div>
      </div>
    </Frame>
  );
}

function AffirmationWidget() {
  const t = useT();
  return (
    <Frame accent="var(--c-journal)">
      <Head icon={Quote} label={t('widget.affirmation')} accent="var(--c-journal)" />
      <div className="flex-1 flex items-center">
        <p className="text-[14px] text-ink italic leading-snug line-clamp-4">{t(dailyAffirmation() as TKey)}</p>
      </div>
    </Frame>
  );
}

function RewardsWidget() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const weights = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const s = settings ?? defaultSettings();
  const points = lifetimePoints({ settings: s, habits: habits ?? [], logs: logs ?? [], tasks: tasks ?? [], workouts: workouts ?? [], waters: waters ?? [], journals: journals ?? [], weights: weights ?? [] });
  const lvl = computeLevel(points);
  return (
    <Frame to="/premi" accent="var(--c-habit)">
      <Head icon={Trophy} label={t('rewards.level')} accent="var(--c-habit)" />
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-3xl font-bold tnum text-ink leading-none">{lvl.level}</div>
        <div className="text-[12px] text-ink-2 mt-1 truncate">{t(lvl.titleKey as TKey)}</div>
      </div>
    </Frame>
  );
}

function QuickActionsWidget() {
  const t = useT();
  const navigate = useNavigate();
  const { openMenu } = useQuickAdd();
  const actions: { icon: LucideIcon; label: string; onClick: () => void; color: string }[] = [
    { icon: Plus, label: t('common.add'), onClick: openMenu, color: 'var(--c-habit)' },
    { icon: Droplet, label: t('water.glass'), onClick: () => addWaterMl(todayISO(), 250), color: '#0EA5E9' },
    { icon: Scale, label: t('quick.weight'), onClick: () => navigate('/peso'), color: 'var(--c-project)' },
    { icon: BookHeart, label: t('nav.journal'), onClick: () => navigate('/diario'), color: 'var(--c-journal)' },
  ];
  return (
    <Frame accent="var(--c-ink-2)">
      <Head icon={Plus} label={t('widget.quickActions')} accent="var(--c-ink-2)" />
      <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
        {actions.map((a) => (
          <button key={a.label} onClick={a.onClick} className="rounded-btn bg-section active:bg-divider flex items-center gap-2 px-2.5 min-w-0">
            <a.icon size={16} style={{ color: a.color }} className="flex-shrink-0" />
            <span className="text-[12px] font-medium text-ink truncate">{a.label}</span>
          </button>
        ))}
      </div>
    </Frame>
  );
}

function WaterWidget() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const log = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);
  const s = settings ?? defaultSettings();
  const goalMl = s.water.dailyGoalMl || 2000;
  const amounts = quickAddAmounts(s);
  const ml = log?.ml ?? 0;
  const progress = Math.min(1, ml / goalMl);
  return (
    <Frame accent="#0EA5E9">
      <Head icon={Droplet} label={t('water.today')} accent="#0EA5E9" />
      <div className="flex-1 flex items-center gap-3 min-h-0">
        <ProgressRing progress={progress} size={56} stroke={6} color="#0EA5E9">
          <Droplet size={18} style={{ color: '#0EA5E9' }} fill={progress >= 1 ? '#0EA5E9' : 'none'} />
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <div className="text-lg font-bold tnum text-ink leading-tight">{(ml / 1000).toFixed(1)}<span className="text-ink-3 text-xs font-semibold"> / {(goalMl / 1000).toFixed(1)} L</span></div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {amounts.map((amt, i) => (
              <button
                key={i}
                onClick={() => addWaterMl(todayISO(), amt)}
                className="h-8 px-2.5 rounded-btn bg-section active:bg-divider inline-flex items-center gap-1 text-[12px] font-semibold text-ink"
              >
                <Droplet size={14} style={{ color: '#0EA5E9' }} /> +{formatWaterAmount(amt)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DailyTodoWidget({ instance }: WidgetProps) {
  const t = useT();
  const today = todayISO();
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const due = (tasks ?? []).filter((tk) => tk.status !== 'done' && (tk.dueDate === today || (tk.dueDate && tk.dueDate < today)));
  const pending = pendingToday(habits ?? [], logs ?? []);
  const limit = instance.size === 'large' ? 6 : 3;
  const items = [
    ...due.map((tk) => ({ id: 'task:' + tk.id, label: tk.title, color: 'var(--c-project)', toggle: () => toggleTaskDone(tk.id) })),
    ...pending.map((h) => ({ id: 'habit:' + h.id, label: h.name, color: h.color, toggle: () => toggleHabitLog(h.id, today) })),
  ];
  return (
    <Frame accent="var(--c-project)">
      <Head icon={CheckCircle2} label={t('today.todo')} accent="var(--c-project)" />
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <CheckCircle2 size={22} className="text-habit" />
          <p className="text-[12px] text-ink-2 mt-1">{t('today.empty.title')}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto -mr-1 pr-1 divide-y divide-divider">
          {items.slice(0, limit).map((it) => (
            <button key={it.id} onClick={it.toggle} className="flex items-center gap-2.5 py-2 w-full text-left">
              <span className="h-5 w-5 rounded-full border-2 flex-shrink-0" style={{ borderColor: it.color }} />
              <span className="flex-1 text-[13px] text-ink truncate">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </Frame>
  );
}

// ---------------------------------------------------------------------------
// Module widgets
// ---------------------------------------------------------------------------
function ActivityRingsWidget() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const s = settings ?? defaultSettings();
  const rings = todayRings(workouts ?? [], s);
  return (
    <Frame to="/attivita" accent="var(--c-activity)">
      <Head icon={Activity} label={t('nav.activity')} accent="var(--c-activity)" />
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ActivityRings rings={ringsToData(rings)} size={92} stroke={10} />
      </div>
    </Frame>
  );
}

function WeightTrendWidget() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const logs = useLiveQuery(() => db.weightLogs.orderBy('date').toArray(), [], []);
  const s = settings ?? defaultSettings();
  const recent = (logs ?? []).slice(-30);
  const toUnit = (kg: number) => (s.body.unit === 'lb' ? kg * 2.20462 : kg);
  const points = recent.map((l) => ({ x: new Date(l.date).getTime(), y: Math.round(toUnit(l.weightKg) * 10) / 10 }));
  const last = points.length ? points[points.length - 1].y : null;
  return (
    <Frame to="/peso" accent="var(--c-project)">
      <Head icon={Scale} label={t('weight.current')} accent="var(--c-project)" />
      {points.length >= 2 ? (
        <>
          <div className="text-lg font-bold tnum text-ink leading-tight">{last} <span className="text-ink-3 text-xs font-semibold">{s.body.unit}</span></div>
          <div className="flex-1 min-h-0 -mx-1">
            <LineChart points={points} color="var(--c-project)" height={64} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center text-[12px] text-ink-3">{t('weight.empty.desc')}</div>
      )}
    </Frame>
  );
}

function HabitStreakWidget() {
  const t = useT();
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const best = Math.max(0, ...(habits ?? []).filter((h) => !h.archived).map((h) => currentStreak(h, logs ?? [])));
  return (
    <Frame to="/abitudini" accent="var(--c-habit)">
      <Head icon={Flame} label={t('today.stat.streak')} accent="var(--c-habit)" />
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-3xl font-bold tnum text-ink leading-none flex items-center gap-1">
          <Flame size={24} className="text-activity" />{best}
        </div>
        <div className="text-[12px] text-ink-2 mt-1">{t('today.unit.days')}</div>
      </div>
    </Frame>
  );
}

function ConsistencyHeatmapWidget() {
  const t = useT();
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const doneDays = new Set((logs ?? []).filter((l) => l.done && (habits ?? []).some((h) => h.id === l.habitId && isScheduled(h, l.date))).map((l) => l.date));
  const weeks = 10;
  const cells: { date: string; on: boolean }[] = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = todayISO(subDays(new Date(), i));
    cells.push({ date, on: doneDays.has(date) });
  }
  return (
    <Frame to="/abitudini" accent="var(--c-habit)">
      <Head icon={Flame} label={t('widget.consistency')} accent="var(--c-habit)" />
      <div className="flex-1 flex items-center min-h-0">
        <div className="grid grid-flow-col grid-rows-7 gap-[3px] w-full">
          {cells.map((c) => (
            <span
              key={c.date}
              className="rounded-[2px] aspect-square"
              style={{ background: c.on ? 'var(--c-habit)' : 'var(--c-divider)' }}
            />
          ))}
        </div>
      </div>
    </Frame>
  );
}

function UpcomingTasksWidget({ instance }: WidgetProps) {
  const t = useT();
  const today = todayISO();
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const upcoming = (tasks ?? [])
    .filter((tk) => tk.status !== 'done' && tk.dueDate && tk.dueDate > today)
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, instance.size === 'large' ? 6 : 3);
  return (
    <Frame to="/progetti" accent="var(--c-project)">
      <Head icon={ListTodo} label={t('today.upcoming')} accent="var(--c-project)" />
      {upcoming.length === 0 ? (
        <div className="flex-1 flex items-center text-[12px] text-ink-3">{t('today.empty.desc')}</div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y divide-divider">
          {upcoming.map((tk) => (
            <div key={tk.id} className="flex items-center gap-2 py-2">
              <ListTodo size={14} className="text-ink-3 flex-shrink-0" />
              <span className="flex-1 text-[13px] text-ink truncate">{tk.title}</span>
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
}

function FinanceBalanceWidget() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const txs = useLiveQuery(() => db.transactions.toArray(), [], []);
  const s = settings ?? defaultSettings();
  const monthStart = startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).getTime();
  const month = (txs ?? []).filter((tx) => new Date(tx.date).getTime() >= monthStart);
  const income = month.filter((tx) => tx.type === 'income').reduce((a, tx) => a + tx.amount, 0);
  const expense = month.filter((tx) => tx.type === 'expense').reduce((a, tx) => a + tx.amount, 0);
  const net = income - expense;
  return (
    <Frame to="/finanze" accent="var(--c-finance)">
      <Head icon={Wallet} label={t('finances.balance')} accent="var(--c-finance)" />
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className={cn('text-xl font-bold tnum leading-tight truncate', net >= 0 ? 'text-ink' : 'text-danger')}>
          {formatMoney(net, s.currency)}
        </div>
        <div className="text-[11px] text-ink-3 mt-1 truncate">−{formatMoney(expense, s.currency)} · +{formatMoney(income, s.currency)}</div>
      </div>
    </Frame>
  );
}

function JournalLastWidget() {
  const t = useT();
  const entries = useLiveQuery(() => db.journalEntries.orderBy('date').reverse().limit(1).toArray(), [], []);
  const last = entries?.[0];
  const MOOD = ['', '😞', '😕', '😐', '🙂', '😄'];
  return (
    <Frame to="/diario" accent="var(--c-journal)">
      <Head icon={BookHeart} label={t('nav.journal')} accent="var(--c-journal)" />
      {last ? (
        <div className="flex-1 min-h-0">
          <div className="text-2xl leading-none">{MOOD[last.mood]}</div>
          <p className="text-[13px] text-ink-2 mt-1.5 line-clamp-3">{last.text || longDate(new Date(last.date))}</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center text-[12px] text-ink-3">{t('today.empty.desc')}</div>
      )}
    </Frame>
  );
}

function GoalsProgressWidget() {
  const t = useT();
  const goals = useLiveQuery(() => db.goals.toArray(), [], []);
  const active = (goals ?? []).filter((g) => !g.done);
  const doneCount = (goals ?? []).length - active.length;
  return (
    <Frame to="/obiettivi" accent="var(--c-project)">
      <Head icon={Target} label={t('nav.goals')} accent="var(--c-project)" />
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-3xl font-bold tnum text-ink leading-none">{active.length}</div>
        <div className="text-[12px] text-ink-2 mt-1">{t('widget.goalsActive')}</div>
        {doneCount > 0 && <div className="text-[11px] text-habit mt-0.5">{t('widget.goalsDone', { n: doneCount })}</div>}
      </div>
    </Frame>
  );
}

function FastingWidget() {
  // Reuse the full, self-contained fasting card (start/stop + live timer).
  return (
    <div className="h-full [&>div]:h-full [&>div]:mb-0 [&>div]:flex [&>div]:flex-col [&>div]:justify-center">
      <FastingCard />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------
export interface WidgetDef {
  type: WidgetType;
  labelKey: TKey;
  module: ModuleId | 'core';
  sizes: WidgetSize[];
  icon: LucideIcon;
  accent: string;
  Component: FC<WidgetProps>;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDef> = {
  momentum: { type: 'momentum', labelKey: 'momentum.title', module: 'core', sizes: ['medium', 'large'], icon: Flame, accent: 'var(--c-habit)', Component: MomentumWidget },
  'quick-actions': { type: 'quick-actions', labelKey: 'widget.quickActions', module: 'core', sizes: ['medium'], icon: Plus, accent: 'var(--c-ink-2)', Component: QuickActionsWidget },
  affirmation: { type: 'affirmation', labelKey: 'widget.affirmation', module: 'core', sizes: ['medium', 'large'], icon: Quote, accent: 'var(--c-journal)', Component: AffirmationWidget },
  water: { type: 'water', labelKey: 'water.today', module: 'core', sizes: ['small', 'medium'], icon: Droplet, accent: '#0EA5E9', Component: WaterWidget },
  fasting: { type: 'fasting', labelKey: 'fast.title', module: 'core', sizes: ['medium', 'large'], icon: Timer, accent: 'var(--c-activity)', Component: FastingWidget },
  'daily-todo': { type: 'daily-todo', labelKey: 'today.todo', module: 'core', sizes: ['medium', 'large'], icon: CheckCircle2, accent: 'var(--c-project)', Component: DailyTodoWidget },
  rewards: { type: 'rewards', labelKey: 'rewards.level', module: 'core', sizes: ['small', 'medium'], icon: Trophy, accent: 'var(--c-habit)', Component: RewardsWidget },
  'activity-rings': { type: 'activity-rings', labelKey: 'nav.activity', module: 'attivita', sizes: ['small', 'medium', 'large'], icon: ChevronRight, accent: 'var(--c-activity)', Component: ActivityRingsWidget },
  'weight-trend': { type: 'weight-trend', labelKey: 'weight.current', module: 'peso', sizes: ['medium', 'large'], icon: Scale, accent: 'var(--c-project)', Component: WeightTrendWidget },
  'habit-streak': { type: 'habit-streak', labelKey: 'today.stat.streak', module: 'abitudini', sizes: ['small', 'medium'], icon: Flame, accent: 'var(--c-habit)', Component: HabitStreakWidget },
  'consistency-heatmap': { type: 'consistency-heatmap', labelKey: 'widget.consistency', module: 'abitudini', sizes: ['medium', 'large'], icon: Flame, accent: 'var(--c-habit)', Component: ConsistencyHeatmapWidget },
  'upcoming-tasks': { type: 'upcoming-tasks', labelKey: 'today.upcoming', module: 'progetti', sizes: ['medium', 'large'], icon: ListTodo, accent: 'var(--c-project)', Component: UpcomingTasksWidget },
  'finance-balance': { type: 'finance-balance', labelKey: 'finances.balance', module: 'finanze', sizes: ['small', 'medium'], icon: Wallet, accent: 'var(--c-finance)', Component: FinanceBalanceWidget },
  'journal-last': { type: 'journal-last', labelKey: 'nav.journal', module: 'diario', sizes: ['medium', 'large'], icon: BookHeart, accent: 'var(--c-journal)', Component: JournalLastWidget },
  'goals-progress': { type: 'goals-progress', labelKey: 'nav.goals', module: 'obiettivi', sizes: ['small', 'medium'], icon: Target, accent: 'var(--c-project)', Component: GoalsProgressWidget },
};

export const ALL_WIDGET_TYPES = Object.keys(WIDGET_REGISTRY) as WidgetType[];

void isDone; // (kept import surface stable)
