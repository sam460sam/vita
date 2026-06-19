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

/** Parse the plugin's expiryDate (Date → may arrive as ISO string or epoch
 *  ms/seconds) into a millisecond timestamp, or undefined if unparseable. */
function parseExpiry(v: unknown): number | undefined {
  if (typeof v === 'number') return v < 1e12 ? v * 1000 : v; // seconds → ms
  if (typeof v === 'string') {
    const n = Date.parse(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

/** Read the current entitlement from StoreKit (on-device verified).
 *  NOTE: the plugin returns `data` as an OBJECT keyed by transaction id (not an
 *  array, despite its TS types), so we normalise with Object.values. StoreKit's
 *  currentEntitlements already contains only active/valid entitlements, so any
 *  match for our products means the user is Pro. */
export async function getEntitlement(): Promise<EntitlementState> {
  if (!isBillingConfigured()) return { isPro: false };
  try {
    const res = await Subscriptions.getCurrentEntitlements();
    const raw = res.responseCode === 0 ? (res.data as unknown) : undefined;
    const txns: Array<{ productIdentifier?: string; expiryDate?: unknown }> = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object'
        ? Object.values(raw as Record<string, { productIdentifier?: string; expiryDate?: unknown }>)
        : [];
    const active = txns
      .filter((t) => t?.productIdentifier && ALL_PRODUCT_IDS.includes(t.productIdentifier))
      .map((t) => ({ productId: t.productIdentifier as string, expiresAt: parseExpiry(t.expiryDate) }))
      .sort((a, b) => (b.expiresAt || 0) - (a.expiresAt || 0));
    if (active.length === 0) return { isPro: false };
    return { isPro: true, productId: active[0].productId, expiresAt: active[0].expiresAt };
  } catch {
    return { isPro: false };
  }
}

/** Start a purchase. Returns the resulting entitlement state. After the native
 *  flow finishes we always re-read the entitlement (StoreKit is the source of
 *  truth), so "already subscribed" or restored purchases unlock correctly. */
export async function purchase(productId: string): Promise<EntitlementState> {
  if (!isBillingConfigured()) return { isPro: false };
  try {
    await Subscriptions.purchaseProduct({ productIdentifier: productId });
  } catch {
    /* user cancelled or transient error — still re-check entitlement below */
  }
  return getEntitlement();
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
