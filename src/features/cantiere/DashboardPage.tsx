import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Phone, ChevronRight, AlertCircle, TrendingUp,
  HardHat, CheckCircle2, Clock, ArrowRight, Zap,
} from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { CantiereForm } from './CantiereForm';
import { useCantieri } from '@/hooks/useCantieri';
import { useTeam } from '@/auth/TeamContext';
import type { Cantiere } from '@/data/types';
import {
  formatEuro,
  totaleCrediti,
  promemoriaPagamenti,
  etichettaScadenza,
} from './logic';
import { MeteoWidget } from './MeteoWidget';

// ── Greeting ──────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function dataOggi(): string {
  return new Date().toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ── KPI Card ──────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'orange' | 'green' | 'blue' | 'gray';
}) {
  const COLORS = {
    orange: { accent: 'var(--c-primary)',   bg: 'rgba(245,81,0,0.08)' },
    green:  { accent: 'var(--c-success)',   bg: 'rgba(22,163,74,0.08)' },
    blue:   { accent: 'var(--c-stato-confermato)', bg: 'rgba(37,99,235,0.08)' },
    gray:   { accent: 'var(--c-ink-3)',     bg: 'rgba(130,130,180,0.06)' },
  };
  const { accent, bg } = COLORS[color];

  return (
    <div className="bg-card rounded-2xl border border-line p-3.5 flex flex-col min-w-0">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center mb-2 flex-shrink-0"
        style={{ background: bg }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: accent }} />
      </div>
      <div
        className="font-display font-bold text-[20px] tnum leading-none mb-1"
        style={{ color: accent }}
      >
        {value}
      </div>
      <div className="text-[11px] font-bold text-ink-3 uppercase tracking-wider truncate">{label}</div>
      <div className="text-[10px] text-ink-3 mt-0.5 truncate">{sub}</div>
    </div>
  );
}

// ── Alert Row (overdue / upcoming payment) ────────────────────

function AlertRow({
  cantiere: c,
  giorni,
  onClick,
}: {
  cantiere: Cantiere;
  giorni: number;
  onClick: () => void;
}) {
  const isScaduto = giorni < 0;
  const saldo = c.importo - (c.acconto ?? 0);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl p-3.5 mb-2 border active:scale-[0.982] transition-transform text-left"
      style={{
        background: isScaduto ? 'rgba(220,38,38,0.07)' : 'rgba(217,119,6,0.07)',
        borderColor: isScaduto ? 'rgba(220,38,38,0.25)' : 'rgba(217,119,6,0.25)',
      }}
    >
      <AlertCircle
        size={18}
        className="flex-shrink-0"
        style={{ color: isScaduto ? 'var(--c-danger)' : 'var(--c-warning)' }}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-bold text-ink truncate">{c.cliente}</div>
        <div
          className="text-[11.5px] font-semibold mt-0.5"
          style={{ color: isScaduto ? 'var(--c-danger)' : 'var(--c-warning)' }}
        >
          {etichettaScadenza(giorni)} · {formatEuro(saldo)}
        </div>
      </div>
      {c.telefono && (
        <a
          href={`tel:${c.telefono}`}
          onClick={(e) => e.stopPropagation()}
          className="h-8 w-8 flex items-center justify-center rounded-xl bg-card border border-line text-ink-3 flex-shrink-0"
          aria-label={`Chiama ${c.cliente}`}
        >
          <Phone size={14} />
        </a>
      )}
      <ChevronRight size={15} className="text-ink-3 flex-shrink-0" />
    </button>
  );
}

// ── Active cantiere mini-card ─────────────────────────────────

