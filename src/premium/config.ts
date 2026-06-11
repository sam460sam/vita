// ============================================================================
// Vyta subscription configuration (RevenueCat — free up to ~$2.5k/mo revenue).
//
// MODEL: hard paywall with a 7-day free trial, then €2,99/month (reinstall-proof).
//   • On entry, if not subscribed, our paywall screen is shown
//     ("7 days free, then €2,99/month"). Tapping the CTA starts the purchase;
//     because the product has a 7-day introductory free trial in App Store
//     Connect, eligible users get the free week (no charge), then €2,99/mo.
//   • Apple tracks trial eligibility per Apple ID → reinstalling/cancelling does
//     NOT grant a new free week.
//   • While the subscription (incl. the trial) is active → full app.
//
// DORMANT BY DEFAULT: leave the API key EMPTY → no paywall, app fully unlocked
// (the 1.2 state). Fill the key to turn the subscription on.
// Keys: RevenueCat → Project settings → API keys (public SDK key, `appl_...`).
// ============================================================================

export const REVENUECAT_API_KEY = {
  ios: 'appl_OtiEuvtgdEhyxkMVzrNjirFsFEq', // RevenueCat public SDK key (App Store)
  android: '', // e.g. 'goog_XXXXXXXXXXXXXXXXXXXXXXXX'
};

/** Entitlement identifier configured in RevenueCat (grants full access). */
export const SUBSCRIPTION_ENTITLEMENT_ID = 'Vyta Pro';

/**
 * Hard paywall switch.
 *  • true  → after the free trial week the app is gated (must subscribe to keep
 *    using). NO paywall at first launch — the user is free for TRIAL_DAYS days,
 *    then the paywall appears.
 *  • false → the app never gates; the subscription is only offered on the Pro page.
 */
export const HARD_PAYWALL = true;

/** RevenueCat package type for the monthly plan (with the 7-day trial). */
export const MONTHLY_PACKAGE_TYPE = 'MONTHLY';

/** Free trial length — must match the introductory offer in App Store Connect. */
export const TRIAL_DAYS = 7;

/** Monthly price shown before live store prices load (display only). */
export const PRICE_FALLBACK = '€2,99';
