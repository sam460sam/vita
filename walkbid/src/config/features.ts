// Feature flags. Phase 3 is PARKED — these gate routes/UI that have no
// implementation (build spec §6 Phase 3). Keep them all `false`.
export const FEATURES = {
  crewMarketplace: false, // crew / subcontractor marketplace
  materialsOrdering: false, // materials ordering
  paymentProvider: false, // Stripe / payment-provider integration
  clientPortal: false, // client web portal
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function isEnabled(flag: FeatureFlag): boolean {
  return FEATURES[flag];
}
