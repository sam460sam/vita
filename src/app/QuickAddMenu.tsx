import { CheckSquare, Flame, Dumbbell, BookHeart } from 'lucide-react';
import { Sheet } from '@/ui';
import { useQuickAdd, type QuickAddTarget } from './QuickAdd';

const ACTIONS: { target: QuickAddTarget; label: string; icon: typeof CheckSquare; accent: string }[] = [
  { target: 'task', label: 'Nuova task', icon: CheckSquare, accent: 'var(--c-project)' },
  { target: 'habit', label: 'Nuova abitudine', icon: Flame, accent: 'var(--c-habit)' },
  { target: 'workout', label: 'Nuovo allenamento', icon: Dumbbell, accent: 'var(--c-activity)' },
  { target: 'journal', label: 'Nota diario', icon: BookHeart, accent: 'var(--c-journal)' },
];

export function QuickAddMenu() {
  const { menuOpen, closeMenu, open } = useQuickAdd();
  return (
    <Sheet open={menuOpen} onClose={closeMenu} title="Aggiungi">
      <div className="grid grid-cols-2 gap-3 pb-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.target}
              onClick={() => open(a.target)}
              className="flex flex-col items-center gap-2 py-5 rounded-card bg-section active:bg-divider transition-colors"
            >
              <span className="h-12 w-12 rounded-full bg-card shadow-card flex items-center justify-center" style={{ color: a.accent }}>
                <Icon size={22} />
              </span>
              <span className="text-[14px] font-medium text-ink">{a.label}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
