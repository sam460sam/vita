/**
 * SyncWorker — offline-first sync tra Dexie (cache locale) e Supabase.
 *
 * Responsabilità:
 *  1. Pull iniziale: Supabase → Dexie al login
 *  2. Migrazione orfani: righe Dexie senza teamId → Supabase
 *  3. Flush outbox: scritture accumulate offline → Supabase al ritorno della rete
 *  4. Listener 'online' per flush automatico
 */

import { db, uid, now } from './db';
import { supabase } from '@/lib/supabase';
import {
  rowToCantiere,
  rowToOperaio,
  cantiereToRow,
  type CantiereRow,
  type OperaioRow,
} from './supabase-cantiere-repo';
import type { OutboxEntry, OutboxTable, OutboxOperation } from './types';

// ── Outbox helpers ─────────────────────────────────────────────────────────

/** Aggiunge un'operazione alla coda locale per retry quando si torna online. */
export async function addToOutbox(
  entry: { table: OutboxTable; operation: OutboxOperation; payload: Record<string, unknown>; teamId: string },
): Promise<void> {
  const row: OutboxEntry = {
    id: uid('ob_'),
    table: entry.table,
    operation: entry.operation,
    payload: entry.payload,
    teamId: entry.teamId,
    createdAt: now(),
    attempts: 0,
  };
  await db.outbox.put(row);
}

// ── SyncWorker ─────────────────────────────────────────────────────────────

class SyncWorker {
  private teamId: string | null = null;
  private initializedFor: string | null = null;
  private flushing = false;
  private readonly onOnline = () => {
    if (this.teamId) this.flush().catch(console.error);
  };

  /**
   * Da chiamare una sola volta dopo il caricamento del team.
   * Idempotente per lo stesso teamId.
   */
  async initialize(teamId: string): Promise<void> {
    if (this.initializedFor === teamId) return;
    this.teamId = teamId;
    this.initializedFor = teamId;

    window.removeEventListener('online', this.onOnline);
    window.addEventListener('online', this.onOnline);

    // Esegui in parallelo: migrazione orfani + pull da Supabase
    await Promise.allSettled([
      this.migrateOrphans(teamId),
      this.pull(teamId),
    ]);

    // Flush outbox pendente (può esserci da sessioni offline precedenti)
    await this.flush();
  }

  /** Svuota la coda outbox: invia a Supabase e rimuove le entry riuscite. */
  async flush(): Promise<void> {
    if (this.flushing || !navigator.onLine) return;
    this.flushing = true;
    try {
      const entries = await db.outbox.toArray();
      if (!entries.length) return;

      for (const entry of entries) {
        try {
          let error: { message: string } | null = null;

          if (entry.operation === 'upsert') {
            ({ error } = await (supabase.from(entry.table) as ReturnType<typeof supabase.from>)
              .upsert(entry.payload));
          } else {
            ({ error } = await (supabase.from(entry.table) as ReturnType<typeof supabase.from>)
              .delete()
              .eq('id', (entry.payload as { id: string }).id));
          }

          if (!error) {
            await db.outbox.delete(entry.id);
          } else {
            await db.outbox.update(entry.id, {
              attempts: entry.attempts + 1,
              lastError: error.message,
            });
          }
        } catch (err) {
          await db.outbox.update(entry.id, {
            attempts: entry.attempts + 1,
            lastError: err instanceof Error ? err.message : 'unknown',
          });
        }
      }
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Pull completo da Supabase → Dexie.
   * Chiamato al login; aggiorna la cache locale con i dati server più recenti.
   */
  async pull(teamId: string): Promise<void> {
    if (!navigator.onLine) return;
    try {
      const [{ data: cantieriRows }, { data: operaiRows }] = await Promise.all([
        supabase.from('cantieri').select('*').eq('team_id', teamId),
        supabase.from('operai').select('*').eq('team_id', teamId),
      ]);

      if (cantieriRows?.length) {
        const cantieri = (cantieriRows as CantiereRow[]).map((r) => ({
          ...rowToCantiere(r),
          teamId,
        }));
        await db.cantieri.bulkPut(cantieri);
      }

      if (operaiRows?.length) {
        const operai = (operaiRows as OperaioRow[]).map((r) => ({
          ...rowToOperaio(r),
          teamId,
        }));
        await db.operai.bulkPut(operai);
      }
    } catch {
      // Rete non disponibile — la UI leggerà dalla cache Dexie
    }
  }

  /**
   * Migra le righe Dexie senza teamId (create con versioni pre-Supabase)
   * verso Supabase, poi imposta teamId sulla riga locale.
   */
  private async migrateOrphans(teamId: string): Promise<void> {
    if (!navigator.onLine) return;
    try {
      const orphans = await db.cantieri.filter((c) => !c.teamId).toArray();
      if (!orphans.length) return;

      for (const orphan of orphans) {
        try {
          const row = cantiereToRow(orphan, teamId);
          const { error } = await supabase.from('cantieri').upsert(row);
          if (!error) {
            await db.cantieri.put({ ...orphan, teamId });
          } else {
            console.warn('[sync] Migrazione orfano fallita:', orphan.id, error.message);
          }
        } catch (err) {
          console.warn('[sync] Migrazione orfano eccezione:', orphan.id, err);
        }
      }

      // Stessa cosa per operai orfani
      const orphanOperai = await db.operai.filter((o) => !o.teamId).toArray();
      for (const operaio of orphanOperai) {
        try {
          // operai orfani non hanno una controparte Supabase garantita;
          // li tagghiamo solo localmente per non perderli
          await db.operai.put({ ...operaio, teamId });
        } catch {
          // non bloccante
        }
      }
    } catch (err) {
      console.error('[sync] migrateOrphans error:', err);
    }
  }
}

export const syncWorker = new SyncWorker();
