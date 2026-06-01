import { CheckSquare, Flame, Dumbbell, BookHeart, Scale } from 'lucide-react';
import { Sheet } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { useQuickAdd, type QuickAddTarget } from './QuickAdd';

const ACTIONS: { target: QuickAddTarget; labelKey: TKey; icon: typeof CheckSquare; accent: string }[] = [
  { target: 'task', labelKey: 'quick.task', icon: CheckSquare, accent: 'var(--c-project)' },
  { target: 'habit', labelKey: 'quick.habit', icon: Flame, accent: 'var(--c-habit)' },
  { target: 'workout', labelKey: 'quick.workout', icon: Dumbbell, accent: 'var(--c-activity)' },
  { target: 'weight', labelKey: 'quick.weight', icon: Scale, accent: 'var(--c-project)' },
  { target: 'journal', labelKey: 'quick.journal', icon: BookHeart, accent: 'var(--c-journal)' },
];

export function QuickAddMenu() {
  const { menuOpen, closeMenu, open } = useQuickAdd();
  const t = useT();
  return (
    <Sheet open={menuOpen} onClose={closeMenu} title={t('quick.title')}>
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
              <span className="text-[14px] font-medium text-ink">{t(a.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
