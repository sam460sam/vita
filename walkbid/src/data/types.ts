// ============================================================================
// WalkBid data model — strong types for every entity (build spec §5).
// Imperial units, USD. Binaries (photos/signatures/PDFs/audio) live in the
// `blobs` table as real Blobs and are referenced by id — never base64 in rows.
// ============================================================================

export type ID = string;
export type Locale = 'en' | 'es';

/** Imperial units used across the price book, estimates and change orders. */
export type Unit = 'sf' | 'sy' | 'cy' | 'lf' | 'ea' | 'hr' | 'ton' | 'ls';

export const UNITS: Unit[] = ['sf', 'sy', 'cy', 'lf', 'ea', 'hr', 'ton', 'ls'];

/** Optional captured location for signatures / photos (degrades gracefully). */
export interface Geo {
  lat: number;
  lng: number;
  accuracy?: number;
}

// ----------------------------------------------------------------------------
// Clients
// ----------------------------------------------------------------------------
export interface Client {
  id: ID;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  language: Locale; // crew/client preferred language (stored for future use)
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Projects (jobsites)
// ----------------------------------------------------------------------------
export type ProjectStatus = 'lead' | 'quoted' | 'signed' | 'in_progress' | 'done' | 'disputed';

export const PROJECT_STATUSES: ProjectStatus[] = ['lead', 'quoted', 'signed', 'in_progress', 'done', 'disputed'];

export interface Project {
  id: ID;
  clientId: ID;
  title: string;
  siteAddress: string;
  geo?: Geo;
  status: ProjectStatus;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Price book — the contractor's own prices (gets smarter with every estimate)
// ----------------------------------------------------------------------------
export interface PriceBookItem {
  id: ID;
  trade: string; // grouping key, e.g. "Excavation", "Pavers"
  code: string; // e.g. "PV01"
  description: { en: string; es: string };
  unit: Unit;
  unitPrice: number; // USD
  cost?: number; // optional internal cost (never shown on client docs)
  active: boolean;
  isDefault?: boolean; // seeded default ("edit your prices")
}

// ----------------------------------------------------------------------------
// Estimates
// ----------------------------------------------------------------------------
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

export interface Estimate {
  id: ID;
  projectId: ID;
  number: string; // human reference e.g. "EST-1042"
  status: EstimateStatus;
  taxRate: number; // 0..1 (default 0 — sales-tax treatment varies by state)
  markupRate: number; // 0..1 applied at estimate level, hidden on client PDF
  subtotal: number; // sum of line totals (pre-tax, pre-markup)
  total: number; // subtotal + markup + tax
  validUntil?: string; // ISO yyyy-MM-dd
  notes?: string;
  createdAt: number;
}

export interface EstimateItem {
  id: ID;
  estimateId: ID;
  priceBookId?: ID;
  description: string;
  qty: number;
  unit: Unit;
  unitPrice: number;
  total: number; // qty * unitPrice
  sort: number;
}

// ----------------------------------------------------------------------------
// Contracts — the core wedge (signed, hashed, timestamped, geolocated)
// ----------------------------------------------------------------------------
export type ContractStatus = 'draft' | 'signed';

export interface Contract {
  id: ID;
  projectId: ID;
  estimateId: ID;
  pdfBlobId?: ID;
  sha256?: string; // hex digest of the final PDF bytes
  signerName?: string;
  signerRole?: string;
  signatureBlobId?: ID;
  signedAt?: number;
  geo?: Geo;
  deviceModel?: string;
  status: ContractStatus;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Change orders — signed on the spot
// ----------------------------------------------------------------------------
export type ChangeOrderStatus = 'draft' | 'pending_signature' | 'signed' | 'refused';

export interface ChangeOrder {
  id: ID;
  projectId: ID;
  contractId?: ID;
  number: string; // e.g. "CO-3"
  title: string;
  description: string;
  deltaTotal: number; // +/- USD impact on the contract total
  status: ChangeOrderStatus;
  photoIds: ID[];
  voiceTranscript?: string;
  pdfBlobId?: ID;
  sha256?: string;
  signerName?: string;
  signerRole?: string;
  signatureBlobId?: ID;
  signedAt?: number;
  geo?: Geo;
  deviceModel?: string;
  createdAt: number;
}

export interface CoItem {
  id: ID;
  changeOrderId: ID;
  priceBookId?: ID;
  description: string;
  qty: number;
  unit: Unit;
  unitPrice: number;
  total: number;
  sort: number;
}

// ----------------------------------------------------------------------------
// Photos (geotagged, timestamped) — binary lives in `blobs`
// ----------------------------------------------------------------------------
export type PhotoRefType = 'estimate' | 'change_order' | 'diary' | 'proof';

export interface Photo {
  id: ID;
  projectId: ID;
  refType: PhotoRefType;
  refId: ID;
  blobId: ID;
  takenAt: number;
  geo?: Geo;
  caption?: string;
}

// ----------------------------------------------------------------------------
// Daily log / diary
// ----------------------------------------------------------------------------
export interface DiaryEntry {
  id: ID;
  projectId: ID;
  date: string; // ISO yyyy-MM-dd
  text: string;
  audioBlobId?: ID;
  photoIds: ID[];
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Payments / protection
// ----------------------------------------------------------------------------
export type PaymentLabel = 'deposit' | 'progress' | 'final' | 'extra';
export type PaymentStatus = 'pending' | 'requested' | 'paid' | 'late';

export type DueRule =
  | { type: 'date'; date: string } // ISO yyyy-MM-dd
  | { type: 'event'; event: 'signature' | 'co_signed' | 'completion' };

export interface Payment {
  id: ID;
  projectId: ID;
  label: PaymentLabel;
  amount: number; // USD
  dueRule: DueRule;
  status: PaymentStatus;
  requestedAt?: number;
  paidAt?: number;
  method?: string; // free text: Zelle / check / ACH / etc.
  note?: string;
  /** Set when an `extra` row is auto-created by a signed change order. */
  changeOrderId?: ID;
  sort: number;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Blobs — the only place binary data is stored
// ----------------------------------------------------------------------------
export type BlobKind = 'photo' | 'signature' | 'pdf' | 'audio' | 'logo';

export interface BlobRecord {
  id: ID;
  kind: BlobKind;
  mime: string;
  data: Blob;
  createdAt: number;
}

// ----------------------------------------------------------------------------
// Settings — singleton
// ----------------------------------------------------------------------------
export type AiMode = 'off' | 'mock' | 'live';

export interface CompanyInfo {
  name: string;
  licenseNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoBlobId?: ID;
  /** Free text: Zelle handle, "check payable to …", ACH details. */
  paymentInstructions?: string;
}

export interface Settings {
  id: 'app'; // single row
  company: CompanyInfo;
  defaultTaxRate: number; // 0..1
  defaultMarkupRate: number; // 0..1
  language: Locale;
  aiMode: AiMode;
  aiProxyUrl?: string;
  /** Marks first-run onboarding complete. */
  onboardedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// ----------------------------------------------------------------------------
// Backup envelope (full JSON + blobs exported as a .zip via JSZip)
// ----------------------------------------------------------------------------
export interface WalkBidBackup {
  schema: 'walkbid';
  version: number;
  exportedAt: number;
  settings: Settings | null;
  clients: Client[];
  projects: Project[];
  priceBook: PriceBookItem[];
  estimates: Estimate[];
  estimateItems: EstimateItem[];
  contracts: Contract[];
  changeOrders: ChangeOrder[];
  coItems: CoItem[];
  photos: Photo[];
  diaryEntries: DiaryEntry[];
  payments: Payment[];
  /** Blob payloads are stored as separate files in the zip, keyed by blob id. */
  blobIds: ID[];
}
