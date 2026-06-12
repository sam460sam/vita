// ============================================================================
// AI service layer types (build spec §6 M7). All AI output is a strict JSON
// shape; it always lands in an editable DRAFT screen — never written to the DB.
// ============================================================================
import type { Locale, PriceBookItem, Unit } from '@/data/types';

/** A single AI-suggested line. `unitPrice: null` + `needsPricing` = unmatched. */
export interface DraftLine {
  description: string;
  qty: number;
  unit: Unit;
  unitPrice: number | null;
  priceBookId: string | null;
  needsPricing: boolean;
}

export interface EstimateDraft {
  items: DraftLine[];
  notes: string | null;
}

export interface ChangeOrderDraft {
  title: string;
  description: string;
  items: DraftLine[];
  notes: string | null;
}

export interface LogDraft {
  workDone: string;
  crewPresent: string;
  weather: string;
  issues: string;
  /** Assembled English summary ready to drop into the daily log text field. */
  text: string;
}

export interface ProjectContext {
  title: string;
  siteAddress: string;
}

export interface AIProvider {
  draftEstimate(input: { transcript: string; priceBook: PriceBookItem[]; locale: Locale }): Promise<EstimateDraft>;
  draftChangeOrder(input: {
    transcript: string;
    photosContext?: string[];
    priceBook: PriceBookItem[];
    project: ProjectContext;
    locale: Locale;
  }): Promise<ChangeOrderDraft>;
  summarizeLog(input: { transcript: string; date: string; locale: Locale }): Promise<LogDraft>;
}

/** Task discriminator sent to the proxy / used by the queue. */
export type AiTask = 'draftEstimate' | 'draftChangeOrder' | 'summarizeLog';
