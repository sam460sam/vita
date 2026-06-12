// ============================================================================
// Storage layer — Dexie/IndexedDB behind a single module (offline-first).
// The UI never touches Dexie directly; it goes through the services in
// src/services. Swapping for native SQLite later means reimplementing only
// this file + the services, not the UI.
// ============================================================================
import Dexie, { type Table } from 'dexie';
import type {
  BlobRecord,
  ChangeOrder,
  Client,
  CoItem,
  Contract,
  DiaryEntry,
  Estimate,
  EstimateItem,
  Payment,
  Photo,
  PriceBookItem,
  Project,
  Settings,
} from './types';

export class WalkBidDB extends Dexie {
  settings!: Table<Settings, string>;
  clients!: Table<Client, string>;
  projects!: Table<Project, string>;
  priceBook!: Table<PriceBookItem, string>;
  estimates!: Table<Estimate, string>;
  estimateItems!: Table<EstimateItem, string>;
  contracts!: Table<Contract, string>;
  changeOrders!: Table<ChangeOrder, string>;
  coItems!: Table<CoItem, string>;
  photos!: Table<Photo, string>;
  diaryEntries!: Table<DiaryEntry, string>;
  payments!: Table<Payment, string>;
  blobs!: Table<BlobRecord, string>;

  constructor() {
    super('walkbid');
    // Index only what we query/sort by. Blobs are referenced by id from rows.
    this.version(1).stores({
      settings: 'id',
      clients: 'id, name, createdAt',
      projects: 'id, clientId, status, createdAt',
      priceBook: 'id, trade, code, active',
      estimates: 'id, projectId, status, createdAt',
      estimateItems: 'id, estimateId, sort',
      contracts: 'id, projectId, estimateId, status',
      changeOrders: 'id, projectId, contractId, status, createdAt',
      coItems: 'id, changeOrderId, sort',
      photos: 'id, projectId, refType, refId, takenAt',
      diaryEntries: 'id, projectId, date, createdAt',
      payments: 'id, projectId, status, label, sort',
      blobs: 'id, kind, createdAt',
    });
  }
}

export const db = new WalkBidDB();

/** Stable, sortable-ish unique id without external deps. */
export function uid(prefix = ''): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${prefix}${t}${r}`;
}

export const now = (): number => Date.now();
