// ============================================================================
// App configuration — the ONE place to paste your keys/URLs.
// Values can be overridden at build time via Vite env vars (VITE_*), so you can
// keep secrets out of source if you prefer (none of these are secret, though —
// the AI key lives only in the Cloudflare Worker, never here).
// ============================================================================

const env = import.meta.env;

export const CONFIG = {
  appName: 'Geode',
  appStoreName: 'Geode: Crystal & Rock ID',
  subtitle: 'Identify crystals, rocks & gems',

  /** The thing we identify (used in copy + consent screen). */
  verticalNoun: 'crystal, rock, mineral or gemstone',
  verticalPlural: 'crystals & rocks',

  /** MUST appear textually in the AI consent screen + privacy policy. */
  aiProviderName: 'Google Gemini',

  /** Cloudflare Worker proxy — the API key lives there, never in this client. */
  proxyUrl: (env.VITE_PROXY_URL as string) || 'https://geode-proxy.YOUR_SUBDOMAIN.workers.dev',

  /** RevenueCat public iOS API key (safe to ship; it's a *public* key). */
  revenueCatIosKey: (env.VITE_REVENUECAT_IOS_KEY as string) || 'appl_REPLACE_WITH_YOUR_KEY',

  /** RevenueCat entitlement that unlocks Pro. */
  entitlementId: 'pro',

  /** Product identifiers (must match App Store Connect + RevenueCat). */
  products: {
    weekly: 'geode_weekly',
    annual: 'geode_annual',
    lifetime: 'geode_lifetime',
  },

  /** Legal URLs (host the text from APP_STORE_SUBMISSION.md). */
  termsUrl: (env.VITE_TERMS_URL as string) || 'https://geode.app/terms',
  privacyUrl: (env.VITE_PRIVACY_URL as string) || 'https://geode.app/privacy',
  supportEmail: 'hello@geode.app',

  /** Free tier: total free scans before the paywall. */
  freeScans: 2,

  /** Client-side image processing before upload (keeps token cost tiny). */
  image: {
    maxEdge: 768,
    jpegQuality: 0.7,
  },
} as const;

export type AppConfig = typeof CONFIG;
