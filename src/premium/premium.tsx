// ============================================================================
// Premium / subscription gating (BUILD-SPEC: monetization).
// Architecture is ready for RevenueCat (or App Store / Play billing) but no
// real payment is wired yet — everything is unlocked for now via `unlockAll`.
// When billing is added, replace `isPremium` resolution with the entitlement
// from the store; the rest of the app (gating, Pro page) stays the same.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/** Features that can be gated behind Pro. */
export type PremiumFeature = 'finances' | 'goals' | 'calendar' | 'stats';

// While subscriptions are not live, keep the app fully usable.
const UNLOCK_ALL_FOR_NOW = true;

const STORAGE_KEY = 'vita.premium';

interface PremiumCtx {
  isPremium: boolean;
  /** True if the given feature is currently accessible. */
  can: (feature: PremiumFeature) => boolean;
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
  const [premium, setPremiumState] = useState<boolean>(loadPremium);

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    // Placeholder for future RevenueCat entitlement check on startup.
  }, []);

  const isPremium = UNLOCK_ALL_FOR_NOW || premium;

  const value = useMemo<PremiumCtx>(
    () => ({
      isPremium,
      can: () => isPremium, // per-feature granularity ready if needed later
      setPremium,
    }),
    [isPremium, setPremium],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
