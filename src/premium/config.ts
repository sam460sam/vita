// ============================================================================
// Vyta subscription / paywall configuration (Superwall).
//
// MODEL: 7-day free trial, then €2,99/month (reinstall-proof).
//   • On entry, if not subscribed, the Superwall paywall is shown
//     ("7 days free, then €2,99/month"). The user starts the free trial.
//   • The 7-day free trial is the App Store Connect INTRODUCTORY OFFER on the
//     €2,99/month product. Apple tracks trial eligibility per Apple ID, so
//     reinstalling / cancelling does NOT grant a new free week — the user pays.
//   • While the subscription (incl. the trial) is active → full app.
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
