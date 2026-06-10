// ============================================================================
// Vyta subscription / paywall configuration (Superwall).
//
// MODEL: hard paywall with a 7-day free trial.
//   • On entry, if the user isn't subscribed, the Superwall paywall is shown
//     ("7 days free, then €3,99/month"). The paywall UI + the trial→price copy
//     are designed REMOTELY on the Superwall dashboard (no app update needed).
//   • The €3,99/month product + its 7-day FREE TRIAL (introductory offer) are
//     configured in App Store Connect. Apple tracks trial eligibility per Apple
//     ID, so reinstalling / cancelling does NOT grant a new free week.
//   • While the subscription (incl. trial) is active → full app.
//
// DORMANT BY DEFAULT: leave the API key EMPTY → no paywall, app fully unlocked
// (the 1.2 state). Fill the key to turn the subscription on.
// Key: Superwall dashboard → Settings → Keys (the public key, e.g. `pk_...`).
// ============================================================================

export const SUPERWALL_API_KEY = {
  ios: '', //  e.g. 'pk_XXXXXXXXXXXXXXXXXXXXXXXX'
  android: '', // e.g. 'pk_XXXXXXXXXXXXXXXXXXXXXXXX'
};

/**
 * Placement registered in the Superwall dashboard campaign that decides when to
 * show the paywall. Create a campaign with this placement and gating = "Gated".
 */
export const PAYWALL_PLACEMENT = 'campaign_trigger';

/** Free trial length — must match the introductory offer set in App Store Connect. */
export const TRIAL_DAYS = 7;

/** Monthly price shown in the in-app fallback screen (the real price lives on the paywall). */
export const PRICE_FALLBACK = '€3,99';
