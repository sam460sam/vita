import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Users, HardHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, EmptyState, Segmented } from '@/ui';
import { db } from '@/data/db';
import type { Cantiere } from '@/data/types';
import { CantiereForm } from './CantiereForm';
import { formatEuro, statoInfo, pagamentoInfo, totaleCrediti } from './logic';

type Tab = 'tutti' | 'attivi' | 'completati' | 'da_pagare';

export function CantierePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('tutti');
  const [formOpen, setFormOpen] = useState(false);

  const cantieri = useLiveQuery(() => db.cantieri.orderBy('updatedAt').reverse().toArray(), [], []);

  const filtered = (cantieri ?? []).filter((c) => {
    if (tab === 'attivi') return ['confermato', 'in_corso'].includes(c.stato);
    if (tab === 'completati') return c.stato === 'completato';
    if (tab === 'da_pagare') return c.pagamento !== 'saldato';
    return true;
  });

  const crediti = totaleCrediti(cantieri ?? []);
  const attivi = (cantieri ?? []).filter((c) => ['confermato', 'in_corso'].includes(c.stato)).length;

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
            <div className="text-2xl font-bold text-amber-600">{formatEuro(crediti)}</div>
          </Card>
          <Card>
            <div className="text-[11px] text-ink-2 uppercase tracking-wide mb-1">Cantieri attivi</div>
            <div className="text-2xl font-bold">{attivi}</div>
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
          <EmptyState
            icon={<HardHat size={24} />}
            title="Nessun cantiere"
            description="Aggiungi il primo cantiere"
            action={<Button onClick={() => setFormOpen(true)}>Nuovo cantiere</Button>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((c: Cantiere) => (
              <button key={c.id} className="w-full text-left" onClick={() => navigate(`/cantiere/${c.id}`)}>
                <Card>
                  <div className="flex items-start gap-3">
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
                      <div className="font-bold text-[17px]">{formatEuro(c.importo)}</div>
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
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Nuovo cantiere"
      >
        <Plus size={24} />
      </button>

      <CantiereForm open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
