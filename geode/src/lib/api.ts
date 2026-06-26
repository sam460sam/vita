// ============================================================================
// Vision API client — talks ONLY to our Cloudflare Worker proxy.
// The AI provider key never reaches this client (BUILD-SPEC §4/§5).
// ============================================================================
import { CONFIG } from './config';

export interface Candidate {
  common_name: string;
  scientific_name: string;
  confidence: number; // 0-100
  key_features: string;
  mohs_hardness: string;
  description: string;
  traditional_meanings: string;
  care_tips: string;
  value_range_usd: string;
}

export interface IdentifyResult {
  candidates: Candidate[];
  refine_questions: string[];
  low_confidence: boolean;
  /** Optional polite note when the photo isn't a stone. */
  note?: string;
}

export interface RefineAnswer {
  question: string;
  answer: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly kind: 'network' | 'rate-limit' | 'server' | 'parse' | 'offline' = 'server',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestBody {
  imageBase64: string;
  mode: 'identify' | 'refine';
  answers?: RefineAnswer[];
}

const TIMEOUT_MS = 30_000;

async function callProxy(body: RequestBody, attempt = 0): Promise<IdentifyResult> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ApiError('You appear to be offline. Identification needs a connection.', 'offline');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(CONFIG.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new ApiError('Too many scans right now. Please wait a moment and try again.', 'rate-limit');
    }
    if (!res.ok) {
      throw new ApiError(`The identifier service returned an error (${res.status}).`, 'server');
    }

    const json = (await res.json()) as IdentifyResult;
    if (!json || !Array.isArray(json.candidates)) {
      throw new ApiError('Unexpected response from the identifier.', 'parse');
    }
    return normalize(json);
  } catch (err) {
    if (err instanceof ApiError) {
      // single retry on transient network/server failures
      if ((err.kind === 'server' || err.kind === 'network') && attempt < 1) {
        await delay(800);
        return callProxy(body, attempt + 1);
      }
      throw err;
    }
    if ((err as Error).name === 'AbortError') {
      if (attempt < 1) {
        return callProxy(body, attempt + 1);
      }
      throw new ApiError('The identifier timed out. Please try again.', 'network');
    }
    if (attempt < 1) {
      await delay(800);
      return callProxy(body, attempt + 1);
    }
    throw new ApiError('Network error. Please check your connection and try again.', 'network');
  } finally {
    clearTimeout(timer);
  }
}

/** Clamp/sanitize the model output so the UI can trust it. */
function normalize(r: IdentifyResult): IdentifyResult {
  const candidates = (r.candidates || [])
    .slice(0, 3)
    .map((c) => ({
      common_name: str(c.common_name) || 'Unknown',
      scientific_name: str(c.scientific_name),
      confidence: clamp(Number(c.confidence) || 0, 0, 100),
      key_features: str(c.key_features),
      mohs_hardness: str(c.mohs_hardness),
      description: str(c.description),
      traditional_meanings: str(c.traditional_meanings),
      care_tips: str(c.care_tips),
      value_range_usd: str(c.value_range_usd),
    }))
    .sort((a, b) => b.confidence - a.confidence);

  const top = candidates[0]?.confidence ?? 0;
  return {
    candidates,
    refine_questions: (r.refine_questions || []).filter(Boolean).slice(0, 3),
    low_confidence: typeof r.low_confidence === 'boolean' ? r.low_confidence : top < 55,
    note: r.note,
  };
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const api = {
  async identify(imageBase64: string): Promise<IdentifyResult> {
    const { isDemoMode, demoIdentify } = await import('./demo');
    if (isDemoMode()) return demoIdentify(imageBase64);
    return callProxy({ imageBase64, mode: 'identify' });
  },
  async refine(imageBase64: string, answers: RefineAnswer[]): Promise<IdentifyResult> {
    const { isDemoMode, demoRefine } = await import('./demo');
    if (isDemoMode()) return demoRefine(imageBase64, answers);
    return callProxy({ imageBase64, mode: 'refine', answers });
  },
};
