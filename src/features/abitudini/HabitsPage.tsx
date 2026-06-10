import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Plus, Pencil } from 'lucide-react';
import { db } from '@/data/db';
import { toggleHabitLog } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, EmptyState, Button, IconButton, IconChip, Icon, StreakBadge, CheckBadge, DateStrip } from '@/ui';
import { tint } from '@/lib/color';
import { todayISO } from '@/lib/format';
import { HabitForm } from './HabitForm';
import { Heatmap } from './Heatmap';
import { bestStreak, completionRate, currentStreak, frequencyLabel, heatmapData, isDone } from './logic';
import type { Habit } from '@/data/types';
import { useT } from '@/i18n';

export function HabitsPage() {
  const t = useT();
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayISO();

  const active = (habits ?? []).filter((h) => !h.archived);
  const markedDays = new Set((logs ?? []).filter((l) => l.done).map((l) => l.date));

  return (
    <>
      <PageHeader
        title={t('habits.title')}
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            {t('habits.new')}
          </Button>
        }
      />
      <Screen>
        {active.length > 0 && (
          <Card className="mb-3" inset={false}>
            <div className="px-3 py-2.5">
              <DateStrip selected={today} marked={markedDays} />
            </div>
          </Card>
        )}
        {active.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Flame size={22} />}
              title={t('habits.empty.title')}
              description={t('habits.empty.desc')}
              action={<Button onClick={() => setFormOpen(true)}>{t('habits.empty.cta')}</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {active.map((h) => {
              const done = isDone(logs ?? [], h.id, today);
              const streak = currentStreak(h, logs ?? []);
              const best = bestStreak(h, logs ?? []);
              const rate = Math.round(completionRate(h, logs ?? []) * 100);
              return (
                <div
                  key={h.id}
                  className="rounded-card p-3.5 shadow-card"
                  style={{ backgroundColor: tint(h.color) }}
                >
                  <div className="flex items-center gap-3">
                    <IconChip color={h.color} size="md">
                      <Icon name={h.icon} size={20} strokeWidth={2.25} />
                    </IconChip>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-bold text-ink truncate">{h.name}</div>
                      <div className="text-[13px] text-ink-2">{frequencyLabel(h, t)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      {streak > 0 && <StreakBadge count={streak} />}
                      <CheckBadge done={done} onClick={() => toggleHabitLog(h.id, today)} label={h.name} />
                    </div>
                  </div>

                  <div className="mt-3">
                    <Heatmap cells={heatmapData(h, logs ?? [])} color={h.color} />
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <Stat label={t('habits.stat.streak')} value={streak} />
                    <Stat label={t('habits.stat.record')} value={best} />
                    <Stat label={t('habits.stat.last30')} value={`${rate}%`} />
                    <IconButton label={t('common.edit')} onClick={() => { setEditing(h); setFormOpen(true); }} className="ml-auto -mr-1">
                      <Pencil size={15} />
                    </IconButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Screen>

      <HabitForm open={formOpen} onClose={() => setFormOpen(false)} habit={editing} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex-1">
      <div className="text-base font-semibold tnum text-ink">{value}</div>
      <div className="metric-label mt-0.5">{label}</div>
    </div>
  );
}
