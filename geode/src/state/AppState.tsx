// ============================================================================
// Central app state — consent, onboarding, Pro entitlement and the free-scan
// counter. One context so screens can gate features without prop-drilling.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CONFIG } from '@/lib/config';
import { consent } from '@/platform/consent';
import { purchases } from '@/platform/purchases';
import { counterRepo } from '@/data/repo';

interface AppStateValue {
  ready: boolean;
  onboarded: boolean;
  aiConsent: boolean;
  isPro: boolean;
  scansUsed: number;
  freeScansLeft: number;
  /** True when the user can run another scan without hitting the paywall. */
  canScan: boolean;
  completeOnboarding: () => Promise<void>;
  grantAiConsent: () => Promise<void>;
  registerScan: () => Promise<void>;
  setPro: (v: boolean) => void;
  refresh: () => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [scansUsed, setScansUsed] = useState(0);

  const refresh = useCallback(async () => {
    const [ob, ai, pro, used] = await Promise.all([
      consent.hasOnboarded(),
      consent.hasAiConsent(),
      purchases.isPro(),
      counterRepo.scansUsed(),
    ]);
    setOnboarded(ob);
    setAiConsent(ai);
    setIsPro(pro);
    setScansUsed(used);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await purchases.configure();
      await refresh();
      if (mounted) setReady(true);
    })();
    const off = purchases.onEntitlementChange((pro) => mounted && setIsPro(pro));
    return () => {
      mounted = false;
      off();
    };
  }, [refresh]);

  const completeOnboarding = useCallback(async () => {
    await consent.setOnboarded(true);
    setOnboarded(true);
  }, []);

  const grantAiConsent = useCallback(async () => {
    await consent.setAiConsent(true);
    setAiConsent(true);
  }, []);

  const registerScan = useCallback(async () => {
    const n = await counterRepo.incScans();
    setScansUsed(n);
  }, []);

  const setPro = useCallback((v: boolean) => setIsPro(v), []);

  const value = useMemo<AppStateValue>(() => {
    const freeScansLeft = Math.max(0, CONFIG.freeScans - scansUsed);
    return {
      ready,
      onboarded,
      aiConsent,
      isPro,
      scansUsed,
      freeScansLeft,
      canScan: isPro || freeScansLeft > 0,
      completeOnboarding,
      grantAiConsent,
      registerScan,
      setPro,
      refresh,
    };
  }, [ready, onboarded, aiConsent, isPro, scansUsed, completeOnboarding, grantAiConsent, registerScan, setPro, refresh]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
