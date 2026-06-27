// ============================================================================
// Vyta subscription configuration — NATIVE StoreKit 2 (on-device only).
//
// No third-party billing service: verification happens on-device via
// @squareetlabs/capacitor-subscriptions, so the app stays "Data Not Collected".
//
// Products are created in App Store Connect with these exact IDs, each with a
// 3-day free trial as an Introductory Offer. The web/PWA build has no purchases
// (everything degrades gracefully).
// ============================================================================

export const PRODUCT_IDS = {
  monthly: 'vyta_pro_monthly',
  yearly: 'vyta_pro_yearly',
} as const;

export type PlanPeriod = 'monthly' | 'yearly';

/** All subscription product IDs (for Pro entitlement matching). */
export const ALL_PRODUCT_IDS: string[] = [PRODUCT_IDS.monthly, PRODUCT_IDS.yearly];

/** One-time (non-consumable) purchases — separate from the Pro subscription.
 *  The personality test's full profile is unlocked for life with this. */
export const ONE_TIME_PRODUCT_IDS = {
  personalityFull: 'vyta_personality_full',
} as const;

/** Display price shown before the live store price loads. */
export const PERSONALITY_PRICE_FALLBACK = '€3,99';

/** Free trial length (must match the Introductory Offer in App Store Connect). */
export const TRIAL_DAYS = 3;

/** Yearly savings vs paying monthly (badge). 3,99×12=47,88 → 29,99 ≈ 37% off. */
export const YEARLY_SAVINGS_PCT = 37;

/** Display prices shown before live store prices load. */
export const PRICE_FALLBACK: Record<PlanPeriod, string> = {
  monthly: '€3,99',
  yearly: '€29,99',
};

/** Mandatory legal links (Apple requires Terms/EULA + Privacy on the paywall). */
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
export const PRIVACY_URL = 'https://vita-peach.vercel.app/privacy.html';

/**
 * Modules behind Vyta Pro (the "equilibrata" split). The wellness core
 * (habits, journal, notes, health) stays free; water is a Pro feature.
 */
export const PRO_MODULES: string[] = ['finanze', 'obiettivi', 'calendario', 'acqua'];

/** Master switch. Keep true to ship the paywall; flip to false to disable
 *  gating entirely (emergency unlock) without removing the code. */
export const PAYWALL_ENABLED = true;
