import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Phone, Star } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, EmptyState, Segmented } from '@/ui';
import { db } from '@/data/db';
import type { Operaio } from '@/data/types';
import { OperaioForm } from './OperaioForm';
import { DIRECTORY_VENETO } from './directory';
import type { ArtigianoDirectory } from './directory';
import { getMioProfilo } from './profiloRepo';

type TabValue = 'miei' | 'trova';

const VENETO_PROVINCE = ['TV', 'VE', 'PD', 'VI', 'VR', 'BL', 'RO'];

const ALL_PROVINCE_LABELS: Record<string, string> = {
  TV: 'Treviso', VE: 'Venezia', PD: 'Padova', VI: 'Vicenza',
  VR: 'Verona', BL: 'Belluno', RO: 'Rovigo',
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < value ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}
        />
      ))}
    </div>
  );
}

function ArtigianoCard({ a }: { a: ArtigianoDirectory }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[16px] text-ink">{a.nome}</div>
          <div className="text-[13px] text-ink-2 mt-0.5">
            {a.citta} ({a.provincia}) · {a.esperienzaAnni} anni di esperienza
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {a.specializzazioni.map((s) => (
              <span
                key={s}
                className="text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-ink-3 mt-2 leading-relaxed">{a.descrizione}</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StarRating value={a.valutazione} />
          {a.telefono && (
            <a
              href={`tel:${a.telefono}`}
              className="flex items-center gap-1 text-[13px] text-amber-500 font-medium"
            >
              <Phone size={13} />
              Chiama
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}

function defaultProvincia(): string {
  try {
    const profilo = getMioProfilo();
    return profilo?.provincia && VENETO_PROVINCE.includes(profilo.provincia)
      ? profilo.provincia
      : '';
  } catch { return ''; }
}

export function OperaiPage() {
  const [tab, setTab] = useState<TabValue>('miei');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Operaio | undefined>();
  const [filterProv, setFilterProv] = useState<string>(defaultProvincia);

  const operai = useLiveQuery(() => db.operai.orderBy('nome').toArray(), [], []);

  function openEdit(o: Operaio) {
    setEditing(o);
    setFormOpen(true);
  }

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  const filteredDirectory = filterProv
    ? DIRECTORY_VENETO.filter((a) => a.provincia === filterProv)
    : DIRECTORY_VENETO;

  return (
    <>
      <PageHeader title="Operai" back="/cantiere" />
      <Screen>
        <div className="mb-4">
          <Segmented<TabValue>
            value={tab}
            onChange={setTab}
            options={[
              { value: 'miei', label: 'Miei operai' },
              { value: 'trova', label: 'Trova artigiani' },
            ]}
            className="w-full"
          />
        </div>

        {tab === 'miei' && (
          <>
            {(operai ?? []).length === 0 ? (
              <EmptyState
                title="Nessun operaio"
                description="Aggiungi i tuoi collaboratori fidati"
                action={<Button onClick={openNew}>Aggiungi operaio</Button>}
              />
            ) : (
              <div className="space-y-3">
                {(operai ?? []).map((o: Operaio) => (
                  <button key={o.id} className="w-full text-left" onClick={() => openEdit(o)}>
                    <Card>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[16px]">{o.nome}</div>
                          {(o.specializzazioni ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {(o.specializzazioni ?? []).map((s) => (
                                <span
                                  key={s}
                                  className="text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {o.notePrivate && (
                            <p className="text-[12px] text-ink-3 mt-1.5 italic truncate">{o.notePrivate}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                          {o.valutazione != null && (
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < o.valutazione!
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-ink-3'
                                  }
                                />
                              ))}
                            </div>
                          )}
                          {o.telefono && (
                            <a
                              href={`tel:${o.telefono}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-[13px] text-amber-500 font-medium"
                            >
                              <Phone size={13} />
                              Chiama
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'trova' && (
          <>
            {/* Province filter */}
            <div className="mb-4">
              <label className="block text-[12px] font-semibold text-ink-3 mb-1.5 uppercase tracking-wide">
                Filtra per provincia
              </label>
              <select
                value={filterProv}
                onChange={(e) => setFilterProv(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-section border border-line text-[14px] text-ink focus:border-ink/30 outline-none transition-colors appearance-none"
              >
                <option value="">Tutte le province</option>
                {VENETO_PROVINCE.map((p) => (
                  <option key={p} value={p}>
                    {p} — {ALL_PROVINCE_LABELS[p] ?? p}
                  </option>
                ))}
              </select>
            </div>

            {/* Directory list */}
            <div className="space-y-3">
              {filteredDirectory.length === 0 ? (
                <div className="text-center py-10 text-[14px] text-ink-3">
                  Nessun artigiano trovato per questa provincia.
                </div>
              ) : (
                filteredDirectory.map((a) => <ArtigianoCard key={a.id} a={a} />)
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-[11px] text-ink-3 text-center leading-relaxed px-2 pb-2">
              Dati di esempio — la directory pubblica sarà disponibile nella prossima versione
            </div>
          </>
        )}
      </Screen>

      {tab === 'miei' && (
        <button
          onClick={openNew}
          className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Nuovo operaio"
        >
          <Plus size={24} />
        </button>
      )}

      <OperaioForm open={formOpen} operaio={editing} onClose={() => setFormOpen(false)} />
    </>
  );
}
