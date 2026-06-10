// ============================================================================
// Premium / subscription gating.
//
//   • If RevenueCat is NOT configured (no API key in config.ts) → the app stays
//     fully unlocked (UNLOCK_ALL_FOR_NOW) and the Pro page shows "coming soon".
//     This is the shipping default for 1.2.
//   • If RevenueCat IS configured → `isPremium` reflects the real "pro"
//     entitlement, and purchase/restore go through the store.
// The rest of the app (gating with `can()`, the Pro page) doesn't change.
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

/** Features that can be gated behind Pro. */
export type PremiumFeature = 'finances' | 'goals' | 'calendar' | 'stats';

// While subscriptions are not live (no API key), keep the app fully usable.
const UNLOCK_ALL_FOR_NOW = true;

const STORAGE_KEY = 'vita.premium';

interface PremiumCtx {
  isPremium: boolean;
  /** True if the given feature is currently accessible. */
  can: (feature: PremiumFeature) => boolean;
  /** True when real billing (RevenueCat) is wired in this build. */
  billingActive: boolean;
  /** Available subscription packages (empty until billing is configured). */
  packages: ProPackage[];
  /** Start a purchase; resolves true if Pro becomes active. */
  purchase: (pkg: ProPackage) => Promise<boolean>;
  /** Restore purchases; resolves true if Pro becomes active. */
  restore: () => Promise<boolean>;
  /** Dev/local toggle until real billing exists. */
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
  const [proActive, setProActive] = useState<boolean>(false);
  const [packages, setPackages] = useState<ProPackage[]>([]);

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  // Resolve the real entitlement + offerings when billing is configured.
  useEffect(() => {
    if (!billingActive) return;
    let mounted = true;
    (async () => {
      const [active, pkgs] = await Promise.all([isProActive(), getProPackages()]);
      if (!mounted) return;
      setProActive(active);
      setPackages(pkgs);
    })();
    void onProChange((active) => mounted && setProActive(active));
    return () => {
      mounted = false;
    };
  }, [billingActive]);

  const isPremium = billingActive ? proActive : UNLOCK_ALL_FOR_NOW || premium;

  const purchase = useCallback(async (pkg: ProPackage) => {
    const ok = await billingPurchase(pkg);
    if (ok) setProActive(true);
    return ok;
  }, []);

  const restore = useCallback(async () => {
    const ok = await billingRestore();
    setProActive(ok);
    return ok;
  }, []);

  const value = useMemo<PremiumCtx>(
    () => ({
      isPremium,
      can: () => isPremium, // per-feature granularity ready if needed later
      billingActive,
      packages,
      purchase,
      restore,
      setPremium,
    }),
    [isPremium, billingActive, packages, purchase, restore, setPremium],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
