// ============================================================================
// Single source of truth for user-facing branding.
// Every UI string, PDF header, splash/title and store reference must read the
// brand name from here — never hardcode it. (WALKBID build spec §0)
// ============================================================================

/** User-facing product name. Market: United States only. */
export const BRAND = 'WalkBid' as const;

/** One-line positioning used on splash / onboarding / store. */
export const BRAND_TAGLINE = 'Every change order signed. Every job paid.' as const;

/**
 * Proposed iOS bundle identifier. Pending confirmation of whether an App Store
 * Connect record already exists for the legacy `app.vita.lifeos` id:
 *   - if NOT yet registered → adopt `com.walkbid.app`
 *   - if already registered → keep the existing id, change only the display name
 * See docs/MIGRATION_PLAN.md "Rebrand surface".
 */
export const PROPOSED_BUNDLE_ID = 'com.walkbid.app' as const;
