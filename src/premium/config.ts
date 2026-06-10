// ============================================================================
// Vyta subscription / paywall configuration (Superwall).
//
// MODEL: free for the first week of use, then subscribe.
//   • For the first TRIAL_DAYS of use the whole app is FREE (no paywall).
//   • After that, if not subscribed, the Superwall paywall is shown
//     ("Continue with Vyta — €2,99/month"). The paywall UI is designed REMOTELY
//     on the Superwall dashboard. The €2,99/month product lives in App Store
//     Connect.
//
// NOTE: the free week is tracked LOCALLY (first-launch date). Uninstalling and
// reinstalling resets it. To make it reinstall-proof, switch to a StoreKit
// introductory free trial (see PUBLISHING.md).
//
// DORMANT BY DEFAULT: leave the API key EMPTY → no paywall ever, app fully
// unlocked (the 1.2 state). Fill the key to turn the subscription on.
// Key: Superwall dashboard → Settings → Keys (public key, e.g. `pk_...`).
// ============================================================================

export const SUPERWALL_API_KEY = {
  ios: '', //  e.g. 'pk_XXXXXXXXXXXXXXXXXXXXXXXX'
  android: '', // e.g. 'pk_XXXXXXXXXXXXXXXXXXXXXXXX'
};

/**
 * Placement registered in the Superwall dashboard campaign that shows the
 * paywall. Create a campaign with this placement and gating = "Gated".
 */
export const PAYWALL_PLACEMENT = 'campaign_trigger';

/** Length of the free usage week. */
export const TRIAL_DAYS = 7;

/** Monthly price shown in the in-app screens (the real price lives on the paywall / App Store). */
export const PRICE_FALLBACK = '€2,99';
