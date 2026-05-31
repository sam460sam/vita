import { useEffect, useState } from 'react';
import { Sheet, Button, Field, Input, Segmented, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import { createHabit, updateHabit, deleteHabit } from '@/data/repo';
import { notifications } from '@/platform/notifications';
import type { Habit, HabitFrequencyType } from '@/data/types';
import { useT } from '@/i18n';

const COLORS = ['#10B981', '#FF6B57', '#4F46E5', '#F59E0B', '#7C3AED', '#0EA5E9', '#EC4899', '#0A0A0C'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

export function HabitForm({
  open,
  onClose,
  habit,
}: {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
}) {
  const editing = !!habit;
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [freqType, setFreqType] = useState<HabitFrequencyType>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState('3');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminder, setReminder] = useState('');
  const toast = useToast();
  const t = useT();

  useEffect(() => {
    if (open) {
      setName(habit?.name ?? '');
      setColor(habit?.color ?? COLORS[0]);
      setFreqType(habit?.frequency.type ?? 'daily');
      setTimesPerWeek(String(habit?.frequency.timesPerWeek ?? 3));
      setDays(habit?.frequency.days ?? [1, 2, 3, 4, 5]);
      setReminder(habit?.reminder ?? '');
    }
  }, [open, habit]);

  async function save() {
    if (!name.trim()) return;
    const frequency = {
      type: freqType,
      timesPerWeek: freqType === 'times_per_week' ? parseInt(timesPerWeek) || 3 : undefined,
      days: freqType === 'specific_days' ? days : undefined,
    };
    let habitId: string;
    if (editing && habit) {
      await updateHabit(habit.id, { name: name.trim(), color, frequency, reminder: reminder || undefined });
      habitId = habit.id;
      toast.show(t('habitForm.updated'));
    } else {
      const created = await createHabit({ name: name.trim(), color, frequency, reminder: reminder || undefined });
      habitId = created.id;
      toast.show(t('habitForm.created'));
    }
    // Schedule/cancel the native reminder (no-op on web).
    if (reminder && notifications.supported()) await notifications.requestPermission();
    await notifications.scheduleHabitReminder(habitId, name.trim(), reminder || undefined);
    onClose();
  }

  async function remove() {
    if (habit) {
      await notifications.cancelHabitReminder(habit.id);
      await deleteHabit(habit.id);
      toast.show(t('habitForm.deleted'));
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={editing ? t('habitForm.edit') : t('habitForm.new')}
      footer={
        <div className="flex gap-2">
          {editing && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!name.trim()}>
            {editing ? t('common.save') : t('habitForm.create')}
          </Button>
        </div>
      }
    >
      <Field label={t('habitForm.name')}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('habitForm.namePh')} />
      </Field>

      <Field label={t('habitForm.color')}>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Colore ${c}`}
              className={cn('h-8 w-8 rounded-full transition-transform', color === c && 'ring-2 ring-offset-2 ring-ink scale-110')}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>

      <Field label={t('habitForm.frequency')}>
        <Segmented
          value={freqType}
          onChange={setFreqType}
          options={[
            { value: 'daily', label: t('habitForm.freq.daily') },
            { value: 'times_per_week', label: t('habitForm.freq.timesPerWeek') },
            { value: 'specific_days', label: t('habitForm.freq.days') },
          ]}
        />
      </Field>

      {freqType === 'times_per_week' && (
        <Field label={t('habitForm.timesPerWeek')}>
          <Input type="number" inputMode="numeric" min={1} max={7} value={timesPerWeek} onChange={(e) => setTimesPerWeek(e.target.value)} />
        </Field>
      )}

      {freqType === 'specific_days' && (
        <Field label={t('habitForm.days')}>
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => setDays((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))}
                className={cn(
                  'flex-1 h-10 rounded-btn text-[12px] font-semibold transition-colors',
                  days.includes(i) ? 'bg-ink text-white' : 'bg-section text-ink-2',
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label={t('habitForm.reminder')}>
        <Input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
        <p className="text-[12px] text-ink-3 mt-1.5">{t('habitForm.reminderNote')}</p>
      </Field>
    </Sheet>
  );
}