function ActiveCard({ cantiere: c, onClick }: { cantiere: Cantiere; onClick: () => void }) {
  const isInCorso = c.stato === 'in_corso';
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-line rounded-2xl overflow-hidden active:scale-[0.982] transition-transform"
    >
      {isInCorso && <div className="hazard-stripe-top w-full" />}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isInCorso
              ? 'rgba(245,81,0,0.12)'
              : 'rgba(37,99,235,0.10)',
          }}
        >
          <HardHat
            size={17}
            style={{ color: isInCorso ? 'var(--c-primary)' : 'var(--c-stato-confermato)' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[15px] text-ink truncate">{c.cliente}</div>
          <div className="text-[12px] text-ink-3 truncate mt-0.5">
            {c.mq} m²
            {c.indirizzo && ` · ${c.indirizzo}`}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-display font-bold text-[14px] tnum" style={{ color: 'var(--c-primary)' }}>
            {formatEuro(c.importo)}
          </div>
          {c.dataPrevista && (
            <div className="text-[10.5px] text-ink-3 tnum mt-0.5">
              {new Date(c.dataPrevista).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
        <ChevronRight size={15} className="text-ink-3 flex-shrink-0 ml-1" />
      </div>
    </button>
  );
}

// ── Section header ────────────────────────────────────────────

function SectionHead({ title, onMore }: { title: string; onMore?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[11px] font-black text-ink-3 uppercase tracking-[0.1em]">{title}</span>
      {onMore && (
        <button
          onClick={onMore}
          className="flex items-center gap-1 text-[12px] font-semibold"
          style={{ color: 'var(--c-primary)' }}
        >
          Tutti <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────

function QuickBtn({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'default';
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center gap-1.5 h-20 rounded-2xl border transition-transform active:scale-95',
        variant === 'primary'
          ? 'btn-primary border-transparent'
          : 'bg-card border-line text-ink',
      ].join(' ')}
    >
      <Icon size={20} strokeWidth={2} />
      <span className="text-[12px] font-bold">{label}</span>
    </button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { team } = useTeam();
  const cantieri = useCantieri();
  const [newOpen, setNewOpen] = useState(false);

  const daRiscuotere = totaleCrediti(cantieri);
  const attivi = cantieri.filter((c) => ['confermato', 'in_corso'].includes(c.stato));
  const mese = new Date().toISOString().slice(0, 7);
  const completatiMese = cantieri.filter(
    (c) => c.stato === 'completato' && c.dataCompletamento?.startsWith(mese),
  ).length;
  const promemoria = promemoriaPagamenti(cantieri);
  const allerte = promemoria.filter((p) => p.giorni <= 3);

  return (
    <>
      <PageHeader title="GETTO" subtitle={team?.name} />

      <Screen>
        {/* ── Greeting ── */}
        <div className="pt-1 pb-4">
          <p className="text-[12px] text-ink-3 font-semibold capitalize tracking-wide">{dataOggi()}</p>
          <h1 className="font-display text-[24px] font-extrabold text-ink tracking-tight mt-0.5">
            {greeting()}&nbsp;
            <span className="inline-block animate-stella-float">👷</span>
          </h1>
        </div>

        {/* ── KPI tiles ── */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <KpiCard
            label="Da incassare"
            value={daRiscuotere > 0 ? formatEuro(daRiscuotere) : '—'}
            sub={daRiscuotere > 0 ? 'saldo aperto' : 'tutto a posto'}
            color={daRiscuotere > 0 ? 'orange' : 'gray'}
          />
          <KpiCard
            label="In corso"
            value={String(attivi.length)}
            sub={attivi.length === 1 ? 'cantiere' : 'cantieri'}
            color={attivi.length > 0 ? 'blue' : 'gray'}
          />
          <KpiCard
            label="Completati"
            value={String(completatiMese)}
            sub="questo mese"
            color={completatiMese > 0 ? 'green' : 'gray'}
          />
        </div>

        {/* ── Meteo getto ── */}
        <MeteoWidget />

        {/* ── Allerte pagamenti ── */}
        {allerte.length > 0 && (
          <div className="mb-5">
            <SectionHead title="⚠️  Pagamenti urgenti" />
            {allerte.slice(0, 3).map(({ cantiere: c, giorni }) => (
              <AlertRow
                key={c.id}
                cantiere={c}
                giorni={giorni}
                onClick={() => navigate(`/cantiere/${c.id}`)}
              />
            ))}
            {allerte.length > 3 && (
              <button
                onClick={() => navigate('/cantiere')}
                className="text-[12px] font-semibold mt-1"
                style={{ color: 'var(--c-primary)' }}
              >
                +{allerte.length - 3} altri →
              </button>
            )}
          </div>
        )}

        {/* ── Cantieri attivi ── */}
        {attivi.length > 0 && (
          <div className="mb-5">
            <SectionHead
              title="Lavori in corso"
              onMore={attivi.length > 3 ? () => navigate('/cantiere') : undefined}
            />
            <div className="space-y-2">
              {attivi.slice(0, 3).map((c, i) => (
                <div
                  key={c.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <ActiveCard cantiere={c} onClick={() => navigate(`/cantiere/${c.id}`)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cantieri recenti (se nessun attivo) ── */}
        {attivi.length === 0 && cantieri.length > 0 && (
          <div className="mb-5">
            <SectionHead title="Ultimi cantieri" onMore={() => navigate('/cantiere')} />
            <div className="space-y-2">
              {cantieri.slice(0, 2).map((c, i) => (
                <div
                  key={c.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'backwards' }}
                >
                  <ActiveCard cantiere={c} onClick={() => navigate(`/cantiere/${c.id}`)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Azioni rapide ── */}
        <div className="mb-5">
          <SectionHead title="Azioni rapide" />
          <div className="grid grid-cols-2 gap-2.5">
            <QuickBtn
              icon={Plus}
              label="Nuovo cantiere"
              onClick={() => setNewOpen(true)}
              variant="primary"
            />
            <QuickBtn
              icon={HardHat}
              label="Tutti i lavori"
              onClick={() => navigate('/cantiere')}
            />
          </div>
        </div>

        {/* ── Empty state ── */}
        {cantieri.length === 0 && (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(245,81,0,0.10)' }}
            >
              <Zap size={28} style={{ color: 'var(--c-primary)' }} />
            </div>
            <h2 className="font-display text-[18px] font-extrabold text-ink">
              Inizia il primo cantiere
            </h2>
            <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">
              Aggiungi il tuo primo lavoro per tenere tutto sotto controllo:
              contratti, cemento, firma, incassi.
            </p>
            <button
              onClick={() => setNewOpen(true)}
              className="mt-5 h-12 px-6 rounded-2xl btn-primary font-bold text-[14px] flex items-center gap-2"
            >
              <Plus size={16} />
              Nuovo cantiere
            </button>
          </div>
        )}

        {/* ── Stats footer ── */}
        {cantieri.length > 0 && (
          <div className="flex items-center gap-4 py-4 border-t border-line/60 mb-2">
            <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <TrendingUp size={13} />
              <span className="tnum font-semibold">{cantieri.length}</span>
              <span>cantieri totali</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <CheckCircle2 size={13} className="text-success" />
              <span className="tnum font-semibold">
                {cantieri.filter((c) => c.pagamento === 'saldato').length}
              </span>
              <span>saldati</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
              <Clock size={13} />
              <span className="tnum font-semibold">
                {cantieri.filter((c) => c.stato === 'preventivo').length}
              </span>
              <span>preventivi</span>
            </div>
          </div>
        )}
      </Screen>

      <CantiereForm open={newOpen} onClose={() => setNewOpen(false)} />
    </>
  );
}
