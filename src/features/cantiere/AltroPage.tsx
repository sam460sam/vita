import { useNavigate } from 'react-router-dom';
import { Clock, StickyNote, Factory, Info, Shield, LogOut, ChevronRight, CloudSun, BarChart2, type LucideIcon } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { useTeam } from '@/auth/TeamContext';
import { useAuth } from '@/auth/AuthContext';

interface LinkRowProps {
  icon: LucideIcon;
  label: string;
  sub?: string;
  onClick: () => void;
  accent?: string;
  danger?: boolean;
}

function LinkRow({ icon: Icon, label, sub, onClick, accent, danger }: LinkRowProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-card border-b border-line/50 last:border-b-0 active:bg-section transition-colors text-left"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger
            ? 'rgba(220,38,38,0.10)'
            : accent
              ? `color-mix(in srgb, ${accent} 12%, transparent)`
              : 'var(--c-section)',
        }}
      >
        <Icon
          size={18}
          strokeWidth={1.8}
          style={{
            color: danger ? 'var(--c-danger)' : accent ?? 'var(--c-ink-2)',
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[14px] font-semibold"
          style={{ color: danger ? 'var(--c-danger)' : 'var(--c-ink)' }}
        >
          {label}
        </div>
        {sub && <div className="text-[12px] text-ink-3 mt-0.5">{sub}</div>}
      </div>
      <ChevronRight size={16} className="text-ink-3 flex-shrink-0" />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-black text-ink-3 uppercase tracking-[0.08em] mb-2 px-1">{title}</p>
      <div className="bg-card rounded-2xl border border-line overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function AltroPage() {
  const navigate = useNavigate();
  const { team } = useTeam();
  const { signOut } = useAuth();

  return (
    <>
      <PageHeader title="Altro" />
      <Screen>
        {/* Team banner */}
        {team && (
          <div
            className="rounded-2xl p-4 mb-5 border"
            style={{
              background: 'rgba(245,81,0,0.06)',
              borderColor: 'rgba(245,81,0,0.20)',
            }}
          >
            <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider mb-1">
              Team attivo
            </div>
            <div className="font-display font-extrabold text-[18px] text-ink">{team.name}</div>
            <div className="text-[12px] text-ink-3 mt-0.5">
              Piano: {team.plan === 'pro' ? 'Pro' : 'Free'}
              {team.trial_ends_at && (
                <span> · prova fino al {new Date(team.trial_ends_at).toLocaleDateString('it-IT')}</span>
              )}
            </div>
          </div>
        )}

        <Section title="Strumenti">
          <LinkRow
            icon={BarChart2}
            label="Cruscotto finanziario"
            sub="Incassato, da riscuotere, scaduti"
            onClick={() => navigate('/finanze')}
            accent="var(--c-success)"
          />
          <LinkRow
            icon={CloudSun}
            label="Meteo getto"
            sub="Condizioni ottimali per il calcestruzzo"
            onClick={() => navigate('/meteo')}
            accent="var(--c-stato-confermato)"
          />
          <LinkRow
            icon={Clock}
            label="Ore lavoro"
            sub="Traccia le ore della giornata"
            onClick={() => navigate('/ore')}
            accent="var(--c-ore)"
          />
          <LinkRow
            icon={StickyNote}
            label="Note"
            sub="Appunti e documenti cantiere"
            onClick={() => navigate('/note')}
            accent="var(--c-note)"
          />
          <LinkRow
            icon={Factory}
            label="Impianti cemento"
            sub="Directory fornitori — ordine WhatsApp"
            onClick={() => navigate('/cantiere/impianti')}
            accent="var(--c-ink-2)"
          />
        </Section>

        <Section title="Informazioni">
          <LinkRow
            icon={Info}
            label="Info app"
            sub="Versione, novità, tutorial"
            onClick={() => navigate('/info')}
          />
          <LinkRow
            icon={Shield}
            label="Privacy & Termini"
            sub="Documenti legali"
            onClick={() => navigate('/privacy')}
          />
        </Section>

        <Section title="Account">
          <LinkRow
            icon={LogOut}
            label="Esci"
            sub="Disconnetti da questo dispositivo"
            onClick={async () => { await signOut(); }}
            danger
          />
        </Section>

        <p className="text-center text-[10.5px] text-ink-3 mt-6 mb-2">
          GETTO · Gestionale per pavimenti in calcestruzzo
        </p>
      </Screen>
    </>
  );
}
