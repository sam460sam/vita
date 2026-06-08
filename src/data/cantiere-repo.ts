import { db, now, uid } from './db';
import type { Cantiere, Operaio } from './types';

// --- Cantieri ---

export const getCantieri = () => db.cantieri.orderBy('updatedAt').reverse().toArray();

export const getCantiere = (id: string) => db.cantieri.get(id);

export async function saveCantiere(
  data: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.cantieri.get(data.id) : undefined;
  const id = data.id ?? uid('can_');
  await db.cantieri.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteCantiere(id: string) {
  await db.cantieri.delete(id);
}

// Realistic sample cantieri so a new user can see the app's value before
// entering their own data ("Vedi esempio" in the empty state).
export async function seedCantieriDemo(): Promise<void> {
  const oggi = Date.now();
  const giorni = (n: number) => new Date(oggi + n * 86400000).toISOString().slice(0, 10);
  const demo: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      cliente: 'Famiglia Bertolini',
      telefono: '+39 347 123 4567',
      indirizzo: 'Via Roma 12, Treviso',
      mq: 120,
      spessore: 12,
      tipoUso: 'residenziale',
      stato: 'in_corso',
      importo: 4800,
      acconto: 1500,
      dataPrevista: giorni(6),
      note: 'Pavimento soggiorno + cucina, finitura lucida',
      foto: [],
      operaiIds: [],
      pagamento: 'parziale',
      classeCemento: 'C25/30',
      additivi: ['Fluidificante'],
    },
    {
      cliente: 'Magazzini Sud Srl',
      telefono: '+39 0422 555 0199',
      indirizzo: "Via dell'Industria 45, Villorba",
      mq: 850,
      spessore: 18,
      tipoUso: 'industriale',
      stato: 'completato',
      importo: 28500,
      acconto: 28500,
      dataCompletamento: giorni(-20),
      note: 'Capannone logistico, gettata armata con fibre',
      foto: [],
      operaiIds: [],
      pagamento: 'saldato',
      classeCemento: 'C32/40',
      additivi: ['Fibre', 'Indurente'],
    },
    {
      cliente: 'Marco e Giulia Rossi',
      telefono: '+39 333 987 6543',
      indirizzo: 'Via dei Pini 8, Conegliano',
      mq: 60,
      spessore: 10,
      tipoUso: 'esterno',
      stato: 'preventivo',
      importo: 2200,
      dataPrevista: giorni(15),
      note: 'Terrazza esterna con pendenza per scolo acque',
      foto: [],
      operaiIds: [],
      pagamento: 'da_pagare',
      additivi: [],
    },
  ];
  for (const c of demo) await saveCantiere(c);
}

// --- Operai ---

export const getOperai = () => db.operai.orderBy('nome').toArray();

export async function saveOperaio(
  data: Omit<Operaio, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
): Promise<string> {
  const existing = data.id ? await db.operai.get(data.id) : undefined;
  const id = data.id ?? uid('ope_');
  await db.operai.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  });
  return id;
}

export async function deleteOperaio(id: string) {
  await db.operai.delete(id);
}
