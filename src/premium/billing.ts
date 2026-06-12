// ============================================================================
// Native StoreKit 2 billing (via @squareetlabs/capacitor-subscriptions).
// Verification is fully on-device → the app stays "Data Not Collected".
// Every call is guarded: on web (or any non-native platform) it's a safe no-op.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { Subscriptions } from '@squareetlabs/capacitor-subscriptions';
import { PRODUCT_IDS, ALL_PRODUCT_IDS, type PlanPeriod } from './config';

/** True only inside the native iOS app (where StoreKit exists). */
export function isBillingConfigured(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

export interface ProPackage {
  period: PlanPeriod;
  productId: string;
  /** Localized price string from the store, e.g. '€3,99'. */
  priceString: string;
}

export interface EntitlementState {
  isPro: boolean;
  productId?: string;
  expiresAt?: number;
}

/** Fetch both subscription products with their localized prices. */
export async function getProPackages(): Promise<ProPackage[]> {
  if (!isBillingConfigured()) return [];
  const out: ProPackage[] = [];
  for (const [period, productId] of Object.entries(PRODUCT_IDS) as [PlanPeriod, string][]) {
    try {
      const res = await Subscriptions.getProductDetails({ productIdentifier: productId });
      if (res.responseCode === 0 && res.data) {
        out.push({ period, productId, priceString: res.data.price });
      }
    } catch {
      /* product not available yet */
    }
  }
  return out;
}

/** Read the current entitlement from StoreKit (on-device verified). */
export async function getEntitlement(): Promise<EntitlementState> {
  if (!isBillingConfigured()) return { isPro: false };
  try {
    const res = await Subscriptions.getCurrentEntitlements();
    const txns = res.responseCode === 0 ? res.data ?? [] : [];
    const now = Date.now();
    const active = txns
      .filter((t) => ALL_PRODUCT_IDS.includes(t.productIdentifier))
      .map((t) => ({ productId: t.productIdentifier, expiresAt: Date.parse(t.expiryDate) }))
      // keep entitlements that are non-expired (or have no parseable expiry)
      .filter((t) => !Number.isFinite(t.expiresAt) || t.expiresAt > now)
      .sort((a, b) => (b.expiresAt || 0) - (a.expiresAt || 0));
    if (active.length === 0) return { isPro: false };
    return {
      isPro: true,
      productId: active[0].productId,
      expiresAt: Number.isFinite(active[0].expiresAt) ? active[0].expiresAt : undefined,
    };
  } catch {
    return { isPro: false };
  }
}

/** Start a purchase. Returns the resulting entitlement state. */
export async function purchase(productId: string): Promise<EntitlementState> {
  if (!isBillingConfigured()) return { isPro: false };
  try {
    const res = await Subscriptions.purchaseProduct({ productIdentifier: productId });
    if (res.responseCode === 0) return await getEntitlement();
    return { isPro: false };
  } catch {
    return { isPro: false };
  }
}

/** Restore purchases. StoreKit 2 reflects restored subscriptions in the current
 *  entitlements, so we re-read them. */
export async function restore(): Promise<EntitlementState> {
  return getEntitlement();
}

/** Open the system "Manage Subscriptions" screen. */
export async function manageSubscriptions(): Promise<void> {
  if (!isBillingConfigured()) return;
  try {
    await Subscriptions.manageSubscriptions();
  } catch {
    /* ignore */
  }
}
