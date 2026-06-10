// ============================================================================
// Vyta Pro / RevenueCat configuration.
//
// HOW IT WORKS
//   • Leave the API keys EMPTY  → Pro is "dormant": the whole app stays
//     unlocked and the Pro page shows "coming soon" (this is the 1.2 state).
//   • Fill the platform API key → Pro turns ON: `isPremium` is resolved from
//     the real RevenueCat entitlement, the Pro page shows live prices and the
//     buttons trigger real purchase / restore.
//
// You get the keys from RevenueCat → Project settings → API keys.
// See PUBLISHING.md for the full setup.
// ============================================================================

export const REVENUECAT_API_KEY = {
  ios: '', //  e.g. 'appl_XXXXXXXXXXXXXXXXXXXXXXXX'
  android: '', // e.g. 'goog_XXXXXXXXXXXXXXXXXXXXXXXX'
};

/** Entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT_ID = 'pro';

/**
 * Package identifiers (RevenueCat "package" types) used by the Pro page.
 * These are the standard RevenueCat package types for annual/monthly.
 */
export const PRO_PACKAGE = {
  yearly: 'ANNUAL',
  monthly: 'MONTHLY',
};
