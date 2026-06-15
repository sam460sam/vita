import { supabase } from '@/lib/supabase';
import type { Cantiere, Operaio, CalcoloCemento, TipoUso, CantiereStato, PagamentoStato } from './types';

// ── ID helpers ────────────────────────────────────────────────────────────────

export const now = () => Date.now();
export const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);

// ── Row types (snake_case ↔ camelCase) ────────────────────────────────────────

interface CantiereRow {
  id: string;
  team_id: string;
  cliente: string;
  telefono: string | null;
  indirizzo: string | null;
  mq: number;
  spessore: number;
  tipo_uso: string;
  stato: string;
  importo: number;
  acconto: number | null;
  data_prevista: string | null;
  data_completamento: string | null;
  note: string | null;
  foto: string[];
  firma_cliente: string | null;
  operai_ids: string[];
  pagamento: string;
  scadenza_pagamento: string | null;
  data_pagamento: string | null;
  classe_cemento: string | null;
  additivi: string[];
  storico_calcoli: CalcoloCemento[] | null;
  verbale_timestamp: string | null;
  verbale_cliente_nome: string | null;
  verbale_disclaimer_accettato: boolean | null;
  contratto_firma_cliente: string | null;
  contratto_timestamp: string | null;
  contratto_cliente_nome: string | null;
  costo_materiali: number | null;
  costo_manodopera: number | null;
  costo_altri: number | null;
  created_at: number;
  updated_at: number;
}

interface OperaioRow {
  id: string;
  team_id: string;
  nome: string;
  telefono: string | null;
  specializzazioni: string[];
  valutazione: number | null;
  note_private: string | null;
  attivo: boolean;
  created_at: number;
  updated_at: number;
}

function rowToCantiere(r: CantiereRow): Cantiere {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    cliente: r.cliente,
    telefono: r.telefono ?? undefined,
    indirizzo: r.indirizzo ?? undefined,
    mq: r.mq,
    spessore: r.spessore,
    tipoUso: r.tipo_uso as TipoUso,
    stato: r.stato as CantiereStato,
    importo: r.importo,
    acconto: r.acconto ?? undefined,
    dataPrevista: r.data_prevista ?? undefined,
    dataCompletamento: r.data_completamento ?? undefined,
    note: r.note ?? undefined,
    foto: r.foto ?? [],
    firmaCliente: r.firma_cliente ?? undefined,
    operaiIds: r.operai_ids ?? [],
    pagamento: r.pagamento as PagamentoStato,
    scadenzaPagamento: r.scadenza_pagamento ?? undefined,
    dataPagamento: r.data_pagamento ?? undefined,
    classeCemento: r.classe_cemento ?? undefined,
    additivi: r.additivi ?? [],
    storicoCalcoli: r.storico_calcoli ?? undefined,
    verbaleTimestamp: r.verbale_timestamp ?? undefined,
    verbaleClienteNome: r.verbale_cliente_nome ?? undefined,
    verbaleDisclaimerAccettato: r.verbale_disclaimer_accettato ?? undefined,
    contrattoFirmaCliente: r.contratto_firma_cliente ?? undefined,
    contrattoTimestamp: r.contratto_timestamp ?? undefined,
    contrattoClienteNome: r.contratto_cliente_nome ?? undefined,
    costoMateriali: r.costo_materiali ?? undefined,
    costoManodopera: r.costo_manodopera ?? undefined,
    costoAltri: r.costo_altri ?? undefined,
  };
}

function cantiereToRow(c: Cantiere, teamId: string): CantiereRow {
  return {
    id: c.id,
    team_id: teamId,
    cliente: c.cliente,
    telefono: c.telefono ?? null,
    indirizzo: c.indirizzo ?? null,
    mq: c.mq,
    spessore: c.spessore,
    tipo_uso: c.tipoUso,
    stato: c.stato,
    importo: c.importo,
    acconto: c.acconto ?? null,
    data_prevista: c.dataPrevista ?? null,
    data_completamento: c.dataCompletamento ?? null,
    note: c.note ?? null,
    foto: c.foto ?? [],
    firma_cliente: c.firmaCliente ?? null,
    operai_ids: c.operaiIds ?? [],
    pagamento: c.pagamento,
    scadenza_pagamento: c.scadenzaPagamento ?? null,
    data_pagamento: c.dataPagamento ?? null,
    classe_cemento: c.classeCemento ?? null,
    additivi: c.additivi ?? [],
    storico_calcoli: c.storicoCalcoli ?? null,
    verbale_timestamp: c.verbaleTimestamp ?? null,
    verbale_cliente_nome: c.verbaleClienteNome ?? null,
    verbale_disclaimer_accettato: c.verbaleDisclaimerAccettato ?? null,
    contratto_firma_cliente: c.contrattoFirmaCliente ?? null,
    contratto_timestamp: c.contrattoTimestamp ?? null,
    contratto_cliente_nome: c.contrattoClienteNome ?? null,
    costo_materiali: c.costoMateriali ?? null,
    costo_manodopera: c.costoManodopera ?? null,
    costo_altri: c.costoAltri ?? null,
    created_at: c.createdAt,
    updated_at: c.updatedAt,
  };
}

