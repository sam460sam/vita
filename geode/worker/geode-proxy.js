// ============================================================================
// Geode proxy — Cloudflare Worker (BUILD-SPEC §5).
//
// Responsibilities:
//   • Keep the AI provider key server-side ONLY (env.AI_API_KEY). It must NEVER
//     reach the client.
//   • Accept POST { imageBase64, mode: "identify" | "refine", answers? }.
//   • Per-IP rate limiting (KV-backed, with an in-memory fallback).
//   • Call Google Gemini's vision endpoint with the strict system prompt.
//   • Return ONLY clean JSON to the client, with CORS.
//
// Deploy: see worker/README.md  (wrangler deploy)
// Bindings expected:
//   - env.AI_API_KEY   (secret)  → `wrangler secret put AI_API_KEY`
//   - env.RATE_LIMIT   (KV, optional but recommended)
//   - env.GEMINI_MODEL (var, optional) default "gemini-2.0-flash"
// ============================================================================

const SYSTEM_PROMPT = `You are an expert mineralogist and gemologist identifying a crystal, rock, mineral or gemstone from a user photo.
Return ONLY valid JSON, no markdown, with this exact shape:
{
  "candidates": [
    {
      "common_name": string,
      "scientific_name": string,
      "confidence": number,            // 0-100, must sum-ish across candidates, be honest
      "key_features": string,          // what in the photo supports this
      "mohs_hardness": string,
      "description": string,           // 2-3 sentences, factual
      "traditional_meanings": string,  // clearly framed as folklore/tradition, NOT health advice
      "care_tips": string,
      "value_range_usd": string        // rough range, e.g. "$5-$25 for a tumbled piece"
    }
  ],                                   // up to 3, ordered by confidence
  "refine_questions": [string],        // 2-3 simple physical tests to narrow the ID (streak, magnetism, hardness, transparency)
  "low_confidence": boolean            // true if top candidate < 55
}
Rules: Be honest about uncertainty — if unsure, lower confidence and rely on refine_questions.
NEVER give medical, health, safety, or financial-investment advice. Frame metaphysical/"healing" content strictly as traditional folklore.
If the image is not a crystal, rock, mineral or gemstone, return candidates: [] and a polite note in description.`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Per-IP limits.
const RATE_LIMIT = 30; // requests
const RATE_WINDOW = 60 * 60; // seconds (1 hour)

// In-memory fallback (per-isolate) if KV isn't bound.
const memHits = new Map();

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    // --- rate limit ---------------------------------------------------------
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const limited = await isRateLimited(env, ip);
    if (limited) {
      return json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
    }

    // --- parse + validate ---------------------------------------------------
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const { imageBase64, mode = 'identify', answers } = body || {};
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return json({ error: 'Missing imageBase64' }, 400);
    }
    if (imageBase64.length > 3_000_000) {
      // ~2.2MB decoded — client should send a 768px JPEG q0.7 (well under this).
      return json({ error: 'Image too large' }, 413);
    }
    if (!env.AI_API_KEY) {
      return json({ error: 'Server not configured' }, 500);
    }

    // --- build the prompt ---------------------------------------------------
    let userText =
      mode === 'refine'
        ? 'Re-identify the stone in the photo using these additional physical-test answers from the user:\n'
        : 'Identify the stone in this photo.';
    if (mode === 'refine' && Array.isArray(answers)) {
      for (const a of answers) {
        if (a && a.question && a.answer) userText += `- ${a.question} → ${a.answer}\n`;
      }
    }

    const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.AI_API_KEY}`;

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: 'user',
          parts: [
            { text: userText },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
      },
    };

    // --- call Gemini --------------------------------------------------------
    let upstream;
    try {
      upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      return json({ error: 'Upstream request failed' }, 502);
    }

    if (!upstream.ok) {
      return json({ error: 'AI provider error', status: upstream.status }, 502);
    }

    const data = await upstream.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';

    const result = safeParse(text);
    if (!result) {
      return json({ error: 'Could not parse AI response' }, 502);
    }

    return json(normalize(result), 200);
  },
};

// ---------------------------------------------------------------------------

async function isRateLimited(env, ip) {
  const key = `rl:${ip}`;
  if (env.RATE_LIMIT && env.RATE_LIMIT.get) {
    const raw = await env.RATE_LIMIT.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    if (count >= RATE_LIMIT) return true;
    await env.RATE_LIMIT.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    return false;
  }
  // in-memory fallback
  const now = Date.now();
  const entry = memHits.get(ip) || { count: 0, reset: now + RATE_WINDOW * 1000 };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + RATE_WINDOW * 1000;
  }
  entry.count += 1;
  memHits.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

function safeParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // strip markdown fences / extract first JSON object as a fallback
    const cleaned = text.replace(/```json|```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

/** Clamp/shape the model output so the client always gets a clean contract. */
function normalize(r) {
  const candidates = Array.isArray(r.candidates) ? r.candidates.slice(0, 3) : [];
  const clean = candidates.map((c) => ({
    common_name: str(c.common_name) || 'Unknown',
    scientific_name: str(c.scientific_name),
    confidence: clampNum(c.confidence),
    key_features: str(c.key_features),
    mohs_hardness: str(c.mohs_hardness),
    description: str(c.description),
    traditional_meanings: str(c.traditional_meanings),
    care_tips: str(c.care_tips),
    value_range_usd: str(c.value_range_usd),
  }));
  clean.sort((a, b) => b.confidence - a.confidence);
  const top = clean[0]?.confidence ?? 0;
  return {
    candidates: clean,
    refine_questions: Array.isArray(r.refine_questions) ? r.refine_questions.filter(Boolean).slice(0, 3) : [],
    low_confidence: typeof r.low_confidence === 'boolean' ? r.low_confidence : top < 55,
    note: clean.length === 0 ? str(candidates[0]?.description) || str(r.note) : undefined,
  };
}

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const clampNum = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}
