import type { WorkDay, WorkDayType, WorkProfile } from '@/data/types';

// ---------- Day-type config (single source of truth for colors + labels) ----------

export interface TipoGiornata {
  value: WorkDayType;
  label: string;
  /** CSS hex — must match the CSS variable in index.css */
  color: string;
  /** Non-null means "non-work": auto-fill this many hours */
  defaultOre: number | null;
}

export const TIPI_GIORNATA: TipoGiornata[] = [
  { value: 'lavorativa', label: 'Lavorativa', color: '#16a34a', defaultOre: null },
  { value: 'festiva',    label: 'Festiva',    color: '#dc2626', defaultOre: 8 },
  { value: 'malattia',   label: 'Malattia',   color: '#ea580c', defaultOre: 8 },
  { value: 'infortunio', label: 'Infortunio', color: '#7c3aed', defaultOre: 8 },
  { value: 'ferie',      label: 'Ferie',      color: '#2563eb', defaultOre: 8 },
  { value: 'permesso',   label: 'Permesso',   color: '#ca8a04', defaultOre: 8 },
];

export function tipoInfo(tipo: WorkDayType): TipoGiornata {
  return TIPI_GIORNATA.find((t) => t.value === tipo) ?? TIPI_GIORNATA[0];
}

// ---------- Hour calculations ----------

/**
 * Compute worked hours from start/end times minus break.
 * Rounds to 1 decimal place (i.e. 6-minute increments).
 */
export function calcolaOre(oraInizio: string, oraFine: string, pausaMinuti: number): number {
  const [hS, mS] = oraInizio.split(':').map(Number);
  const [hE, mE] = oraFine.split(':').map(Number);
  const totalMin = (hE * 60 + mE) - (hS * 60 + mS) - pausaMinuti;
  return Math.max(0, Math.round(totalMin / 6) / 10);
}

/** Default start/end times for a non-work day (gives `defaultOre` hours, no break). */
export function defaultOrari(oreDefault: number): { oraInizio: string; oraFine: string } {
  const endHour = 8 + oreDefault;
  return {
    oraInizio: '08:00',
    oraFine: `${String(endHour).padStart(2, '0')}:00`,
  };
}

// ---------- Payroll calculation (indicative estimate) ----------

export interface Retribuzione {
  lordo: number;
  inps: number;
  irpef: number;
  netto: number;
}

export function calcolaRetribuzione(
  ore: number,
  tariffaOraria: number,
  aliquotaIRPEF: number,
  aliquotaINPS: number,
): Retribuzione {
  const lordo = ore * tariffaOraria;
  const inps = (lordo * aliquotaINPS) / 100;
  const irpef = (lordo * aliquotaIRPEF) / 100;
  const netto = Math.max(0, lordo - inps - irpef);
  return { lordo, inps, irpef, netto };
}

// ---------- Monthly summary ----------

export interface RiepilogoMese {
  totalOre: number;
  oreLavorate: number;
  giorniTotali: number;
  giorniPerTipo: Record<WorkDayType, number>;
  lordo: number;
  netto: number;
}

export function riepilogoMese(workDays: WorkDay[], profile: WorkProfile | null): RiepilogoMese {
  const giorniPerTipo: Record<WorkDayType, number> = {
    lavorativa: 0, festiva: 0, malattia: 0, infortunio: 0, ferie: 0, permesso: 0,
  };
  let totalOre = 0;

  for (const wd of workDays) {
    giorniPerTipo[wd.tipo] = (giorniPerTipo[wd.tipo] ?? 0) + 1;
    totalOre += wd.oreCalcolate;
  }

  const oreLavorate = workDays
    .filter((w) => w.tipo === 'lavorativa')
    .reduce((s, w) => s + w.oreCalcolate, 0);

  const lordo = profile ? totalOre * profile.tariffaOraria : 0;
  const netto = profile
    ? Math.max(0, lordo * (1 - (profile.aliquotaIRPEF + profile.aliquotaINPS) / 100))
    : 0;

  return { totalOre, oreLavorate, giorniTotali: workDays.length, giorniPerTipo, lordo, netto };
}

// ---------- CSV export ----------

export function generaCSV(workDays: WorkDay[], _nomeMese: string): string {
  const header = 'Data,Tipo,Cantiere,Ore,Pausa (min),Stato,Note';
  const rows = workDays
    .sort((a, b) => a.data.localeCompare(b.data))
    .map((w) =>
      [
        w.data,
        tipoInfo(w.tipo).label,
        (w.cantiereName ?? '').replace(/,/g, ';'),
        w.oreCalcolate,
        w.pausaMinuti,
        w.status,
        (w.note ?? '').replace(/,/g, ';').replace(/\n/g, ' '),
      ].join(','),
    );
  return [header, ...rows].join('\n');
}

export async function condividiCSV(csv: string, nomeMese: string): Promise<void> {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const file = new File([blob], `ore_${nomeMese}.csv`, { type: 'text/csv' });
  if (
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({ title: `Ore Lavoro ${nomeMese}`, files: [file] });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ---------- Calendar grid helpers ----------

export interface CalCell {
  day: number;
  date: string;
  workDay: WorkDay | null;
  isToday: boolean;
  isWeekend: boolean;
}

export function buildCalendarGrid(
  anno: number,
  mese: number,
  workDays: WorkDay[],
): (CalCell | null)[] {
  const firstDay = new Date(anno, mese - 1, 1);
  const daysInMonth = new Date(anno, mese, 0).getDate();
  // Italian Monday-first: (getDay() + 6) % 7 → Mon=0 … Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const todayStr = new Date().toISOString().slice(0, 10);
  const wdMap = new Map(workDays.map((w) => [w.data, w]));

  const cells: (CalCell | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${anno}-${String(mese).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dow = (new Date(anno, mese - 1, d).getDay() + 6) % 7;
    cells.push({
      day: d,
      date: dateStr,
      workDay: wdMap.get(dateStr) ?? null,
      isToday: dateStr === todayStr,
      isWeekend: dow >= 5,
    });
  }
  return cells;
}

export const MESI_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
];

export function nomeMese(anno: number, mese: number): string {
  return `${MESI_IT[mese - 1]} ${anno}`;
}

export function formatEuroOre(n: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
}
