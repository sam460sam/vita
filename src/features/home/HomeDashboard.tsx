import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Check, X, Pencil, LayoutGrid, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Button, Sheet, Segmented } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { cn } from '@/lib/cn';
import { uid } from '@/data/db';
import { readSettings, saveHomeLayout } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { longDate } from '@/lib/format';
import type { WidgetInstance, WidgetSize, WidgetType } from '@/data/types';
import { useLiveQuery } from 'dexie-react-hooks';
import { subDays } from 'date-fns';
import { todayISO } from '@/lib/format';
import { db } from '@/data/db';
import { computeMomentum, getStreakState } from '@/features/oggi/momentum';
import { dayPoints, type LifeData } from '@/features/gamification/logic';
import { DailyWin } from '@/features/oggi/DailyWin';
import { useHomeWidgets, useModules } from '@/features/personalizzazione/prefs';
import { WIDGET_REGISTRY, ALL_WIDGET_TYPES } from './widgets/registry';

const WIN_KEY = 'vita.dailywin.shown';

const SIZE_CLASS: Record<WidgetSize, string> = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large: 'col-span-2 row-span-2',
};

export function HomeDashboard() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const { widgets: liveWidgets } = useHomeWidgets();
  const { enabled } = useModules();
  const s = settings ?? defaultSettings();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<WidgetInstance[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [params, setParams] = useSearchParams();

  // Deep-link from Settings → "Edit home widgets".
  useEffect(() => {
    if (params.get('edit') === '1' && !editing) {
      enterEdit();
      params.delete('edit');
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // --- Daily Win celebration (once per day when the day is going great) ----
  const habits = useLiveQuery(() => db.habits.toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], []);
  const workouts = useLiveQuery(() => db.workouts.toArray(), [], []);
  const waters = useLiveQuery(() => db.waterLogs.toArray(), [], []);
  const journals = useLiveQuery(() => db.journalEntries.toArray(), [], []);
  const weights = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const todayWater = useLiveQuery(() => db.waterLogs.get(todayISO()), [], undefined);
  const [win, setWin] = useState<{ streak: number; today: number; yesterday: number } | null>(null);
  const today = todayISO();
  const momentumScore = computeMomentum(s, habits ?? [], logs ?? [], tasks ?? [], workouts ?? [], todayWater, journals ?? []).score;
  useEffect(() => {
    if (momentumScore < 70 || editing) return;
    let shown = '';
    try {
      shown = localStorage.getItem(WIN_KEY) ?? '';
    } catch {
      /* ignore */
    }
    if (shown === today) return;
    const d: LifeData = { settings: s, habits: habits ?? [], logs: logs ?? [], tasks: tasks ?? [], workouts: workouts ?? [], waters: waters ?? [], journals: journals ?? [], weights: weights ?? [] };
    setWin({ streak: getStreakState().count, today: dayPoints(d, today), yesterday: dayPoints(d, todayISO(subDays(new Date(), 1))) });
  }, [momentumScore, today, editing, s, habits, logs, tasks, workouts, waters, journals, weights]);
  function closeWin() {
    try {
      localStorage.setItem(WIN_KEY, today);
    } catch {
      /* ignore */
    }
    setWin(null);
  }

  // Source of truth: live widgets when viewing, the local draft when editing.
  const widgets = editing ? draft : liveWidgets;

  function enterEdit() {
    setDraft(liveWidgets.map((w, i) => ({ ...w, position: i })));
    setEditing(true);
  }
  async function doneEdit() {
    await saveHomeLayout(draft);
    setEditing(false);
    setGalleryOpen(false);
  }

  function removeWidget(id: string) {
    setDraft((ws) => ws.filter((w) => w.id !== id).map((w, i) => ({ ...w, position: i })));
  }
  function addWidget(type: WidgetType, size: WidgetSize) {
    setDraft((ws) => [...ws, { id: uid('w'), type, size, position: ws.length }]);
    setGalleryOpen(false);
  }

  // --- Pointer drag reorder (dependency-free, touch + mouse) ---------------
  function reorder(fromId: string, toId: string) {
    setDraft((ws) => {
      const from = ws.findIndex((w) => w.id === fromId);
      const to = ws.findIndex((w) => w.id === toId);
      if (from < 0 || to < 0 || from === to) return ws;
      const arr = [...ws];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr.map((w, i) => ({ ...w, position: i }));
    });
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragId) return;
    const stack = document.elementsFromPoint(e.clientX, e.clientY);
    const overEl = stack.find((el) => el instanceof HTMLElement && el.dataset.wid && el.dataset.wid !== dragId) as HTMLElement | undefined;
    const overId = overEl?.dataset.wid;
    if (overId) reorder(dragId, overId);
  }
  function endDrag() {
    setDragId(null);
  }

  const greeting = greetByHour(s.name, t);

  return (
    <>
      <PageHeader
        title={editing ? t('home.editTitle') : greeting}
        subtitle={editing ? t('home.editHint') : longDate()}
        hideStella={editing}
        action={
          editing ? (
            <div className="flex items-center gap-1">
              <button onClick={() => setGalleryOpen(true)} aria-label={t('home.addWidget')} className="h-9 w-9 rounded-full bg-section flex items-center justify-center text-ink active:bg-divider">
                <Plus size={20} />
              </button>
              <Button size="sm" onClick={doneEdit}>{t('home.done')}</Button>
            </div>
          ) : (
            <button onClick={enterEdit} aria-label={t('home.edit')} className="h-9 w-9 rounded-full hover:bg-section flex items-center justify-center text-ink-2">
              <Pencil size={18} />
            </button>
          )
        }
      />
      <Screen>
        {widgets.length === 0 ? (
          <button
            onClick={editing ? () => setGalleryOpen(true) : enterEdit}
            className="w-full rounded-card border-2 border-dashed border-line py-12 flex flex-col items-center gap-3 text-ink-3 active:bg-section"
          >
            <LayoutGrid size={32} />
            <span className="text-[15px] font-semibold text-ink-2">{t('home.empty')}</span>
            <span className="inline-flex items-center gap-1 text-[13px] text-project font-semibold"><Plus size={15} /> {t('home.addWidget')}</span>
          </button>
        ) : (
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[148px]"
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onPointerLeave={endDrag}
          >
            {widgets.map((w) => {
              const def = WIDGET_REGISTRY[w.type];
              if (!def) return null;
              const moduleOff = def.module !== 'core' && !enabled.includes(def.module);
              // In view mode, hide widgets for disabled modules entirely.
              if (moduleOff && !editing) return null;
              const Comp = def.Component;
              return (
                <div
                  key={w.id}
                  data-wid={w.id}
                  className={cn(
                    SIZE_CLASS[w.size],
                    'relative',
                    editing && 'touch-none animate-wiggle',
                    dragId === w.id && 'opacity-60 scale-105 z-20',
                  )}
                  onPointerDown={editing ? () => setDragId(w.id) : undefined}
                >
                  {moduleOff ? (
                    <div className="h-full w-full rounded-card border border-dashed border-line flex flex-col items-center justify-center gap-1 text-ink-3 p-2 text-center">
                      <AlertCircle size={18} />
                      <span className="text-[11px]">{t('home.widgetUnavailable')}</span>
                    </div>
                  ) : (
                    <div className={cn(editing && 'pointer-events-none select-none')}>
                      <Comp instance={w} />
                    </div>
                  )}

                  {editing && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeWidget(w.id)}
                      aria-label={t('home.removeWidget')}
                      className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-ink text-app flex items-center justify-center shadow-card z-30"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      <WidgetGallery open={galleryOpen} onClose={() => setGalleryOpen(false)} onAdd={addWidget} enabled={enabled} />
      {win && <DailyWin streak={win.streak} pointsToday={win.today} pointsYesterday={win.yesterday} onClose={closeWin} />}
    </>
  );
}

function WidgetGallery({
  open,
  onClose,
  onAdd,
  enabled,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType, size: WidgetSize) => void;
  enabled: ReturnType<typeof useModules>['enabled'];
}) {
  const t = useT();
  const [picked, setPicked] = useState<WidgetType | null>(null);
  const [size, setSize] = useState<WidgetSize>('medium');

  useEffect(() => {
    if (!open) {
      setPicked(null);
      setSize('medium');
    }
  }, [open]);

  // Only widgets whose module is enabled (+ core).
  const available = ALL_WIDGET_TYPES.filter((tp) => {
    const def = WIDGET_REGISTRY[tp];
    return def.module === 'core' || enabled.includes(def.module);
  });

  const pickedDef = picked ? WIDGET_REGISTRY[picked] : null;
  const sizeOpts: { value: WidgetSize; label: string }[] = (pickedDef?.sizes ?? ['small', 'medium', 'large']).map((sz) => ({
    value: sz,
    label: t(`home.size.${sz}` as TKey),
  }));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('home.gallery')}
      size="full"
      footer={
        picked ? (
          <Button block size="lg" onClick={() => onAdd(picked, sizeOpts.some((o) => o.value === size) ? size : sizeOpts[0].value)}>
            {t('home.addThis')}
          </Button>
        ) : undefined
      }
    >
      {picked && pickedDef && (
        <div className="mb-4">
          <div className="text-[13px] font-semibold text-ink-2 mb-1.5">{t('home.size.label')}</div>
          <Segmented
            value={sizeOpts.some((o) => o.value === size) ? size : sizeOpts[0].value}
            onChange={(v) => setSize(v as WidgetSize)}
            options={sizeOpts}
          />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {available.map((tp) => {
          const def = WIDGET_REGISTRY[tp];
          const Icon = def.icon;
          const on = picked === tp;
          return (
            <button
              key={tp}
              onClick={() => {
                setPicked(tp);
                setSize(def.sizes.includes('medium') ? 'medium' : def.sizes[0]);
              }}
              className={cn(
                'rounded-card border p-3.5 flex flex-col items-start gap-2 text-left transition-colors',
                on ? 'border-ink bg-section' : 'border-line dark:border-transparent dark:bg-section',
              )}
            >
              <span className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: `${def.accent}1a`, color: def.accent }}>
                <Icon size={18} />
              </span>
              <span className="text-[14px] font-semibold text-ink">{t(def.labelKey)}</span>
              {on && <Check size={16} className="text-ink absolute" style={{ alignSelf: 'flex-end' }} />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function greetByHour(name: string, t: (k: TKey) => string): string {
  const h = new Date().getHours();
  const base = t(h < 12 ? 'greet.morning' : h < 18 ? 'greet.afternoon' : 'greet.evening');
  return name ? `${base}, ${name}` : base;
}