function rowToOperaio(r: OperaioRow): Operaio {
  return {
    id: r.id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    nome: r.nome,
    telefono: r.telefono ?? undefined,
    specializzazioni: r.specializzazioni ?? [],
    valutazione: (r.valutazione as Operaio['valutazione']) ?? undefined,
    notePrivate: r.note_private ?? undefined,
    attivo: r.attivo,
  };
}

// ── Cantieri ──────────────────────────────────────────────────────────────────

export async function saveCantiere(
  data: Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  teamId: string,
): Promise<string> {
  const id = data.id ?? uid('can_');
  const nowMs = now();
  let createdAt = nowMs;

  if (data.id) {
    const { data: ex } = await supabase
      .from('cantieri')
      .select('created_at')
      .eq('id', data.id)
      .maybeSingle();
    if (ex) createdAt = (ex as { created_at: number }).created_at;
  }

  const full: Cantiere = { ...(data as Cantiere), id, createdAt, updatedAt: nowMs };
  const { error } = await supabase
    .from('cantieri')
    .upsert(cantiereToRow(full, teamId));
  if (error) throw error;
  return id;
}

export async function deleteCantiere(id: string): Promise<void> {
  const { error } = await supabase.from('cantieri').delete().eq('id', id);
  if (error) throw error;
}

export async function seedCantieriDemo(teamId: string): Promise<void> {
  const giorni = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  const demo: (Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>)[] = [
    {
      cliente: 'Famiglia Bertolini', telefono: '+39 347 123 4567',
      indirizzo: 'Via Roma 12, Treviso', mq: 120, spessore: 12,
      tipoUso: 'residenziale', stato: 'in_corso', importo: 4800, acconto: 1500,
      dataPrevista: giorni(6), note: 'Pavimento soggiorno + cucina, finitura lucida',
      foto: [], operaiIds: [], pagamento: 'parziale', classeCemento: 'C25/30',
      additivi: ['Fluidificante'],
    },
    {
      cliente: 'Magazzini Sud Srl', telefono: '+39 0422 555 0199',
      indirizzo: "Via dell'Industria 45, Villorba", mq: 850, spessore: 18,
      tipoUso: 'industriale', stato: 'completato', importo: 28500, acconto: 28500,
      dataCompletamento: giorni(-20), note: 'Capannone logistico, gettata armata con fibre',
      foto: [], operaiIds: [], pagamento: 'saldato', classeCemento: 'C32/40',
      additivi: ['Fibre', 'Indurente'],
    },
    {
      cliente: 'Marco e Giulia Rossi', telefono: '+39 333 987 6543',
      indirizzo: 'Via dei Pini 8, Conegliano', mq: 60, spessore: 10,
      tipoUso: 'esterno', stato: 'preventivo', importo: 2200,
      dataPrevista: giorni(15), note: 'Terrazza esterna con pendenza per scolo acque',
      foto: [], operaiIds: [], pagamento: 'da_pagare', additivi: [],
    },
  ];
  for (const c of demo) await saveCantiere(c, teamId);
}

// ── Operai ────────────────────────────────────────────────────────────────────

export async function getOperaiByIds(ids: string[]): Promise<Operaio[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('operai')
    .select('*')
    .in('id', ids);
  if (error) throw error;
  return (data as OperaioRow[]).map(rowToOperaio);
}

export async function saveOperaio(
  data: Omit<Operaio, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  teamId: string,
): Promise<string> {
  const id = data.id ?? uid('ope_');
  const nowMs = now();
  let createdAt = nowMs;

  if (data.id) {
    const { data: ex } = await supabase
      .from('operai')
      .select('created_at')
      .eq('id', data.id)
      .maybeSingle();
    if (ex) createdAt = (ex as { created_at: number }).created_at;
  }

  const row: OperaioRow = {
    id, team_id: teamId,
    nome: data.nome,
    telefono: data.telefono ?? null,
    specializzazioni: data.specializzazioni ?? [],
    valutazione: data.valutazione ?? null,
    note_private: data.notePrivate ?? null,
    attivo: data.attivo,
    created_at: createdAt,
    updated_at: nowMs,
  };

  const { error } = await supabase.from('operai').upsert(row);
  if (error) throw error;
  return id;
}

export async function deleteOperaio(id: string): Promise<void> {
  const { error } = await supabase.from('operai').delete().eq('id', id);
  if (error) throw error;
}

// Export row types for the hooks
export type { CantiereRow, OperaioRow };
export { rowToCantiere, rowToOperaio };
