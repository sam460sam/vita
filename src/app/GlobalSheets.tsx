import { useLiveQuery } from 'dexie-react-hooks';
import { useQuickAdd } from './QuickAdd';
import { QuickAddMenu } from './QuickAddMenu';
import { TaskForm } from '@/features/progetti';
import { HabitForm } from '@/features/abitudini';
import { WorkoutForm } from '@/features/attivita';
import { JournalForm } from '@/features/diario';
import { WeightForm } from '@/features/peso';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';

/** Globally-mounted create sheets driven by the quick-add FAB/menu. */
export function GlobalSheets() {
  const { target, close } = useQuickAdd();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  return (
    <>
      <QuickAddMenu />
      <TaskForm open={target === 'task'} onClose={close} />
      <HabitForm open={target === 'habit'} onClose={close} />
      <WorkoutForm open={target === 'workout'} onClose={close} />
      <JournalForm open={target === 'journal'} onClose={close} />
      <WeightForm open={target === 'weight'} onClose={close} settings={settings ?? defaultSettings()} />
    </>
  );
}
