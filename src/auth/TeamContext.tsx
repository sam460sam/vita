import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

export interface Team {
  id: string;
  name: string;
  plan: string;
  trial_ends_at: string;
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
        .select('teams(id, name, plan, trial_ends_at)')
        .eq('user_id', user.id)
        .maybeSingle();

      const t = (data as { teams: Team | null } | null)?.teams ?? null;
      setTeam(t);
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
