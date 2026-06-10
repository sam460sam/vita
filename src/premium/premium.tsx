// ============================================================================
// Subscription gating (Superwall).
//
//   • If Superwall is NOT configured (no API key in config.ts) → the app stays
//     fully unlocked (UNLOCK_ALL_FOR_NOW). This is the shipping default for 1.2.
//   • If Superwall IS configured → `isPremium` reflects the real subscription
//     status; `requiresSubscription` drives the hard paywall gate, and
//     `presentPaywall()` shows the Superwall paywall (7-day trial → €3,99/mo).
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isBillingConfigured, getSubscriptionActive, presentPaywall as swPresent, onStatusChange } from './billing';

/** Features that can be gated (kept for optional per-feature use). */
export type PremiumFeature = 'finances' | 'goals' | 'calendar' | 'stats';

// While the paywall is not live (no API key), keep the app fully usable.
const UNLOCK_ALL_FOR_NOW = true;

const STORAGE_KEY = 'vita.premium';

interface PremiumCtx {
  isPremium: boolean;
  can: (feature: PremiumFeature) => boolean;
  /** True when the app must show the paywall (billing on + no active subscription). */
  requiresSubscription: boolean;
  /** True when Superwall is wired in this build. */
  billingActive: boolean;
  /** Present the Superwall paywall. */
  presentPaywall: () => Promise<void>;
  /** Dev/local toggle until billing is live. */
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

  const setPremium = useCallback((v: boolean) => {
    setPremiumState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  // Resolve the real subscription status when Superwall is configured.
  useEffect(() => {
    if (!billingActive) return;
    let mounted = true;
    void getSubscriptionActive().then((active) => mounted && setSubActive(active));
    void onStatusChange((active) => mounted && setSubActive(active));
    return () => {
      mounted = false;
    };
  }, [billingActive]);

  // The 7-day free trial is the App Store introductory offer (tracked per Apple
  // ID, so reinstalling can't get a new one). During the trial the subscription
  // is active, so `subActive` already covers it.
  const isPremium = billingActive ? subActive : UNLOCK_ALL_FOR_NOW || premium;
  const requiresSubscription = billingActive && !subActive;

  const presentPaywall = useCallback(async () => {
    await swPresent();
  }, []);

  const value = useMemo<PremiumCtx>(
    () => ({
      isPremium,
      can: () => isPremium,
      requiresSubscription,
      billingActive,
      presentPaywall,
      setPremium,
    }),
    [isPremium, requiresSubscription, billingActive, presentPaywall, setPremium],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
