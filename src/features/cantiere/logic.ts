import type { Cantiere } from '@/data/types';

export function calcolaCemento(mq: number, spessoreCm: number): number {
  return Math.round(mq * spessoreCm * 0.01 * 10) / 10;
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function totaleCrediti(cantieri: Cantiere[]): number {
  return cantieri
    .filter((c) => c.pagamento !== 'saldato')
    .reduce((sum, c) => sum + c.importo - (c.acconto ?? 0), 0);
}

export const STATI: { value: Cantiere['stato']; label: string; color: string }[] = [
  { value: 'preventivo', label: 'Preventivo', color: 'bg-ink-3/20 text-ink-2' },
  { value: 'confermato', label: 'Confermato', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'in_corso', label: 'In corso', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'completato', label: 'Completato', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'contestato', label: 'Contestato', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
];

export const PAGAMENTI: { value: Cantiere['pagamento']; label: string; color: string }[] = [
  { value: 'da_pagare', label: 'Da pagare', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'parziale', label: 'Parziale', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'saldato', label: 'Saldato', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
];

export function statoInfo(stato: Cantiere['stato']) {
  return STATI.find((s) => s.value === stato) ?? STATI[0];
}

export function pagamentoInfo(p: Cantiere['pagamento']) {
  return PAGAMENTI.find((x) => x.value === p) ?? PAGAMENTI[0];
}

export const CLASSI_CEMENTO = ['C20/25', 'C25/30', 'C28/35', 'C30/37', 'C32/40', 'C35/45'];

export const ADDITIVI = ['Fibre', 'Fluidificante', 'Ritardante', 'Impermeabilizzante', 'Indurente', 'Accelerante'];

export const TIPO_USO: { value: string; label: string }[] = [
  { value: 'industriale', label: 'Industriale' },
  { value: 'residenziale', label: 'Residenziale' },
  { value: 'esterno', label: 'Esterno' },
  { value: 'garage', label: 'Garage' },
  { value: 'altro', label: 'Altro' },
];

export const SPECIALIZZAZIONI = ['Gettista', 'Levigatore', 'Posatore', 'Assistente', 'Carpentiere', 'Ferraiolo'];

export function generaMessaggioCemento(params: {
  m3: number;
  classeCemento: string;
  additivi: string[];
  dataConsegna: string;
  ora: string;
  indirizzo: string;
}): string {
  const { m3, classeCemento, additivi, dataConsegna, ora, indirizzo } = params;
  const addStr = additivi.length ? `\nAdditivi: ${additivi.join(', ')}` : '';
  return `Ciao, mi servono ${m3}m³ ${classeCemento}${addStr}\n${dataConsegna} ore ${ora}\n${indirizzo}`;
}
