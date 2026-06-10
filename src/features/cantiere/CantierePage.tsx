import { useState } from 'react';
import { Plus, Users, HardHat, Sparkles, BellRing, Phone, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Segmented, useToast } from '@/ui';
import type { Cantiere, CantiereStato } from '@/data/types';
import { CantiereForm } from './CantiereForm';
import { seedCantieriDemo } from '@/data/supabase-cantiere-repo';
import { useCantieri } from '@/hooks/useCantieri';
import { useTeam } from '@/auth/TeamContext';
import {
  formatEuro,
  statoInfo,
  pagamentoInfo,
  totaleCrediti,
  promemoriaPagamenti,
  etichettaScadenza,
} from './logic';

const STATO_ACCENT: Record<CantiereStato, string> = {
  preventivo:  'var(--c-stato-preventivo)',
  confermato:  'var(--c-stato-confermato)',
  in_corso:    'var(--c-stato-in-corso)',
  completato:  'var(--c-stato-completato)',
  contestato:  'var(--c-stato-contestato)',
};

function PromemoriaPagamenti({
  cantieri,
  onApri,
}: {
  cantieri: Cantiere[];
  onApri: (id: string) => void;
}) {
  const promemoria = promemoriaPagamenti(cantieri);
  if (promemoria.length === 0) return null;

  return (
    <div className="bg-card rounded-card border border-line shadow-card dark:shadow-none p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
          <BellRing size={13} className="text-warning" />
        </div>
        <span className="text-[13px] font-bold text-ink uppercase tracking-[0.05em]">
          Promemoria pagamenti
        </span>
      </div>
      <div className="space-y-1.5">
        {promemoria.slice(0, 3).map(({ cantiere: c, giorni }) => (
          <div
            key={c.id}
            onClick={() => onApri(c.id)}
            className="flex items-center gap-3 bg-section rounded-xl px-3 py-2.5 cursor-pointer active:scale-[0.985] transition-transform border border-line/50"
          >
            <div
              className="w-1 self-stretch rounded-full flex-shrink-0 min-h-[32px]"
              style={{ backgroundColor: giorni < 0 ? 'var(--c-danger)' : 'var(--c-warning)' }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink truncate">{c.cliente}</div>
              <div
                className="text-[11px] mt-0.5 font-medium"
                style={{ color: giorni < 0 ? 'var(--c-danger)' : 'var(--c-warning)' }}
              >
                {etichettaScadenza(giorni)} · saldo {formatEuro(c.importo - (c.acconto ?? 0))}
              </div>
            </div>
            {c.telefono && (
              <a
                href={`tel:${c.telefono}`}
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-card border border-line text-ink-2 flex-shrink-0"
                aria-label={`Chiama ${c.cliente}`}
              >
                <Phone size={14} />
              </a>
            )}
            <ChevronRight size={14} className="text-ink-3 flex-shrink-0" />
          </div>
        ))}
      </div>
      {promemoria.length > 3 && (
        <p className="text-[11px] text-ink-3 mt-2 font-medium">
          +{promemoria.length - 3} altri in scadenza
        </p>
      )}
    </div>
  );
}

type Tab = 'tutti' | 'attivi' | 'completati' | 'da_pagare';

export function CantierePage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { team } = useTeam();
  const [tab, setTab] = useState<Tab>('tutti');
  const [formOpen, setFormOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const cantieri = useCantieri();

  const filtered = cantieri.filter((c) => {
    if (tab === 'attivi') return ['confermato', 'in_corso'].includes(c.stato);
    if (tab === 'completati') return c.stato === 'completato';
    if (tab === 'da_pagare') return c.pagamento !== 'saldato';
    return true;
  });

  const crediti = totaleCrediti(cantieri);
  const attivi = cantieri.filter((c) => ['confermato', 'in_corso'].includes(c.stato)).length;
  const isEmpty = cantieri.length === 0;

  async function vediEsempio() {
    if (!team) return;
    setSeeding(true);
    try {
      await seedCantieriDemo(team.id);
      show('Aggiunti 3 cantieri di esempio — modificali o eliminali quando vuoi');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Cantieri"
        action={
          <button
            onClick={() => navigate('/cantiere/operai')}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-ink-2 hover:bg-section active:bg-divider transition-colors"
            aria-label="Operai"
          >
            <Users size={19} />
          </button>
        }
      />

      <Screen>
        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Da riscuotere */}
          <div className="bg-card rounded-card border border-line shadow-card dark:shadow-none overflow-hidden relative">
            <div
              className="kpi-tile-accent"
              style={{ background: crediti > 0 ? 'var(--c-primary)' : 'var(--c-line)' }}
            />
            <div className="p-4">
              <div className="metric-label mb-2">Da riscuotere</div>
              {crediti > 0 ? (
                <>
                  <div className="font-display text-[22px] font-bold tnum leading-tight" style={{ color: 'var(--c-primary)' }}>
                    {formatEuro(crediti)}
                  </div>
                  <TrendingUp size={14} className="absolute top-7 right-3 opacity-30" style={{ color: 'var(--c-primary)' }} />
                </>
              ) : (
                <div className="text-[12px] text-ink-3 leading-snug">
                  Nessun saldo aperto
                </div>
              )}
            </div>
          </div>

          {/* Cantieri attivi */}
          <div className="bg-card rounded-card border border-line shadow-card dark:shadow-none overflow-hidden">
            <div
              className="kpi-tile-accent"
              style={{ background: attivi > 0 ? 'var(--c-stato-in-corso)' : 'var(--c-line)' }}
            />
            <div className="p-4">
              <div className="metric-label mb-2">Cantieri attivi</div>
              {attivi > 0 ? (
                <div className="font-display text-[22px] font-bold tnum text-ink leading-tight">
                  {attivi}
                </div>
              ) : (
                <div className="text-[12px] text-ink-3 leading-snug">
                  Nessun lavoro in corso
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment reminders */}
        <PromemoriaPagamenti cantieri={cantieri} onApri={(id) => navigate(`/cantiere/${id}`)} />

        {/* Filter tabs */}
        <div className="mb-4 w-full">
          <Segmented<Tab>
            options={[
              { value: 'tutti',      label: 'Tutti'     },
              { value: 'attivi',     label: 'Attivi'    },
              { value: 'completati', label: 'Completati'},
              { value: 'da_pagare',  label: 'Da pagare' },
            ]}
            value={tab}
            onChange={setTab}
            className="w-full"
          />
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="mb-4 h-14 w-14 rounded-2xl bg-section border border-line flex items-center justify-center text-ink-3">
              <HardHat size={26} />
            </div>
            <h3 className="font-display text-[16px] font-bold text-ink">
              {isEmpty ? 'Nessun cantiere' : 'Nessun risultato'}
            </h3>
            <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">
              {isEmpty
                ? 'Tocca + per aggiungere il tuo primo cantiere'
                : 'Nessun cantiere in questa categoria'}
            </p>
            {isEmpty && (
              <button
                onClick={vediEsempio}
                disabled={seeding}
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2 bg-section border border-line px-4 py-2.5 rounded-btn active:scale-95 transition-transform disabled:opacity-50"
              >
                <Sparkles size={14} style={{ color: 'var(--c-primary)' }} />
                {seeding ? 'Caricamento...' : 'Carica un esempio'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c: Cantiere, i) => (
              <CantiereCard
                key={c.id}
                cantiere={c}
                delay={Math.min(i, 8) * 35}
                onClick={() => navigate(`/cantiere/${c.id}`)}
              />
            ))}
          </div>
        )}
      </Screen>

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full btn-primary flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Nuovo cantiere"
      >
        <Plus size={24} />
      </button>

      <CantiereForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}

function CantiereCard({
  cantiere: c,
  delay,
  onClick,
}: {
  cantiere: Cantiere;
  delay: number;
  onClick: () => void;
}) {
  const accentColor = STATO_ACCENT[c.stato];
  const sInfo = statoInfo(c.stato);
  const pInfo = pagamentoInfo(c.pagamento);
  const isInCorso = c.stato === 'in_corso';

  return (
    <button
      onClick={onClick}
      className="w-full text-left animate-slide-up active:scale-[0.982] transition-transform duration-150"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-card dark:shadow-none">
        {/* Hazard stripe top border for in_corso cards */}
        {isInCorso && <div className="hazard-stripe-top w-full" />}

        <div className="flex">
          {/* Status accent bar (left) — hidden for in_corso (uses top stripe instead) */}
          {!isInCorso && (
            <div className="w-1 flex-shrink-0 self-stretch" style={{ backgroundColor: accentColor }} />
          )}

          {/* Content */}
          <div className="flex-1 px-3.5 py-3 min-w-0">
            <div className="flex items-start gap-2">
              {/* Left: name + address + badges */}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[16px] text-ink truncate leading-tight">
                  {c.cliente}
                </div>
                {c.indirizzo && (
                  <div className="text-[12px] text-ink-3 truncate mt-0.5">{c.indirizzo}</div>
                )}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color: accentColor,
                      backgroundColor: `color-mix(in srgb, ${accentColor} 13%, transparent)`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accentColor }}
                    />
                    {sInfo.label}
                  </span>
                  {c.pagamento !== 'saldato' && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-warning bg-warning/10">
                      {pInfo.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: amount + metrics */}
              <div className="text-right flex-shrink-0 pl-2">
                <div
                  className="font-display font-bold text-[18px] tnum leading-tight"
                  style={{ color: accentColor }}
                >
                  {formatEuro(c.importo)}
                </div>
                <div className="text-[12px] text-ink-3 tnum mt-0.5">{c.mq} m²</div>
                {c.dataPrevista && (
                  <div className="text-[11px] text-ink-3 mt-0.5 tnum">{c.dataPrevista}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
