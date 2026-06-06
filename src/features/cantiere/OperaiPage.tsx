import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Phone, Star } from 'lucide-react';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, Button, EmptyState } from '@/ui';
import { db } from '@/data/db';
import type { Operaio } from '@/data/types';
import { OperaioForm } from './OperaioForm';

export function OperaiPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Operaio | undefined>();

  const operai = useLiveQuery(() => db.operai.orderBy('nome').toArray(), [], []);

  function openEdit(o: Operaio) {
    setEditing(o);
    setFormOpen(true);
  }

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  return (
    <>
      <PageHeader title="Operai" back="/cantiere" hideStella />
      <Screen>
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
                      {o.specializzazioni.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {o.specializzazioni.map((s) => (
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
      </Screen>

      <button
        onClick={openNew}
        className="fixed bottom-24 right-4 z-20 w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Nuovo operaio"
      >
        <Plus size={24} />
      </button>

      <OperaioForm open={formOpen} operaio={editing} onClose={() => setFormOpen(false)} />
    </>
  );
}
