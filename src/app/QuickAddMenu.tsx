import { useNavigate } from 'react-router-dom';
import { Droplet, BookHeart, Wallet, CalendarDays } from 'lucide-react';
import { Sheet } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { useIsPro } from '@/premium/premium';
import { useQuickAdd, type QuickAddTarget } from './QuickAdd';

const GOLD = '#C9A227';

// Quick-create sheets. Tasks now live inside Journal, and weight inside the
// Workout/Activity page, so only the journal note opens a quick sheet here.
const ACTIONS: { target: QuickAddTarget; labelKey: TKey; icon: typeof BookHeart; accent: string }[] = [
  { target: 'journal', labelKey: 'quick.journal', icon: BookHeart, accent: 'var(--c-journal)' },
];

// Destinations that open a full page (not a quick sheet). Water, Finances and
// Calendar are Pro modules — they show the paywall when the user isn't subscribed.
const NAV_LINKS: { to: string; labelKey: TKey; icon: typeof Wallet; accent: string; pro?: boolean }[] = [
  { to: '/acqua', labelKey: 'nav.water', icon: Droplet, accent: 'var(--c-water)', pro: true },
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
