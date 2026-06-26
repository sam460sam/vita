// ============================================================================
// Repositories — the only API the UI uses to read/write data.
// ============================================================================
import type { Candidate, IdentifyResult } from '@/lib/api';
import { db } from './db';
import type { CachedScan, KV, SavedStone, Settings } from './types';

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Collection ------------------------------------------------------------

export const stonesRepo = {
  all(): Promise<SavedStone[]> {
    return db.stones.orderBy('createdAt').reverse().toArray();
  },

  get(id: string): Promise<SavedStone | undefined> {
    return db.stones.get(id);
  },

  async addFromCandidate(photo: string, candidate: Candidate, candidates: Candidate[]): Promise<SavedStone> {
    const now = Date.now();
    const stone: SavedStone = {
      id: uid(),
      photo,
      commonName: candidate.common_name,
      scientificName: candidate.scientific_name,
      confidence: candidate.confidence,
      mohsHardness: candidate.mohs_hardness,
      description: candidate.description,
      traditionalMeanings: candidate.traditional_meanings,
      careTips: candidate.care_tips,
      valueRange: candidate.value_range_usd,
      keyFeatures: candidate.key_features,
      notes: '',
      foundLocation: '',
      tags: [],
      candidates,
      createdAt: now,
      updatedAt: now,
    };
    await db.stones.add(stone);
    return stone;
  },

  async update(id: string, patch: Partial<SavedStone>): Promise<void> {
    await db.stones.update(id, { ...patch, updatedAt: Date.now() });
  },

  async remove(id: string): Promise<void> {
    await db.stones.delete(id);
  },

  async stats(): Promise<{ total: number; species: number }> {
    const all = await db.stones.toArray();
    const species = new Set(all.map((s) => s.commonName.toLowerCase().trim())).size;
    return { total: all.length, species };
  },

  async exportJson(): Promise<string> {
    const all = await db.stones.orderBy('createdAt').toArray();
    return JSON.stringify({ app: 'Geode', version: 1, exportedAt: Date.now(), stones: all }, null, 2);
  },
};

// ---- Scan cache (BUILD-SPEC §4) -------------------------------------------

export const cacheRepo = {
  async get(hash: string): Promise<IdentifyResult | null> {
    const row = await db.scanCache.get(hash);
    return row?.result ?? null;
  },
  async put(hash: string, result: IdentifyResult): Promise<void> {
    const row: CachedScan = { hash, result, createdAt: Date.now() };
    await db.scanCache.put(row);
  },
};

// ---- Key/value (consent, counters, settings) ------------------------------

async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const row = (await db.kv.get(key)) as KV | undefined;
  return row ? (row.value as T) : fallback;
}
async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

const DEFAULT_SETTINGS: Settings = {
  careReminders: false,
  careReminderTime: '10:00',
  stoneOfDayReminder: false,
};

export const settingsRepo = {
  get: () => kvGet<Settings>('settings', DEFAULT_SETTINGS),
  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await kvGet<Settings>('settings', DEFAULT_SETTINGS);
    const next = { ...current, ...patch };
    await kvSet('settings', next);
    return next;
  },
};

export const counterRepo = {
  /** Total scans the user has performed (used for the free-tier gate). */
  scansUsed: () => kvGet<number>('scansUsed', 0),
  async incScans(): Promise<number> {
    const n = (await kvGet<number>('scansUsed', 0)) + 1;
    await kvSet('scansUsed', n);
    return n;
  },
};

export { kvGet, kvSet };
