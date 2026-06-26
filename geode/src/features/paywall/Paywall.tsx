// ============================================================================
// Paywall (BUILD-SPEC §3) — App Store 2026 compliant.
//  • The CHARGED PRICE is the most prominent element; trial / per-day are
//    subordinate in size and position.
//  • NO toggle that hides the free trial by default.
//  • Honest copy + neutral "Continue" CTA.
//  • Terms (EULA), Privacy Policy and Restore are all visible here.
//  • At most ONE honest fallback offer when the user tries to leave.
// ============================================================================
import { useEffect, useState } from 'react';
import { Check, X, Sparkles, Infinity as InfinityIcon, ScanLine, Gem } from 'lucide-react';
import { Button, Spinner } from '@/ui';
import { cn } from '@/lib/cn';
import { CONFIG } from '@/lib/config';
import { purchases, type Offerings, type PriceInfo } from '@/platform/purchases';
import { useToast } from '@/ui';

type PlanKey = 'annual' | 'weekly' | 'lifetime';

const BENEFITS = [
  { icon: <ScanLine size={17} />, text: 'Unlimited identifications' },
  { icon: <Sparkles size={17} />, text: 'Unlimited “refine the result”' },
  { icon: <Gem size={17} />, text: 'Full meanings & value estimates' },
  { icon: <InfinityIcon size={17} />, text: 'Export your whole collection' },
];

export function Paywall({
  onClose,
  onPurchased,
}: {
  onClose: () => void;
  onPurchased: () => void;
}) {
  const toast = useToast();
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [plan, setPlan] = useState<PlanKey>('annual');
  const [busy, setBusy] = useState(false);
  const [fallbackShown, setFallbackShown] = useState(false);

  useEffect(() => {
    void purchases.getOfferings().then(setOfferings);
  }, []);

  const plans: { key: PlanKey; info?: PriceInfo }[] = [
    { key: 'annual', info: offerings?.annual },
    { key: 'weekly', info: offerings?.weekly },
    { key: 'lifetime', info: offerings?.lifetime },
  ].filter((p) => p.info) as { key: PlanKey; info: PriceInfo }[];

  const selected = plans.find((p) => p.key === plan)?.info ?? offerings?.annual;

  const purchase = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      const ok = await purchases.purchase(selected.packageId);
      if (ok) {
        toast.show('You’re Pro — enjoy! ✨');
        onPurchased();
      }
    } catch {
      toast.show('Purchase could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const ok = await purchases.restore();
      toast.show(ok ? 'Purchases restored' : 'No purchases found to restore');
      if (ok) onPurchased();
    } finally {
      setBusy(false);
    }
  };

  // Honest single fallback: nudge annual once, then actually close.
  const handleClose = () => {
    if (!fallbackShown && offerings?.annual && plan !== 'annual') {
      setFallbackShown(true);
      setPlan('annual');
      toast.show('Tip: Annual is the best value');
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-app animate-fade-in">
      {/* glow header */}
      <div className="relative px-5 pt-[max(16px,env(safe-area-inset-top))]">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-ink-2 hover:bg-white/10"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="mb-6 mt-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-amethyst text-white shadow-glow">
            <Gem size={30} />
          </div>
          <h1 className="text-[26px] font-bold leading-tight text-ink">Geode Pro</h1>
          <p className="mx-auto mt-1 max-w-xs text-[15px] text-ink-2">
            Identify without limits and unlock every detail.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-6 grid grid-cols-1 gap-2">
          {BENEFITS.map((b) => (
            <div key={b.text} className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3.5 py-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amethyst/15 text-amethyst">
                {b.icon}
              </span>
              <span className="text-[14px] font-medium text-ink">{b.text}</span>
              <Check size={16} className="ml-auto text-success" />
            </div>
          ))}
        </div>

        {/* Plans */}
        {!offerings ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(({ key, info }) => (
              <PlanCard key={key} info={info!} active={plan === key} onSelect={() => setPlan(key)} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky CTA + legal */}
      <div className="border-t border-line bg-section/80 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        {selected && (
          <p className="mb-2.5 text-center text-[12px] leading-snug text-ink-3">
            {disclosureFor(selected)}
          </p>
        )}
        {/* Neutral CTA (NOT "Start free trial") */}
        <Button block size="lg" loading={busy} onClick={purchase} disabled={!selected}>
          Continue
        </Button>
        <div className="mt-2.5 flex items-center justify-center gap-4 text-[12px] text-ink-3">
          <button onClick={restore} className="hover:text-ink-2">
            Restore purchases
          </button>
          <span aria-hidden>·</span>
          <a href={CONFIG.termsUrl} target="_blank" rel="noreferrer" className="hover:text-ink-2">
            Terms (EULA)
          </a>
          <span aria-hidden>·</span>
          <a href={CONFIG.privacyUrl} target="_blank" rel="noreferrer" className="hover:text-ink-2">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Plan card. The CHARGED PRICE is the largest, highest-contrast element. The
 * trial line + per-period helper are intentionally smaller and below it.
 */
function PlanCard({ info, active, onSelect }: { info: PriceInfo; active: boolean; onSelect: () => void }) {
  const label = info.period === 'annual' ? 'Annual' : info.period === 'weekly' ? 'Weekly' : 'Lifetime';
  const charged =
    info.period === 'annual'
      ? `${info.priceString}/year`
      : info.period === 'weekly'
        ? `${info.priceString}/week`
        : info.priceString;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
        active ? 'border-amethyst bg-amethyst/[0.08] ring-1 ring-amethyst/40' : 'border-line bg-white/[0.02]',
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          active ? 'border-amethyst bg-amethyst text-white' : 'border-white/20',
        )}
      >
        {active && <Check size={14} />}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-ink">{label}</span>
          {info.period === 'annual' && (
            <span className="whitespace-nowrap rounded-pill bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
              Best value · ~88% off
            </span>
          )}
        </div>
        {/* subordinate helper line */}
        <div className="mt-0.5 text-[12px] text-ink-3">
          {info.hasTrial ? `${info.trialDays}-day free trial, then ` : ''}
          {info.title && info.title !== 'one-time' ? info.title : info.period === 'lifetime' ? 'one-time payment' : ''}
        </div>
      </div>

      {/* PROMINENT charged price */}
      <div className="shrink-0 pl-2 text-right">
        <div className="text-[19px] font-extrabold leading-none text-ink">{charged}</div>
      </div>
    </button>
  );
}

function disclosureFor(info: PriceInfo): string {
  if (info.period === 'lifetime') {
    return `${info.priceString} one-time payment. Lifetime access, no subscription.`;
  }
  const per = info.period === 'annual' ? 'year' : 'week';
  if (info.hasTrial) {
    return `${info.trialDays} days free, then ${info.priceString}/${per}. Auto-renews until you cancel in Settings. Cancel anytime.`;
  }
  return `${info.priceString}/${per}, billed now. Auto-renews until you cancel in Settings. Cancel anytime.`;
}
