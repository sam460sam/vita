import { useState } from 'react';
import { Building2, ArrowRight, Users, HardHat, PenTool } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthContext';
import { useTeam } from '@/auth/TeamContext';

const FEATURES = [
  {
    icon: HardHat,
    title: 'Cantieri condivisi',
    desc: 'Tutto il team vede lo stesso cantiere in tempo reale.',
  },
  {
    icon: Users,
    title: 'Gestione operai',
    desc: 'Assegna operai ai cantieri e traccia le ore lavorate.',
  },
  {
    icon: PenTool,
    title: 'Verbale firmato',
    desc: 'Il cliente firma il preventivo sul tuo telefono — protezione legale.',
  },
];

export function TeamSetupScreen() {
  const { user } = useAuth();
  const { refreshTeam } = useTeam();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function creaTeam() {
    if (!nome.trim() || !user || loading) return;
    setLoading(true);
    setError('');
    try {
      const { data: team, error: teamErr } = await supabase
        .from('teams')
        .insert({ name: nome.trim() })
        .select()
        .single();
      if (teamErr) throw teamErr;

      const { error: memberErr } = await supabase
        .from('team_members')
        .insert({ team_id: team.id, user_id: user.id, role: 'owner' });
      if (memberErr) throw memberErr;

      await refreshTeam();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore durante la creazione');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6"
        style={{ background: 'linear-gradient(160deg, #1C1C26 0%, #0C0C10 100%)' }}
      >
        <div className="w-16 h-16 rounded-[18px] bg-card border border-line flex items-center justify-center mb-5">
          <Building2 size={32} style={{ color: 'var(--c-primary)' }} />
        </div>
        <h1 className="font-display text-[26px] font-bold text-white tracking-tight text-center">
          Crea la tua azienda
        </h1>
        <p className="text-[14px] mt-1.5 text-center max-w-[260px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Inizia il tuo periodo di prova gratuito di 14 giorni
        </p>
      </div>

      {/* Features */}
      <div className="px-5 py-6 space-y-4">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-card border border-line flex items-center justify-center flex-shrink-0">
              <Icon size={17} style={{ color: 'var(--c-primary)' }} />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-ink">{title}</div>
              <div className="text-[12px] text-ink-3 mt-0.5 leading-relaxed">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="px-5 space-y-3 pb-10">
        <div className="bg-card border border-line rounded-[14px] p-4 shadow-card">
          <label className="block text-[11px] font-bold text-ink-3 uppercase tracking-[0.06em] mb-2">
            Nome azienda o ditta
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setError(''); }}
            placeholder="Es. Pavimentazioni Rossi Srl"
            autoFocus
            className="w-full h-11 px-3 bg-section border border-line rounded-[10px] text-[15px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => e.key === 'Enter' && creaTeam()}
          />
          {error && <p className="text-[12px] text-danger mt-2">{error}</p>}
        </div>

        <button
          onClick={creaTeam}
          disabled={loading || !nome.trim()}
          className="w-full h-[52px] btn-primary rounded-[14px] flex items-center justify-center gap-2 text-[15px] font-bold disabled:opacity-50"
        >
          {loading ? 'Creazione in corso…' : (
            <>
              Inizia prova gratuita
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <p className="text-[11px] text-ink-3 text-center">
          14 giorni gratis · poi €39,99/mese o €400/anno · cancella quando vuoi
        </p>
      </div>
    </div>
  );
}
