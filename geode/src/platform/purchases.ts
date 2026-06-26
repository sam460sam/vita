// ============================================================================
// RevenueCat wrapper (BUILD-SPEC §3). Handles configure, offerings, purchase,
// restore and the `pro` entitlement. Native uses @revenuecat/purchases-capacitor;
// on the web everything degrades gracefully so the UI is still testable.
// ============================================================================
import { Capacitor } from '@capacitor/core';
import { CONFIG } from '@/lib/config';

const isNative = Capacitor.isNativePlatform();

export interface PriceInfo {
  /** RevenueCat package identifier to purchase. */
  packageId: string;
  /** Store product identifier. */
  productId: string;
  /** Localised price string, e.g. "$4.99". */
  priceString: string;
  /** Localised price per period helper, e.g. "$0.71/day" (computed). */
  title: string;
  period: 'weekly' | 'annual' | 'lifetime';
  hasTrial: boolean;
  trialDays: number;
}

export interface Offerings {
  weekly?: PriceInfo;
  annual?: PriceInfo;
  lifetime?: PriceInfo;
  /** Raw RevenueCat package objects, keyed by our product id. */
  raw: Record<string, unknown>;
}

let configured = false;

type Listener = (isPro: boolean) => void;
const listeners = new Set<Listener>();

function emit(isPro: boolean) {
  for (const l of listeners) l(isPro);
}

export const purchases = {
  onEntitlementChange(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  async configure(): Promise<void> {
    if (configured || !isNative) return;
    try {
      const { Purchases, LOG_LEVEL } = await import('@revenuecat/purchases-capacitor');
      await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
      await Purchases.configure({ apiKey: CONFIG.revenueCatIosKey });
      configured = true;
      // Push initial entitlement state to listeners.
      const pro = await this.isPro();
      emit(pro);
      // Subscribe to updates.
      await Purchases.addCustomerInfoUpdateListener((info: { entitlements: { active: Record<string, unknown> } }) => {
        emit(Boolean(info?.entitlements?.active?.[CONFIG.entitlementId]));
      });
    } catch {
      /* SDK unavailable */
    }
  },

  async isPro(): Promise<boolean> {
    if (!isNative) {
      // Web/dev: allow a local override so you can preview Pro UI.
      return localStorage.getItem('geode.devPro') === 'true';
    }
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      return Boolean(customerInfo.entitlements.active[CONFIG.entitlementId]);
    } catch {
      return false;
    }
  },

  async getOfferings(): Promise<Offerings> {
    if (!isNative) {
      // Web preview values so the paywall renders with realistic copy.
      return {
        weekly: { packageId: '$rc_weekly', productId: CONFIG.products.weekly, priceString: '$4.99', title: '$0.71/day', period: 'weekly', hasTrial: true, trialDays: 3 },
        annual: { packageId: '$rc_annual', productId: CONFIG.products.annual, priceString: '$29.99', title: '$0.58/week', period: 'annual', hasTrial: false, trialDays: 0 },
        lifetime: { packageId: '$rc_lifetime', productId: CONFIG.products.lifetime, priceString: '$49.99', title: 'one-time', period: 'lifetime', hasTrial: false, trialDays: 0 },
        raw: {},
      };
    }
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { current } = (await Purchases.getOfferings()).all
        ? await Purchases.getOfferings()
        : { current: null };
      const offering = current ?? (await Purchases.getOfferings()).current;
      const result: Offerings = { raw: {} };
      const pkgs = offering?.availablePackages ?? [];
      for (const pkg of pkgs) {
        const pid = pkg.product.identifier;
        const priceString = pkg.product.priceString;
        const trial = extractTrial(pkg);
        result.raw[pid] = pkg;
        if (pid === CONFIG.products.weekly) {
          result.weekly = { packageId: pkg.identifier, productId: pid, priceString, title: perDay(pkg.product.price, 7), period: 'weekly', hasTrial: trial > 0, trialDays: trial };
        } else if (pid === CONFIG.products.annual) {
          result.annual = { packageId: pkg.identifier, productId: pid, priceString, title: perWeek(pkg.product.price), period: 'annual', hasTrial: trial > 0, trialDays: trial };
        } else if (pid === CONFIG.products.lifetime) {
          result.lifetime = { packageId: pkg.identifier, productId: pid, priceString, title: 'one-time', period: 'lifetime', hasTrial: false, trialDays: 0 };
        }
      }
      return result;
    } catch {
      return { raw: {} };
    }
  },

  /** Purchase a package by its RevenueCat package id. Returns true if Pro now. */
  async purchase(packageId: string): Promise<boolean> {
    if (!isNative) {
      localStorage.setItem('geode.devPro', 'true');
      emit(true);
      return true;
    }
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find((p) => p.identifier === packageId);
      if (!pkg) return false;
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
      const pro = Boolean(customerInfo.entitlements.active[CONFIG.entitlementId]);
      emit(pro);
      return pro;
    } catch (e) {
      // user cancellation is not an error worth surfacing
      const err = e as { code?: string; userCancelled?: boolean };
      if (err?.userCancelled) return false;
      throw e;
    }
  },

  async restore(): Promise<boolean> {
    if (!isNative) {
      const pro = localStorage.getItem('geode.devPro') === 'true';
      emit(pro);
      return pro;
    }
    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.restorePurchases();
      const pro = Boolean(customerInfo.entitlements.active[CONFIG.entitlementId]);
      emit(pro);
      return pro;
    } catch {
      return false;
    }
  },
};

// ---- helpers ---------------------------------------------------------------

function extractTrial(pkg: { product: { introPrice?: { price: number; periodNumberOfUnits?: number } | null } }): number {
  const intro = pkg.product.introPrice;
  if (intro && intro.price === 0 && intro.periodNumberOfUnits) return intro.periodNumberOfUnits;
  return 0;
}
function perDay(price: number, days: number): string {
  if (!price) return '';
  return `$${(price / days).toFixed(2)}/day`;
}
function perWeek(annual: number): string {
  if (!annual) return '';
  return `$${(annual / 52).toFixed(2)}/week`;
}
