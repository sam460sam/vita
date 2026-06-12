// ============================================================================
// Single source of truth for user-facing branding (WALKBID build spec §0).
// Never hardcode the product name anywhere else — import BRAND from here.
// ============================================================================

/** User-facing product name. Market: United States only. */
export const BRAND = 'WalkBid' as const;

/** Positioning one-liner — splash / onboarding / store. */
export const BRAND_TAGLINE = 'Every change order signed. Every job paid.' as const;

/** iOS bundle identifier (not yet registered in App Store Connect). */
export const BUNDLE_ID = 'com.walkbid.app' as const;
