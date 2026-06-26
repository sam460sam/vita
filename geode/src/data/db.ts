// ============================================================================
// Storage layer — Dexie/IndexedDB behind a single module. The UI never touches
// Dexie directly; it goes through repo.ts.
// ============================================================================
import Dexie, { type Table } from 'dexie';
import type { CachedScan, KV, SavedStone } from './types';

export class GeodeDB extends Dexie {
  stones!: Table<SavedStone, string>;
  scanCache!: Table<CachedScan, string>;
  kv!: Table<KV, string>;

  constructor() {
    super('geode');
    this.version(1).stores({
      stones: 'id, createdAt, commonName, *tags',
      scanCache: 'hash, createdAt',
      kv: 'key',
    });
  }
}

export const db = new GeodeDB();
