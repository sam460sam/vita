/**
 * Hook offline-first per cantieri e operai.
 *
 * Fonte primaria: Dexie (useLiveQuery) → istantaneo, funziona offline.
 * Fonte secondaria: Supabase Realtime → aggiorna Dexie, che riattiva useLiveQuery.
 *
 * Non si legge MAI direttamente da Supabase in questi hook; il sync è gestito
 * da SyncWorker.initialize() chiamato una sola volta in TeamContext.
 */

import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { supabase } from '@/lib/supabase';
import { useTeam } from '@/auth/TeamContext';
import { db } from '@/data/db';
import {
  rowToCantiere,
  rowToOperaio,
  type CantiereRow,
  type OperaioRow,
} from '@/data/supabase-cantiere-repo';
import type { Cantiere, Operaio } from '@/data/types';

// ── useCantieri ────────────────────────────────────────────────────────────

/** Tutti i cantieri del team corrente, ordinati per updatedAt desc. */
export function useCantieri(): Cantiere[] {
  const { team } = useTeam();

  // Lettura reattiva da Dexie — si aggiorna ogni volta che Dexie cambia
  const cantieri = useLiveQuery(
    async () => {
      if (!team?.id) return [];
      const all = await db.cantieri.where('teamId').equals(team.id).toArray();
      return all.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [team?.id],
    [],
  ) ?? [];

  // Realtime Supabase → scrive su Dexie → useLiveQuery si aggiorna da solo
  useEffect(() => {
    if (!team?.id) return;

    const ch = supabase
      .channel(`cantieri_team_${team.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'cantieri',
        filter: `team_id=eq.${team.id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          db.cantieri.delete((payload.old as { id: string }).id).catch(console.error);
        } else {
          db.cantieri.put({
            ...rowToCantiere(payload.new as CantiereRow),
            teamId: team.id,
          }).catch(console.error);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [team?.id]);

  return cantieri;
}

// ── useCantiere ────────────────────────────────────────────────────────────

/** Singolo cantiere per id. undefined = caricamento, null = non trovato. */
export function useCantiere(id: string | undefined): Cantiere | null | undefined {
  const { team } = useTeam();

  const cantiere = useLiveQuery(
    async () => {
      if (!team?.id || !id) return undefined;
      return (await db.cantieri.get(id)) ?? null;
    },
    [team?.id, id],
    undefined,
  );

  // Realtime per aggiornamenti in tempo reale del singolo cantiere
  useEffect(() => {
    if (!team?.id || !id) return;

    const ch = supabase
      .channel(`cantiere_${id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'cantieri',
        filter: `id=eq.${id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          db.cantieri.delete(id).catch(console.error);
        } else {
          db.cantieri.put({
            ...rowToCantiere(payload.new as CantiereRow),
            teamId: team.id,
          }).catch(console.error);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [team?.id, id]);

  return cantiere;
}

// ── useOperai ──────────────────────────────────────────────────────────────

/** Operai del team corrente, opzionalmente filtrati per id. */
export function useOperai(ids?: string[]): Operaio[] {
  const { team } = useTeam();

  const idsKey = ids?.join(',') ?? '*';

  const operai = useLiveQuery(
    async () => {
      if (!team?.id) return [];
      if (ids !== undefined && ids.length === 0) return [];

      const all = await db.operai.where('teamId').equals(team.id).toArray();
      const sorted = all.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));

      if (!ids) return sorted;
      const idSet = new Set(ids);
      return sorted.filter((o) => idSet.has(o.id));
    },
    [team?.id, idsKey],
    [],
  ) ?? [];

  // Realtime → aggiorna Dexie → useLiveQuery si riattiva
  useEffect(() => {
    if (!team?.id) return;

    const ch = supabase
      .channel(`operai_team_${team.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'operai',
        filter: `team_id=eq.${team.id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          db.operai.delete((payload.old as { id: string }).id).catch(console.error);
        } else {
          db.operai.put({
            ...rowToOperaio(payload.new as OperaioRow),
            teamId: team.id,
          }).catch(console.error);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [team?.id]);

  return operai;
}
