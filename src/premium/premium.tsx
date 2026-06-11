// ============================================================================
// Subscription gating (RevenueCat).
//
//   • If RevenueCat is NOT configured (no API key in config.ts) → the app stays
//     fully unlocked (UNLOCK_ALL_FOR_NOW). Shipping default for 1.2.
//   • If RevenueCat IS configured → `isPremium` reflects the real "pro"
//     entitlement; `requiresSubscription` drives the paywall gate, and
//     purchase()/restore() go through the store (7-day trial → €2,99/mo).
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  isBillingConfigured,
  isProActive,
  getProPackages,
  purchasePackage as billingPurchase,
  restorePurchases as billingRestore,
  onProChange,
  type ProPackage,
} from './billing';
import { HARD_PAYWALL } from './config';
import { ensureTrialStarted, isTrialActive, trialDaysLeft } from './trial';

export type PremiumFeature = 'finances' | 'goals' | 'calendar' | 'stats';

// While the paywall is not live (no API key), keep the app fully usable.
const UNLOCK_ALL_FOR_NOW = true;

const STORAGE_KEY = 'vita.premium';

interface PremiumCtx {
  isPremium: boolean;
  can: (feature: PremiumFeature) => boolean;
  /** True when the app must show the paywall (free week over + not subscribed). */
  requiresSubscription: boolean;
  /** True while the free week is still running (app usable, no paywall). */
  inTrial: boolean;
  /** Days left in the free week (0 once expired). */
  trialDaysLeft: number;
  /** True when RevenueCat is wired in this build. */
  billingActive: boolean;
  /** Available subscription packages (empty until billing is configured). */
  packages: ProPackage[];
  purchase: (pkg: ProPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  setPremium: (v: boolean) => void;
}

const Ctx = createContext<PremiumCtx | null>(null);

function loadPremium(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const billingActive = isBillingConfigured();
  const [premium, setPremiumState] = useState<boolean>(loadPremium);
  const [subActive, setSubActive] = useState<boolean>(false);
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const [billingReady, setBillingReady] = useState<boolean>(false);

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!billingActive) return;
    let mounted = true;
    ensureTrialStarted(); // start the free-week clock at first launch
    (async () => {
      const [active, pkgs] = await Promise.all([isProActive(), getProPackages()]);
      if (!mounted) return;
      setSubActive(active);
      setPackages(pkgs);
      setBillingReady(true);
    })();
    void onProChange((active) => mounted && setSubActive(active));
    return () => {
      mounted = false;
    };
  }, [billingActive]);

  const inTrial = billingActive && isTrialActive();
  const daysLeft = billingActive ? trialDaysLeft() : 0;
  // Full access during the free week OR with an active subscription.
  const isPremium = billingActive ? subActive || inTrial : UNLOCK_ALL_FOR_NOW || premium;
  // NO paywall at launch: gate only AFTER the free week, if not subscribed and a
  // purchasable package exists (fail open otherwise so the user is never trapped).
  const requiresSubscription =
    HARD_PAYWALL && billingActive && billingReady && !subActive && !inTrial && packages.length > 0;

  const purchase = useCallback(async (pkg: ProPackage) => {
    const ok = await billingPurchase(pkg);
    if (ok) setSubActive(true);
    return ok;
  }, []);

  const restore = useCallback(async () => {
    const ok = await billingRestore();
    setSubActive(ok);
    return ok;
  }, []);

  const value = useMemo<PremiumCtx>(
    () => ({
      isPremium,
      can: () => isPremium,
      requiresSubscription,
      inTrial,
      trialDaysLeft: daysLeft,
      billingActive,
      packages,
      purchase,
      restore,
      setPremium,
    }),
    [isPremium, requiresSubscription, inTrial, daysLeft, billingActive, packages, purchase, restore, setPremium],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
