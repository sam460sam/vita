// ============================================================================
// PHASE 3 — PARKED. Seam interfaces only. DO NOT IMPLEMENT (build spec §6).
// These exist so Phase 1/2 code can reference stable types without any Phase 3
// logic shipping. Every method intentionally has no implementation.
// ============================================================================
import type { ID } from '@/data/types';

/** Crew / subcontractor marketplace. */
export interface CrewMarketplaceService {
  searchCrews(input: { trade: string; near?: ID }): Promise<never>;
  inviteCrew(crewId: ID, projectId: ID): Promise<never>;
}

/** Materials ordering. */
export interface MaterialsOrderingService {
  quoteMaterials(estimateId: ID): Promise<never>;
  placeOrder(estimateId: ID): Promise<never>;
}

/** Payment-provider integration (e.g. Stripe). Off by default; protection-only. */
export interface PaymentProviderService {
  createPaymentLink(paymentId: ID): Promise<never>;
  syncStatus(paymentId: ID): Promise<never>;
}

/** Client web portal. */
export interface ClientPortalService {
  publishProject(projectId: ID): Promise<never>;
  revokeAccess(projectId: ID): Promise<never>;
}
