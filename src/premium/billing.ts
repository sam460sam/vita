// ============================================================================
// RevenueCat billing wrapper. Every call is guarded: on web, or when no API key
// is configured (see config.ts), all functions are safe no-ops so the app keeps
// building and running exactly as before. Only when a key is present does this
// talk to the real store.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { REVENUECAT_API_KEY, PRO_ENTITLEMENT_ID } from './config';

const platformName = Capacitor.getPlatform();
const apiKey =
  platformName === 'ios' ? REVENUECAT_API_KEY.ios : platformName === 'android' ? REVENUECAT_API_KEY.android : '';

/** True when real billing is wired (native + an API key is set). */
export function isBillingConfigured(): boolean {
  return Capacitor.isNativePlatform() && apiKey.length > 0;
}

export interface ProPackage {
  identifier: string;
  /** RevenueCat package type, e.g. 'ANNUAL' | 'MONTHLY'. */
  type: string;
  /** Localized price, e.g. '€ 9,99'. */
  priceString: string;
  /** The raw RevenueCat package, passed back to purchase(). */
  raw: unknown;
}

let configured = false;
async function ensureConfigured(): Promise<boolean> {
  if (!isBillingConfigured()) return false;
  if (configured) return true;
  try {
    await Purchases.configure({ apiKey });
    configured = true;
    return true;
  } catch {
    return false;
  }
}

function entitlementActive(customerInfo: { entitlements: { active: Record<string, unknown> } }): boolean {
  return !!customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
}

/** Is the Pro entitlement currently active for this user? */
export async function isProActive(): Promise<boolean> {
  if (!(await ensureConfigured())) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return entitlementActive(customerInfo);
  } catch {
    return false;
  }
}

/** Available Pro packages (annual/monthly) from the current offering. */
export async function getProPackages(): Promise<ProPackage[]> {
  if (!(await ensureConfigured())) return [];
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = (offerings.current?.availablePackages ?? []) as Array<{
      identifier: string;
      packageType: string;
      product: { priceString: string };
    }>;
    return pkgs.map((p) => ({
      identifier: p.identifier,
      type: String(p.packageType),
      priceString: p.product?.priceString ?? '',
      raw: p,
    }));
  } catch {
    return [];
  }
}

/** Purchase a package. Returns true if Pro is active afterwards. */
export async function purchasePackage(pkg: ProPackage): Promise<boolean> {
  if (!(await ensureConfigured())) return false;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg.raw as any });
    return entitlementActive(customerInfo);
  } catch {
    return false;
  }
}

/** Restore previous purchases. Returns true if Pro is active afterwards. */
export async function restorePurchases(): Promise<boolean> {
  if (!(await ensureConfigured())) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return entitlementActive(customerInfo);
  } catch {
    return false;
  }
}

/** Subscribe to entitlement changes (e.g. renewals/expirations). */
export async function onProChange(cb: (active: boolean) => void): Promise<void> {
  if (!(await ensureConfigured())) return;
  try {
    await Purchases.addCustomerInfoUpdateListener((info) => cb(entitlementActive(info)));
  } catch {
    /* ignore */
  }
}
