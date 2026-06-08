import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Users, HardHat, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card, Segmented, useToast } from '@/ui';
import { db } from '@/data/db';
import type { Cantiere } from '@/data/types';
import { CantiereForm } from './CantiereForm';
import { seedCantieriDemo } from '@/data/cantiere-repo';
import { formatEuro, statoInfo, pagamentoInfo, totaleCrediti } from './logic';

type Tab = 'tutti' | 'attivi' | 'completati' | 'da_pagare';

export function CantierePage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [tab, setTab] = useState<Tab>('tutti');
  const [formOpen, setFormOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const cantieri = useLiveQuery(() => db.cantieri.orderBy('updatedAt').reverse().toArray(), [], []);

  const filtered = (cantieri ?? []).filter((c) => {
    if (tab === 'attivi') return ['confermato', 'in_corso'].includes(c.stato);
    if (tab === 'completati') return c.stato === 'completato';
    if (tab === 'da_pagare') return c.pagamento !== 'saldato';
    return true;
  });

  const crediti = totaleCrediti(cantieri ?? []);
  const attivi = (cantieri ?? []).filter((c) => ['confermato', 'in_corso'].includes(c.stato)).length;
  const isEmpty = (cantieri ?? []).length === 0;

  async function vediEsempio() {
    setSeeding(true);
    try {
      await seedCantieriDemo();
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
            className="h-10 w-10 flex items-center justify-center rounded-full text-ink-2 hover:bg-section"
            aria-label="Operai"
          >
            <Users size={20} />
          </button>
        }
      />
      <Screen>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <div className="text-[11px] text-ink-2 uppercase tracking-wide mb-1">Da riscuotere</div>
            {crediti > 0 ? (
              <div className="font-display text-2xl font-bold text-primary tnum">{formatEuro(crediti)}</div>
            ) : (
              <div className="text-[13px] text-ink-3 leading-snug pt-0.5">Qui vedrai quanto devi ancora incassare</div>
            )}
          </Card>
          <Card>
            <div className="text-[11px] text-ink-2 uppercase tracking-wide mb-1">Cantieri attivi</div>
            {attivi > 0 ? (
              <div className="font-display text-2xl font-bold text-ink tnum">{attivi}</div>
            ) : (
              <div className="text-[13px] text-ink-3 leading-snug pt-0.5">Qui vedrai i lavori in corso</div>
            )}
          </Card>
        </div>

        <div className="mb-4 w-full">
          <Segmented<Tab>
            options={[
              { value: 'tutti', label: 'Tutti' },
              { value: 'attivi', label: 'Attivi' },
              { value: 'completati', label: 'Completati' },
              { value: 'da_pagare', label: 'Da pagare' },
            ]}
            value={tab}
            onChange={setTab}
            className="w-full"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-6">
            <div className="mb-3 h-12 w-12 rounded-full bg-section flex items-center justify-center text-ink-3">
              <HardHat size={24} />
            </div>
            <h3 className="text-[15px] font-semibold text-ink">Nessun cantiere</h3>
            <p className="text-[13px] text-ink-2 mt-1 max-w-xs">
              {isEmpty ? 'Tocca + qui sotto per aggiungere il tuo primo cantiere' : 'Nessun cantiere in questa categoria'}
            </p>
            {isEmpty && (
              <button
                onClick={vediEsempio}
                disabled={seeding}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 bg-section px-4 py-2.5 rounded-btn active:scale-95 transition-transform disabled:opacity-50"
              >
                <Sparkles size={15} className="text-primary" />
                {seeding ? 'Aggiungo...' : 'Vedi un esempio'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c: Cantiere, i) => (
              <button
                key={c.id}
                className="w-full text-left animate-fade-in active:scale-[0.985] transition-transform duration-150"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms`, animationFillMode: 'backwards' }}
                onClick={() => navigate(`/cantiere/${c.id}`)}
              >
                <Card>
                  <div className="flex items-start gap-3">
                    {c.foto.length > 0 && (
                      <img
                        src={c.foto[0]}
                        alt="Foto cantiere"
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[16px] truncate">{c.cliente}</div>
                      {c.indirizzo && <div className="text-[13px] text-ink-2 truncate mt-0.5">{c.indirizzo}</div>}
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statoInfo(c.stato).color}`}>
                          {statoInfo(c.stato).label}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${pagamentoInfo(c.pagamento).color}`}>
                          {pagamentoInfo(c.pagamento).label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold text-[17px] tnum">{formatEuro(c.importo)}</div>
                      <div className="text-[12px] text-ink-2">{c.mq} m²</div>
                      {c.dataPrevista && <div className="text-[11px] text-ink-3 mt-1">{c.dataPrevista}</div>}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}
      </Screen>

      <button
        onClick={() => setFormOpen(true)}
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Nuovo cantiere"
      >
        <Plus size={24} />
      </button>

      <CantiereForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
