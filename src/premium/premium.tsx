// ============================================================================
// Vyta Pro — subscription state (native StoreKit, on-device, offline-first).
//
//  • The entitlement is cached in Dexie, so gating works instantly and offline.
//  • On launch and every time the app returns to the foreground, we re-check
//    StoreKit and update the cache.
//  • On web (or with the paywall disabled) everything degrades gracefully.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { App as CapApp } from '@capacitor/app';
import {
  isBillingConfigured,
  getEntitlement,
  getProPackages,
  purchase as billingPurchase,
  restore as billingRestore,
  manageSubscriptions,
  type ProPackage,
} from './billing';
import { PAYWALL_ENABLED } from './config';
import { readSubscription, writeSubscription } from '@/data/repo';

const DEV_KEY = 'vita.proDev'; // web/dev override to preview Pro features

interface PremiumCtx {
  /** True when the user has full access (subscribed, or gating disabled). */
  isPro: boolean;
  /** Still resolving the initial entitlement. */
  loading: boolean;
  /** True only in the native iOS app (purchases possible). */
  billingActive: boolean;
  packages: ProPackage[];
  purchase: (productId: string) => Promise<boolean>;
  restore: () => Promise<boolean>;
  manage: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<PremiumCtx | null>(null);

function devUnlock(): boolean {
  try {
    return localStorage.getItem(DEV_KEY) === '1';
  } catch {
    return false;
  }
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const billingActive = isBillingConfigured();
  const [pro, setPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<ProPackage[]>([]);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    if (!billingActive) return;
    const ent = await getEntitlement();
    if (!mounted.current) return;
    setPro(ent.isPro);
    await writeSubscription({ isPro: ent.isPro, productId: ent.productId, expiresAt: ent.expiresAt });
  }, [billingActive]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      // 1) Offline-first: use the cached entitlement immediately.
      const cached = await readSubscription();
      if (mounted.current && cached) setPro(cached.isPro);
      // 2) Refresh from StoreKit + load the products (native only).
      if (billingActive) {
        await refresh();
        const pkgs = await getProPackages();
        if (mounted.current) setPackages(pkgs);
      }
      if (mounted.current) setLoading(false);
    })();

    // Re-check whenever the app comes back to the foreground.
    const sub = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) void refresh();
    });
    return () => {
      mounted.current = false;
      void sub.then((h) => h.remove());
    };
  }, [billingActive, refresh]);

  const purchase = useCallback(async (productId: string) => {
    const ent = await billingPurchase(productId);
    if (ent.isPro) {
      setPro(true);
      await writeSubscription({ isPro: true, productId: ent.productId, expiresAt: ent.expiresAt });
    }
    return ent.isPro;
  }, []);

  const restore = useCallback(async () => {
    const ent = await billingRestore();
    setPro(ent.isPro);
    await writeSubscription({ isPro: ent.isPro, productId: ent.productId, expiresAt: ent.expiresAt });
    return ent.isPro;
  }, []);

  // Gating disabled, or a dev/web preview override → treat as Pro.
  const isPro = !PAYWALL_ENABLED || devUnlock() || pro;

  const value = useMemo<PremiumCtx>(
    () => ({ isPro, loading, billingActive, packages, purchase, restore, manage: manageSubscriptions, refresh }),
    [isPro, loading, billingActive, packages, purchase, restore, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePremium(): PremiumCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}

/** Convenience hook: is the user a Vyta Pro subscriber (or unlocked)? */
export function useIsPro(): boolean {
  return usePremium().isPro;
}
