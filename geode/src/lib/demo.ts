// ============================================================================
// Demo mode — a fully local, deterministic mock identifier so the whole flow is
// testable WITHOUT a deployed Worker / AI key (e.g. on GitHub Pages or a local
// `npm run dev`). It turns OFF automatically as soon as a real proxy URL is set
// in config (or you can force it with VITE_DEMO=1).
// ============================================================================
import { CONFIG } from './config';
import { hashImage } from './hash';
import type { IdentifyResult, RefineAnswer } from './api';

/** True when no real proxy is configured (placeholder URL) or forced via env. */
export function isDemoMode(): boolean {
  if ((import.meta.env.VITE_DEMO as string) === '1') return true;
  return CONFIG.proxyUrl.includes('YOUR_SUBDOMAIN');
}

const DEMO: IdentifyResult[] = [
  {
    candidates: [
      {
        common_name: 'Amethyst',
        scientific_name: 'SiO₂ (quartz variety)',
        confidence: 84,
        key_features: 'Violet, translucent prismatic crystals with a glassy lustre and pointed terminations — classic amethyst habit.',
        mohs_hardness: '7',
        description: 'A purple variety of quartz coloured by trace iron and natural irradiation. Commonly found lining geodes and as cluster points.',
        traditional_meanings: 'Traditionally associated with calm and clarity. The Greek name means “not intoxicated”. (Folklore — not health advice.)',
        care_tips: 'Colour can fade in direct sunlight, so display away from strong light. Rinse with lukewarm water and a soft cloth.',
        value_range_usd: '$8–$40 for a small cluster',
      },
      {
        common_name: 'Fluorite',
        scientific_name: 'CaF₂',
        confidence: 10,
        key_features: 'Possible cubic habit and purple colour zoning.',
        mohs_hardness: '4',
        description: 'A softer mineral that can also appear purple, often as cubic crystals. Fluoresces under UV light.',
        traditional_meanings: 'Folklore frames it as a focus or “genius” stone.',
        care_tips: 'Soft and cleaves easily — handle gently and avoid knocks.',
        value_range_usd: '$5–$20 for a small specimen',
      },
      {
        common_name: 'Lepidolite',
        scientific_name: 'K(Li,Al)₃(Al,Si)₄O₁₀(F,OH)₂',
        confidence: 6,
        key_features: 'Lilac colour with a micaceous, slightly sparkly sheen.',
        mohs_hardness: '2.5–3',
        description: 'A lithium-bearing mica with a lilac to pink hue and a layered, flaky structure.',
        traditional_meanings: 'Tradition links it with calm.',
        care_tips: 'Very soft — keep dry and avoid abrasion.',
        value_range_usd: '$5–$15',
      },
    ],
    refine_questions: ['What colour is the streak when scraped on unglazed tile?', 'Does it scratch glass?', 'Is it transparent, translucent or opaque?'],
    low_confidence: false,
  },
  {
    candidates: [
      {
        common_name: 'Pyrite',
        scientific_name: 'FeS₂',
        confidence: 78,
        key_features: 'Brassy, metallic, gold-coloured cubic crystals — the “fool’s gold” look.',
        mohs_hardness: '6–6.5',
        description: 'An iron-sulfide mineral famous for striking cubic crystals and a bright metallic lustre. Often confused with gold but much lighter in the hand and brittle.',
        traditional_meanings: 'Traditionally seen as a symbol of prosperity and protection. (Folklore.)',
        care_tips: 'Can tarnish or “decay” with humidity — keep dry and do not soak in water.',
        value_range_usd: '$5–$30 for a cubic cluster',
      },
      {
        common_name: 'Chalcopyrite',
        scientific_name: 'CuFeS₂',
        confidence: 14,
        key_features: 'Brassy with possible iridescent tarnish.',
        mohs_hardness: '3.5–4',
        description: 'A copper-iron sulfide, softer than pyrite, often with a colourful peacock-like tarnish.',
        traditional_meanings: 'Folk tradition: a “stone of contentment”.',
        care_tips: 'Keep dry; avoid handling that rubs off the tarnish.',
        value_range_usd: '$4–$20',
      },
    ],
    refine_questions: ['Is it strongly attracted to a magnet?', 'What colour is the streak — greenish-black or black?', 'Does it feel heavy for its size?'],
    low_confidence: false,
  },
  {
    candidates: [
      {
        common_name: 'Rose Quartz',
        scientific_name: 'SiO₂',
        confidence: 73,
        key_features: 'Soft, milky pink, translucent quartz with no visible crystal faces — typical massive rose quartz.',
        mohs_hardness: '7',
        description: 'A pink variety of quartz coloured by microscopic mineral inclusions. Usually found as massive chunks rather than distinct crystals.',
        traditional_meanings: 'A traditional symbol of gentleness and affection across many cultures. (Folklore.)',
        care_tips: 'Can fade in prolonged sunlight; clean with lukewarm water and dry gently.',
        value_range_usd: '$4–$20 for a tumbled or raw piece',
      },
      {
        common_name: 'Rhodonite',
        scientific_name: 'MnSiO₃',
        confidence: 19,
        key_features: 'Pink with possible black veining.',
        mohs_hardness: '5.5–6.5',
        description: 'A pink manganese silicate, usually marbled with black manganese-oxide veins.',
        traditional_meanings: 'Folklore frames it as a stone of compassion.',
        care_tips: 'Wipe with a damp cloth and dry; avoid acids.',
        value_range_usd: '$6–$25',
      },
    ],
    refine_questions: ['Do you see any black veins running through it?', 'Does it scratch glass?', 'Is the pink even or patchy?'],
    low_confidence: false,
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Deterministic pick by image hash so the same photo gives the same result. */
function pick(base64: string): IdentifyResult {
  const h = hashImage(base64);
  const idx = parseInt(h.slice(0, 2), 16) % DEMO.length;
  // deep clone so callers can't mutate the shared fixture
  return JSON.parse(JSON.stringify(DEMO[idx]));
}

export async function demoIdentify(base64: string): Promise<IdentifyResult> {
  await delay(1400); // mimic a network round-trip so the "analyzing" UI shows
  return pick(base64);
}

export async function demoRefine(base64: string, answers: RefineAnswer[]): Promise<IdentifyResult> {
  await delay(1100);
  const res = pick(base64);
  // Reward answering: bump the top candidate's confidence and trim the tail.
  if (res.candidates[0]) {
    res.candidates[0].confidence = Math.min(97, res.candidates[0].confidence + 8 + answers.length * 2);
  }
  res.candidates = res.candidates.slice(0, Math.max(1, res.candidates.length - 1));
  res.low_confidence = false;
  res.refine_questions = [];
  return res;
}
