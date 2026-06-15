import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { syncWorker } from '@/data/sync';

export type MemberRole = 'owner' | 'collaboratore';

export interface Team {
  id: string;
  name: string;
  plan: string;
  trial_ends_at: string;
  role: MemberRole;
  app_mode: string;
}

interface TeamContextValue {
  team: Team | null;
  teamLoading: boolean;
  refreshTeam: () => Promise<void>;
}

const TeamContext = createContext<TeamContextValue | null>(null);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);

  async function loadTeam() {
    if (!user) {
      setTeam(null);
      setTeamLoading(false);
      return;
    }
    setTeamLoading(true);
    try {
      const { data } = await supabase
        .from('team_members')
        .select('role, teams(id, name, plan, trial_ends_at, app_mode)')
        .eq('user_id', user.id)
        .maybeSingle();

      const row = data as { role: MemberRole; teams: Omit<Team, 'role'> | null } | null;
      if (row?.teams) {
        const t: Team = {
          ...row.teams,
          app_mode: row.teams.app_mode ?? 'cantieri',
          role: row.role ?? 'owner',
        };
        setTeam(t);
      } else {
        setTeam(null);
      }
    } catch {
      setTeam(null);
    } finally {
      setTeamLoading(false);
    }
  }

  useEffect(() => {
    loadTeam();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Avvia sync offline-first subito dopo che il team è disponibile
  useEffect(() => {
    if (team?.id) {
      syncWorker.initialize(team.id).catch(console.error);
    }
  }, [team?.id]);

  return (
    <TeamContext.Provider value={{ team, teamLoading, refreshTeam: loadTeam }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error('useTeam must be used within TeamProvider');
  return ctx;
}
