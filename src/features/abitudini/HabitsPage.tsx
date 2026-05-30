import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Plus, Pencil } from 'lucide-react';
import { db } from '@/data/db';
import { toggleHabitLog } from '@/data/repo';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Checkbox, EmptyState, Button, IconButton } from '@/ui';
import { todayISO } from '@/lib/format';
import { HabitForm } from './HabitForm';
import { Heatmap } from './Heatmap';
import { bestStreak, completionRate, currentStreak, frequencyLabel, heatmapData, isDone } from './logic';
import type { Habit } from '@/data/types';

export function HabitsPage() {
  const habits = useLiveQuery(() => db.habits.orderBy('order').toArray(), [], []);
  const logs = useLiveQuery(() => db.habitLogs.toArray(), [], []);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayISO();

  const active = (habits ?? []).filter((h) => !h.archived);

  return (
    <>
      <PageHeader
        title="Abitudini"
        action={
          <Button size="sm" icon={<Plus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Nuova
          </Button>
        }
      />
      <Screen>
        {active.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Flame size={22} />}
              title="Nessuna abitudine"
              description="Crea la tua prima abitudine e inizia a costruire una streak."
              action={<Button onClick={() => setFormOpen(true)}>Nuova abitudine</Button>}
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
                <Card key={h.id}>
                  <div className="flex items-center gap-3">
                    <Checkbox checked={done} color={h.color} onChange={() => toggleHabitLog(h.id, today)} label={h.name} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-ink truncate">{h.name}</div>
                      <div className="text-[13px] text-ink-2">{frequencyLabel(h)}</div>
                    </div>
                    <div className="flex items-center gap-1 text-[13px] font-semibold tnum" style={{ color: h.color }}>
                      <Flame size={15} /> {streak}
                    </div>
                    <IconButton label="Modifica" onClick={() => { setEditing(h); setFormOpen(true); }}>
                      <Pencil size={15} />
                    </IconButton>
                  </div>

                  <div className="mt-3">
                    <Heatmap cells={heatmapData(h, logs ?? [])} color={h.color} />
                  </div>

                  <div className="flex gap-4 mt-3 pt-3 border-t border-divider">
                    <Stat label="Streak" value={streak} />
                    <Stat label="Record" value={best} />
                    <Stat label="Ultimi 30g" value={`${rate}%`} />
                  </div>
                </Card>
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
