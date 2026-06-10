import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTeam } from '@/auth/TeamContext';
import { rowToCantiere, rowToOperaio, type CantiereRow, type OperaioRow } from '@/data/supabase-cantiere-repo';
import type { Cantiere, Operaio } from '@/data/types';

/** All cantieri for the current team, sorted newest first. Live real-time. */
export function useCantieri(): Cantiere[] {
  const { team } = useTeam();
  const [cantieri, setCantieri] = useState<Cantiere[]>([]);

  useEffect(() => {
    if (!team) return;

    supabase
      .from('cantieri')
      .select('*')
      .eq('team_id', team.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        setCantieri((data as CantiereRow[] ?? []).map(rowToCantiere));
      });

    const ch = supabase
      .channel(`cantieri_team_${team.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'cantieri',
        filter: `team_id=eq.${team.id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setCantieri((prev) => prev.filter((c) => c.id !== (payload.old as { id: string }).id));
        } else {
          const updated = rowToCantiere(payload.new as CantiereRow);
          setCantieri((prev) => {
            const filtered = prev.filter((c) => c.id !== updated.id);
            return [updated, ...filtered].sort((a, b) => b.updatedAt - a.updatedAt);
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [team?.id]);

  return cantieri;
}

/** Single cantiere by id. Returns undefined while loading, null if not found. */
export function useCantiere(id: string | undefined): Cantiere | null | undefined {
  const { team } = useTeam();
  const [cantiere, setCantiere] = useState<Cantiere | null | undefined>(undefined);

  useEffect(() => {
    if (!team || !id) return;

    supabase
      .from('cantieri')
      .select('*')
      .eq('id', id)
      .eq('team_id', team.id)
      .maybeSingle()
      .then(({ data }) => {
        setCantiere(data ? rowToCantiere(data as CantiereRow) : null);
      });

    const ch = supabase
      .channel(`cantiere_${id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'cantieri',
        filter: `id=eq.${id}`,
      }, (payload) => {
        if (payload.eventType === 'DELETE') {
          setCantiere(null);
        } else {
          setCantiere(rowToCantiere(payload.new as CantiereRow));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [team?.id, id]);

  return cantiere;
}

/** Operai for the current team. Optionally filtered by ids. */
export function useOperai(ids?: string[]): Operaio[] {
  const { team } = useTeam();
  const [operai, setOperai] = useState<Operaio[]>([]);

  useEffect(() => {
    if (!team) return;
    if (ids !== undefined && ids.length === 0) {
      setOperai([]);
      return;
    }

    let query = supabase.from('operai').select('*').eq('team_id', team.id);
    if (ids?.length) query = query.in('id', ids);

    query.order('nome').then(({ data }) => {
      setOperai((data as OperaioRow[] ?? []).map(rowToOperaio));
    });

    const ch = supabase
      .channel(`operai_team_${team.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'operai',
        filter: `team_id=eq.${team.id}`,
      }, () => {
        // Re-fetch on any change
        let q = supabase.from('operai').select('*').eq('team_id', team.id);
        if (ids?.length) q = q.in('id', ids);
        q.order('nome').then(({ data: d }) => {
          setOperai((d as OperaioRow[] ?? []).map(rowToOperaio));
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team?.id, ids?.join(',')]);

  return operai;
}
