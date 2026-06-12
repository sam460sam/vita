// Seed price book — defaults flagged "edit your prices" (build spec §9).
// USD placeholders. Spanish descriptions provided for crew-facing flows.
import type { PriceBookItem, Unit } from './types';

interface SeedRow {
  code: string;
  trade: string;
  en: string;
  es: string;
  unit: Unit;
  unitPrice: number;
}

const SEED: SeedRow[] = [
  { code: 'EX01', trade: 'Site & earthwork', en: 'Excavation & grading', es: 'Excavación y nivelación', unit: 'cy', unitPrice: 45 },
  { code: 'DM01', trade: 'Demolition', en: 'Demo existing concrete/pavers', es: 'Demolición de concreto/adoquines', unit: 'sf', unitPrice: 2.5 },
  { code: 'HA01', trade: 'Site & earthwork', en: 'Haul-off & disposal', es: 'Acarreo y desecho', unit: 'ton', unitPrice: 85 },
  { code: 'GB01', trade: 'Base', en: 'Crushed gravel base 6", supplied & compacted', es: 'Base de grava triturada 6", suministrada y compactada', unit: 'sf', unitPrice: 2.25 },
  { code: 'CC01', trade: 'Concrete', en: 'Concrete slab 4" with wire mesh', es: 'Losa de concreto 4" con malla', unit: 'sf', unitPrice: 8.5 },
  { code: 'PV01', trade: 'Pavers', en: 'Paver installation (labor)', es: 'Instalación de adoquines (mano de obra)', unit: 'sf', unitPrice: 7.0 },
  { code: 'PV02', trade: 'Pavers', en: 'Paver material, standard concrete pavers', es: 'Material de adoquines, concreto estándar', unit: 'sf', unitPrice: 4.5 },
  { code: 'PV03', trade: 'Pavers', en: 'Polymeric sand & finishing', es: 'Arena polimérica y acabado', unit: 'sf', unitPrice: 0.75 },
  { code: 'ED01', trade: 'Pavers', en: 'Edge restraint', es: 'Restricción de borde', unit: 'lf', unitPrice: 3.5 },
  { code: 'RW01', trade: 'Walls', en: 'Retaining wall block, supplied & installed (face)', es: 'Bloque de muro de contención, suministrado e instalado (cara)', unit: 'sf', unitPrice: 32 },
  { code: 'DR01', trade: 'Drainage', en: 'Channel drain, supplied & installed', es: 'Drenaje de canal, suministrado e instalado', unit: 'lf', unitPrice: 48 },
  { code: 'CB01', trade: 'Drainage', en: 'Catch basin with grate', es: 'Sumidero con rejilla', unit: 'ea', unitPrice: 325 },
  { code: 'AS01', trade: 'Asphalt', en: 'Asphalt overlay 2"', es: 'Recubrimiento de asfalto 2"', unit: 'sf', unitPrice: 3.25 },
  { code: 'SC01', trade: 'Concrete', en: 'Saw cutting concrete/asphalt', es: 'Corte con sierra de concreto/asfalto', unit: 'lf', unitPrice: 6 },
  { code: 'SL01', trade: 'Finishing', en: 'Paver/concrete sealing', es: 'Sellado de adoquines/concreto', unit: 'sf', unitPrice: 1.25 },
  { code: 'LB01', trade: 'Labor', en: 'Skilled labor', es: 'Mano de obra calificada', unit: 'hr', unitPrice: 65 },
  { code: 'EQ01', trade: 'Equipment', en: 'Mini-excavator with operator', es: 'Mini-excavadora con operador', unit: 'hr', unitPrice: 135 },
];

export function seedPriceBook(): PriceBookItem[] {
  return SEED.map((r) => ({
    id: `seed_${r.code}`,
    trade: r.trade,
    code: r.code,
    description: { en: r.en, es: r.es },
    unit: r.unit,
    unitPrice: r.unitPrice,
    active: true,
    isDefault: true,
  }));
}
