import { useNavigate } from 'react-router-dom';
import { CheckSquare, Flame, Dumbbell, BookHeart, Scale, Wallet, CalendarDays } from 'lucide-react';
import { Sheet } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { useIsPro } from '@/premium/premium';
import { useQuickAdd, type QuickAddTarget } from './QuickAdd';

const GOLD = '#C9A227';

const ACTIONS: { target: QuickAddTarget; labelKey: TKey; icon: typeof CheckSquare; accent: string }[] = [
  { target: 'task', labelKey: 'quick.task', icon: CheckSquare, accent: 'var(--c-project)' },
  { target: 'habit', labelKey: 'quick.habit', icon: Flame, accent: 'var(--c-habit)' },
  { target: 'workout', labelKey: 'quick.workout', icon: Dumbbell, accent: 'var(--c-activity)' },
  { target: 'weight', labelKey: 'quick.weight', icon: Scale, accent: 'var(--c-project)' },
  { target: 'journal', labelKey: 'quick.journal', icon: BookHeart, accent: 'var(--c-journal)' },
];

// Pro modules surfaced here for discovery: tapping routes to the module, which
// shows the paywall when the user isn't subscribed.
const PRO_LINKS: { to: string; labelKey: TKey; icon: typeof Wallet; accent: string }[] = [
  { to: '/finanze', labelKey: 'nav.finances', icon: Wallet, accent: 'var(--c-finance)' },
  { to: '/calendario', labelKey: 'nav.calendar', icon: CalendarDays, accent: 'var(--c-calendar-chip)' },
];

export function QuickAddMenu() {
  const { menuOpen, closeMenu, open } = useQuickAdd();
  const navigate = useNavigate();
  const isPro = useIsPro();
  const t = useT();

  function goPro(to: string) {
    closeMenu();
    navigate(to);
  }

  return (
    <Sheet open={menuOpen} onClose={closeMenu} title={t('quick.title')}>
      <div className="grid grid-cols-2 gap-3">
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

        {/* Pro discovery: Finance & Calendar (paywall when not subscribed) */}
        {PRO_LINKS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.to}
              onClick={() => goPro(a.to)}
              className="relative flex flex-col items-center gap-2 py-5 rounded-card bg-section active:bg-divider transition-colors"
            >
              {!isPro && (
                <span
                  className="absolute top-2 right-2 text-[9px] font-extrabold text-white px-2 py-0.5 rounded-full tracking-wide"
                  style={{ background: GOLD }}
                >
                  PRO
                </span>
              )}
              <span className="h-12 w-12 rounded-full bg-card shadow-card flex items-center justify-center" style={{ color: a.accent }}>
                <Icon size={22} />
              </span>
              <span className="text-[14px] font-medium text-ink">{t(a.labelKey)}</span>
            </button>
          );
        })}
      </div>
      <div className="pb-2" />
    </Sheet>
  );
}
