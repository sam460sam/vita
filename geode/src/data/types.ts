// ============================================================================
// Local data model. Everything lives on-device (IndexedDB via Dexie). No
// account, no server-side storage of user data (BUILD-SPEC §6).
// ============================================================================
import type { Candidate, IdentifyResult } from '@/lib/api';

/** A stone the user saved into their collection. */
export interface SavedStone {
  id: string;
  /** JPEG data URL of the (compressed) photo. */
  photo: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  mohsHardness: string;
  description: string;
  traditionalMeanings: string;
  careTips: string;
  valueRange: string;
  keyFeatures: string;
  /** User-editable fields. */
  notes: string;
  foundLocation: string;
  tags: string[];
  /** Full result snapshot (for re-displaying alternates). */
  candidates: Candidate[];
  createdAt: number;
  updatedAt: number;
}

/** Cached identification result keyed by image hash (BUILD-SPEC §4). */
export interface CachedScan {
  hash: string;
  result: IdentifyResult;
  createdAt: number;
}

/** Generic key/value singletons (consent, counters, settings flags). */
export interface KV {
  key: string;
  value: unknown;
}

export interface Settings {
  careReminders: boolean;
  careReminderTime: string; // HH:mm
  stoneOfDayReminder: boolean;
}
