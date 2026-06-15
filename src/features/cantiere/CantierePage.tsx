import { useState } from 'react';
import { Plus, HardHat, Phone, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import type { Cantiere, CantiereStato } from '@/data/types';
import { CantiereForm } from './CantiereForm';
import { seedCantieriDemo } from '@/data/supabase-cantiere-repo';
import { useCantieri } from '@/hooks/useCantieri';
import { useTeam } from '@/auth/TeamContext';
import { useToast } from '@/ui';
import {
  formatEuro,
  statoInfo,
  pagamentoInfo,
  totaleCrediti,
} from './logic';

// ── Status config ─────────────────────────────────────────────

const STATO_COLOR: Record<CantiereStato, string> = {
  preventivo:  'var(--c-stato-preventivo)',
  confermato:  'var(--c-stato-confermato)',
  in_corso:    'var(--c-stato-in-corso)',
  completato:  'var(--c-stato-completato)',
  contestato:  'var(--c-stato-contestato)',
};

// ── Filter tabs ───────────────────────────────────────────────

type Tab = 'tutti' | 'attivi' | 'completati' | 'da_pagare';

const TABS: { value: Tab; label: string }[] = [
  { value: 'tutti',      label: 'Tutti'      },
  { value: 'attivi',     label: 'Attivi'     },
  { value: 'completati', label: 'Completati' },
  { value: 'da_pagare',  label: 'Da pagare'  },
];

// ── KPI strip ─────────────────────────────────────────────────

function KpiStrip({ cantieri }: { cantieri: Cantiere[] }) {
  const crediti = totaleCrediti(cantieri);
  const attivi = cantieri.filter((c) => ['confermato', 'in_corso'].includes(c.stato)).length;
  const saldati = cantieri.filter((c) => c.pagamento === 'saldato').length;

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      {[
        {
          label: 'Da incassare',
          value: crediti > 0 ? formatEuro(crediti) : '—',
          color: crediti > 0 ? 'var(--c-primary)' : 'var(--c-ink-3)',
        },
        {
          label: 'Attivi',
          value: String(attivi),
          color: attivi > 0 ? 'var(--c-stato-confermato)' : 'var(--c-ink-3)',
        },
        {
          label: 'Saldati',
          value: String(saldati),
          color: saldati > 0 ? 'var(--c-stato-completato)' : 'var(--c-ink-3)',
        },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-card rounded-2xl border border-line p-3 text-center">
          <div className="font-display font-extrabold text-[18px] tnum leading-none" style={{ color }}>
            {value}
          </div>
          <div className="text-[10px] font-bold text-ink-3 uppercase tracking-wider mt-1.5">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cantiere card ─────────────────────────────────────────────

function CantiereCard({
  cantiere: c,
  delay,
  onClick,
}: {
  cantiere: Cantiere;
  delay: number;
  onClick: () => void;
}) {
  const accent = STATO_COLOR[c.stato];
  const sInfo = statoInfo(c.stato);
  const pInfo = pagamentoInfo(c.pagamento);
  const isInCorso = c.stato === 'in_corso';

  return (
    <button
      onClick={onClick}
      className="w-full text-left animate-slide-up active:scale-[0.980] transition-transform duration-150"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        {/* Hazard stripe — only for in_corso */}
        {isInCorso && <div className="hazard-stripe-top" />}

        <div className="p-4">
          {/* Row 1: status badge + amount */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span
                className="h-[7px] w-[7px] rounded-full flex-shrink-0"
                style={{ backgroundColor: accent }}
              />
              <span
                className="text-[10.5px] font-extrabold uppercase tracking-widest"
                style={{ color: accent }}
              >
                {sInfo.label}
              </span>
            </div>
            <span
              className="font-display font-extrabold text-[17px] tnum"
              style={{ color: 'var(--c-primary)' }}
            >
              {formatEuro(c.importo)}
            </span>
          </div>

          {/* Row 2: cliente name */}
          <div className="font-display font-bold text-[17px] text-ink leading-tight">
            {c.cliente}
          </div>

          {/* Row 3: address */}
          {c.indirizzo && (
            <div className="text-[12.5px] text-ink-3 mt-0.5 truncate">{c.indirizzo}</div>
          )}

          {/* Row 4: metrics + phone + arrow */}
          <div className="flex items-center justify-between mt-3">
            {/* Metrics */}
            <div className="flex items-center gap-1.5 text-[12px] text-ink-3 font-medium flex-wrap min-w-0">
              <span className="tnum">{c.mq}&thinsp;m²</span>
              <span className="opacity-30">·</span>
              <span className="tnum">{c.spessore}&thinsp;cm</span>
              {c.dataPrevista && (
                <>
                  <span className="opacity-30">·</span>
                  <span className="tnum">
                    {new Date(c.dataPrevista).toLocaleDateString('it-IT', {
                      day: '2-digit', month: 'short',
                    })}
                  </span>
                </>
              )}
              {c.pagamento !== 'saldato' && (
                <>
                  <span className="opacity-30">·</span>
                  <span className="font-bold" style={{ color: 'var(--c-warning)' }}>
                    {pInfo.label}
                  </span>
                </>
              )}
              {c.pagamento === 'saldato' && (
                <>
                  <span className="opacity-30">·</span>
                  <span className="font-bold" style={{ color: 'var(--c-success)' }}>
                    Saldato ✓
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {c.telefono && (
                <a
                  href={`tel:${c.telefono}`}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-8 flex items-center justify-center rounded-xl bg-section border border-line text-ink-3 transition-colors active:bg-divider"
                  aria-label={`Chiama ${c.cliente}`}
                >
                  <Phone size={14} />
                </a>
              )}
              <div className="h-8 w-8 flex items-center justify-center rounded-xl text-ink-3">
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────

export function CantierePage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { team } = useTeam();
  const [tab, setTab] = useState<Tab>('tutti');
  const [formOpen, setFormOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const cantieri = useCantieri();

  const filtered = cantieri.filter((c) => {
    if (tab === 'attivi')     return ['confermato', 'in_corso'].includes(c.stato);
    if (tab === 'completati') return c.stato === 'completato';
    if (tab === 'da_pagare')  return c.pagamento !== 'saldato';
    return true;
  });

  async function vediEsempio() {
    if (!team) return;
    setSeeding(true);
    try {
      await seedCantieriDemo(team.id);
      show('3 cantieri di esempio aggiunti — modificali o eliminali');
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <PageHeader title="I tuoi lavori" />

      <Screen>
        {/* KPI strip */}
        {cantieri.length > 0 && <KpiStrip cantieri={cantieri} />}

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5">
          {TABS.map(({ value, label }) => {
            const active = tab === value;
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className="flex-shrink-0 h-8 px-3.5 rounded-xl text-[12.5px] font-bold transition-all duration-150"
                style={
                  active
                    ? { background: 'var(--c-primary)', color: '#fff' }
                    : { background: 'var(--c-card)', color: 'var(--c-ink-2)', border: '1px solid var(--c-line)' }
                }
              >
                {label}
                {value === 'da_pagare' && cantieri.filter(c=>c.pagamento!=='saldato').length > 0 && (
                  <span
                    className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black"
                    style={{ background: active ? 'rgba(255,255,255,0.25)' : 'rgba(245,81,0,0.15)', color: active ? '#fff' : 'var(--c-primary)' }}
                  >
                    {cantieri.filter(c=>c.pagamento!=='saldato').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div
              className="h-16 w-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'var(--c-section)' }}
            >
              <HardHat size={28} className="text-ink-3" />
            </div>
            <h3 className="font-display text-[17px] font-bold text-ink">
              {cantieri.length === 0 ? 'Nessun cantiere' : 'Nessun risultato'}
            </h3>
            <p className="text-[13px] text-ink-3 mt-1.5 max-w-xs leading-relaxed">
              {cantieri.length === 0
                ? 'Tocca + per aggiungere il tuo primo cantiere'
                : 'Nessun cantiere in questa categoria'}
            </p>
            {cantieri.length === 0 && (
              <button
                onClick={vediEsempio}
                disabled={seeding}
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold bg-card border border-line px-5 py-3 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"
              >
                <Sparkles size={14} style={{ color: 'var(--c-primary)' }} />
                {seeding ? 'Caricamento…' : 'Mostra un esempio'}
              </button>
            )}
            {tab !== 'tutti' && cantieri.length > 0 && (
              <button
                onClick={() => setTab('tutti')}
                className="mt-4 text-[13px] font-semibold flex items-center gap-1"
                style={{ color: 'var(--c-primary)' }}
              >
                <Filter size={13} /> Mostra tutti
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((c: Cantiere, i) => (
              <CantiereCard
                key={c.id}
                cantiere={c}
                delay={Math.min(i, 8) * 40}
                onClick={() => navigate(`/cantiere/${c.id}`)}
              />
            ))}
          </div>
        )}
      </Screen>

      {/* FAB */}
      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full btn-primary flex items-center justify-center active:scale-90 transition-transform shadow-glow-md"
        aria-label="Nuovo cantiere"
      >
        <Plus size={24} />
      </button>

      <CantiereForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
