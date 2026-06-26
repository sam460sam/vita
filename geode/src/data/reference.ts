// ============================================================================
// Local reference content — powers "Stone of the Day" + the offline mini-guide.
// Rotates deterministically by day-of-year so the app has fresh, useful content
// every time it's opened, fully offline (BUILD-SPEC §2.7 / §3.1.2 retention).
// All facts are factual mineralogy; "folklore" fields are clearly framed as
// tradition, NOT health advice.
// ============================================================================
import { dayOfYear } from '@/lib/format';

export interface ReferenceStone {
  name: string;
  scientific: string;
  /** hex accent used for the gradient chip */
  color: string;
  mohs: string;
  fact: string;
  folklore: string;
  care: string;
}

export const REFERENCE_STONES: ReferenceStone[] = [
  {
    name: 'Amethyst',
    scientific: 'SiO₂ (quartz variety)',
    color: '#9d6bff',
    mohs: '7',
    fact: 'Amethyst gets its purple colour from trace iron and natural irradiation in the crystal lattice.',
    folklore: 'Traditionally associated with calm and clarity; the Greek name means "not intoxicated".',
    care: 'Colour can fade in direct sunlight — store and display away from strong light.',
  },
  {
    name: 'Clear Quartz',
    scientific: 'SiO₂',
    color: '#e6e1ff',
    mohs: '7',
    fact: 'The most abundant single mineral on Earth\'s surface and the reference for hardness 7 on the Mohs scale.',
    folklore: 'Long called the "master stone" in folk traditions and used as a focus object.',
    care: 'Very durable. Rinse with water and a soft cloth; avoid sudden temperature changes.',
  },
  {
    name: 'Rose Quartz',
    scientific: 'SiO₂',
    color: '#f7b7c8',
    mohs: '7',
    fact: 'Its pink hue comes from microscopic mineral inclusions, often titanium or manganese.',
    folklore: 'A traditional symbol of gentleness and affection across many cultures.',
    care: 'Can fade in sunlight; clean with lukewarm water and dry gently.',
  },
  {
    name: 'Citrine',
    scientific: 'SiO₂',
    color: '#f6c453',
    mohs: '7',
    fact: 'Natural citrine is rare; much on the market is heat-treated amethyst — both are real quartz.',
    folklore: 'Folk tradition links it with optimism and warmth, nicknamed the "merchant\'s stone".',
    care: 'Avoid prolonged sunlight, which can pale the colour. Wipe clean with a soft cloth.',
  },
  {
    name: 'Fluorite',
    scientific: 'CaF₂',
    color: '#6fd6c9',
    mohs: '4',
    fact: 'Fluorite fluoresces under UV light — the word "fluorescence" is named after it.',
    folklore: 'Sometimes called the "genius stone" in folklore, associated with focus.',
    care: 'Relatively soft (Mohs 4) and cleaves easily — handle gently, avoid knocks.',
  },
  {
    name: 'Pyrite',
    scientific: 'FeS₂',
    color: '#d9b24a',
    mohs: '6–6.5',
    fact: 'Nicknamed "fool\'s gold", pyrite forms strikingly cubic crystals with a metallic lustre.',
    folklore: 'Traditionally seen as a symbol of prosperity and protection.',
    care: 'Can tarnish or "decay" with humidity — keep dry; do not soak in water.',
  },
  {
    name: 'Selenite',
    scientific: 'CaSO₄·2H₂O (gypsum)',
    color: '#eef2ff',
    mohs: '2',
    fact: 'So soft you can scratch it with a fingernail; some specimens form metre-long translucent beams.',
    folklore: 'Named after Selene, the Greek moon goddess; associated with clearing and calm.',
    care: 'Water-soluble and very soft — NEVER wash; dust with a dry, soft brush.',
  },
  {
    name: 'Obsidian',
    scientific: 'Volcanic glass',
    color: '#2b2b33',
    mohs: '5–5.5',
    fact: 'Not a mineral but natural glass from rapidly cooled lava; fractures into razor-sharp edges.',
    folklore: 'Used for tools for millennia and seen in folklore as a grounding, protective stone.',
    care: 'Edges can be sharp; wipe with a soft cloth and store away from harder stones.',
  },
  {
    name: 'Malachite',
    scientific: 'Cu₂CO₃(OH)₂',
    color: '#1f9e6e',
    mohs: '3.5–4',
    fact: 'Its banded green comes from copper; it was ground into pigment by old masters.',
    folklore: 'A traditional talisman for travellers in several cultures.',
    care: 'Soft and contains copper — keep dry, avoid acids, never ingest dust. Wipe dry only.',
  },
  {
    name: 'Lapis Lazuli',
    scientific: 'Rock (lazurite + calcite + pyrite)',
    color: '#2b4cff',
    mohs: '5–5.5',
    fact: 'A rock, not a single mineral; its deep blue lazurite was prized as ultramarine pigment.',
    folklore: 'Worn by ancient royalty; folklore links it with truth and insight.',
    care: 'Porous — avoid water, heat and chemicals; wipe with a slightly damp cloth and dry.',
  },
  {
    name: 'Tiger\'s Eye',
    scientific: 'SiO₂ (chatoyant quartz)',
    color: '#b5762e',
    mohs: '7',
    fact: 'Its silky "cat\'s-eye" shimmer (chatoyancy) comes from parallel fibrous inclusions.',
    folklore: 'Traditionally carried as a stone of courage and steadiness.',
    care: 'Durable quartz; rinse with water and dry. Avoid harsh chemicals.',
  },
  {
    name: 'Hematite',
    scientific: 'Fe₂O₃',
    color: '#6e5a5a',
    mohs: '5–6',
    fact: 'Leaves a distinctive rust-red streak — a classic field test for iron oxide minerals.',
    folklore: 'Its name comes from the Greek for "blood"; folklore ties it to grounding.',
    care: 'Can rust if left wet; dry promptly. Magnetic varieties are man-made (hematine).',
  },
  {
    name: 'Labradorite',
    scientific: 'Feldspar',
    color: '#3aa0a8',
    mohs: '6–6.5',
    fact: 'Shows "labradorescence" — flashes of blue/green caused by light interference in its layers.',
    folklore: 'Inuit legend tells of the northern lights trapped inside the stone.',
    care: 'Wipe with a soft damp cloth; avoid knocks along cleavage planes.',
  },
  {
    name: 'Sodalite',
    scientific: 'Na₈(Al₆Si₆O₂₄)Cl₂',
    color: '#3358cc',
    mohs: '5.5–6',
    fact: 'Rich royal-blue with white veins; some specimens fluoresce orange under UV.',
    folklore: 'Folklore associates it with calm communication.',
    care: 'Wipe clean and dry; avoid prolonged water exposure.',
  },
  {
    name: 'Carnelian',
    scientific: 'SiO₂ (chalcedony)',
    color: '#d4582f',
    mohs: '6.5–7',
    fact: 'A warm orange-red chalcedony coloured by iron oxide; popular for carved seals in antiquity.',
    folklore: 'Traditionally a stone of motivation and vitality.',
    care: 'Durable; rinse with water. Colour is stable but avoid harsh heat.',
  },
  {
    name: 'Aventurine',
    scientific: 'SiO₂ (quartz)',
    color: '#3fae7a',
    mohs: '7',
    fact: 'Its shimmer ("aventurescence") comes from tiny mica or fuchsite platelets.',
    folklore: 'Nicknamed the "stone of opportunity" in folk tradition.',
    care: 'Durable quartz; clean with water and a soft cloth.',
  },
  {
    name: 'Agate',
    scientific: 'SiO₂ (banded chalcedony)',
    color: '#b07a4d',
    mohs: '6.5–7',
    fact: 'Forms as banded layers lining cavities in volcanic rock — every slice is unique.',
    folklore: 'Used as protective amulets since antiquity.',
    care: 'Tough and stable; rinse and dry. Dyed agates may fade in strong sun.',
  },
  {
    name: 'Jasper',
    scientific: 'SiO₂ (opaque chalcedony)',
    color: '#a14b3a',
    mohs: '6.5–7',
    fact: 'Opaque, often earthy-red chalcedony; "jasper" comes from a word meaning "spotted stone".',
    folklore: 'Long regarded in folklore as a grounding "supreme nurturer".',
    care: 'Durable; clean with water and a soft cloth.',
  },
  {
    name: 'Moonstone',
    scientific: 'Feldspar',
    color: '#cfe0ff',
    mohs: '6–6.5',
    fact: 'Its floating blue sheen ("adularescence") is caused by light scattering between feldspar layers.',
    folklore: 'Across cultures, traditionally linked to the moon and intuition.',
    care: 'Somewhat fragile; avoid knocks and ultrasonic cleaners. Wipe gently.',
  },
  {
    name: 'Garnet',
    scientific: 'Silicate group',
    color: '#9e2b3b',
    mohs: '6.5–7.5',
    fact: 'A whole mineral group, not one species; the name comes from "granatum" (pomegranate).',
    folklore: 'Carried as a traveller\'s protective stone in many traditions.',
    care: 'Durable; clean with warm soapy water and a soft brush.',
  },
  {
    name: 'Turquoise',
    scientific: 'CuAl₆(PO₄)₄(OH)₈·4H₂O',
    color: '#3bc4c0',
    mohs: '5–6',
    fact: 'One of the oldest gemstones mined by humans; colour ranges from sky-blue to green.',
    folklore: 'A sacred protective stone in many Indigenous and ancient cultures.',
    care: 'Porous and sensitive — keep away from oils, cosmetics and water; wipe dry only.',
  },
  {
    name: 'Calcite',
    scientific: 'CaCO₃',
    color: '#f3e6c0',
    mohs: '3',
    fact: 'Clear "Iceland spar" calcite splits light into a double image (birefringence).',
    folklore: 'Folk tradition treats it as an energy "amplifier" and cleanser.',
    care: 'Soft and reacts with acids — keep dry, avoid vinegar/citrus; dust gently.',
  },
  {
    name: 'Aquamarine',
    scientific: 'Be₃Al₂Si₆O₁₈ (beryl)',
    color: '#7fd1e3',
    mohs: '7.5–8',
    fact: 'A blue beryl, sister to emerald; named from the Latin for "sea water".',
    folklore: 'Traditionally a sailor\'s talisman for safe passage.',
    care: 'Hard and durable; clean with warm soapy water. Avoid prolonged strong sun.',
  },
  {
    name: 'Rhodonite',
    scientific: 'MnSiO₃',
    color: '#d05a7a',
    mohs: '5.5–6.5',
    fact: 'Pink manganese silicate, usually marbled with black manganese-oxide veins.',
    folklore: 'Folklore frames it as a stone of compassion.',
    care: 'Wipe with a damp cloth and dry; avoid acids.',
  },
  {
    name: 'Amazonite',
    scientific: 'KAlSi₃O₈ (microcline feldspar)',
    color: '#4fc7b0',
    mohs: '6–6.5',
    fact: 'A blue-green feldspar; despite the name, it isn\'t actually found along the Amazon River.',
    folklore: 'Nicknamed the "hope stone" in folk tradition.',
    care: 'Wipe clean with a soft damp cloth; avoid knocks along cleavage.',
  },
];

/** Today's stone — deterministic, fully offline. */
export function stoneOfTheDay(d = new Date()): ReferenceStone {
  return REFERENCE_STONES[dayOfYear(d) % REFERENCE_STONES.length];
}
