import { useQuickAdd } from './QuickAdd';
import { QuickAddMenu } from './QuickAddMenu';
import { TaskForm } from '@/features/progetti';
import { HabitForm } from '@/features/abitudini';
import { WorkoutForm } from '@/features/attivita';
import { JournalForm } from '@/features/diario';

/** Globally-mounted create sheets driven by the quick-add FAB/menu. */
export function GlobalSheets() {
  const { target, close } = useQuickAdd();
  return (
    <>
      <QuickAddMenu />
      <TaskForm open={target === 'task'} onClose={close} />
      <HabitForm open={target === 'habit'} onClose={close} />
      <WorkoutForm open={target === 'workout'} onClose={close} />
      <JournalForm open={target === 'journal'} onClose={close} />
    </>
  );
}
