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
  { target: 'weight', labelKey: 'quick.weight', icon: Scale, accent: 'var(--c-project)' },
  { target: 'journal', labelKey: 'quick.journal', icon: BookHeart, accent: 'var(--c-journal)' },
];

// Destinations that open a full page (not a quick sheet). Workout routes to the
// Activity page — live tracking, manual log AND Apple Health / Apple Watch sync.
// Pro modules show the paywall when the user isn't subscribed.
const NAV_LINKS: { to: string; labelKey: TKey; icon: typeof Wallet; accent: string; pro?: boolean }[] = [
  { to: '/attivita', labelKey: 'quick.workout', icon: Dumbbell, accent: 'var(--c-activity)' },
  { to: '/finanze', labelKey: 'nav.finances', icon: Wallet, accent: 'var(--c-finance)', pro: true },
  { to: '/calendario', labelKey: 'nav.calendar', icon: CalendarDays, accent: 'var(--c-calendar-chip)', pro: true },
];

export function QuickAddMenu() {
  const { menuOpen, closeMenu, open } = useQuickAdd();
  const navigate = useNavigate();
  const isPro = useIsPro();
  const t = useT();

  function go(to: string) {
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

        {/* Full-page destinations: Activity (Apple Watch) + Pro discovery */}
        {NAV_LINKS.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.to}
              onClick={() => go(a.to)}
              className="relative flex flex-col items-center gap-2 py-5 rounded-card bg-section active:bg-divider transition-colors"
            >
              {a.pro && !isPro && (
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
