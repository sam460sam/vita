import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, Clock, Building2 } from 'lucide-react';
import { Button, EmptyState } from '@/ui';
import { getAllWorkDays, saveWorkDay } from '@/data/ore-repo';
import type { WorkDay } from '@/data/types';
import { MESI_IT, tipoInfo } from './ore-logic';
import type { WorkProfile } from '@/data/types';

interface Props {
  profile: WorkProfile;
}

export function OreImpresa({ profile }: Props) {
  const [approvando, setApprovando] = useState<string | null>(null);

  const allDays = useLiveQuery(() => getAllWorkDays(), []) ?? [];

  // Show only days that have been "sent" (inviato or approvato)
  const visible = allDays.filter((w) => w.status !== 'bozza');

  // Group by year-month
  const grouped = visible.reduce<Record<string, WorkDay[]>>((acc, w) => {
    const key = w.data.slice(0, 7); // "yyyy-mm"
    (acc[key] ??= []).push(w);
    return acc;
  }, {});

  const months = Object.keys(grouped).sort().reverse();

  async function approva(day: WorkDay) {
    setApprovando(day.id);
    try {
      await saveWorkDay({ ...day, status: 'approvato' });
    } finally {
      setApprovando(null);
    }
  }

  if (profile.ruolo !== 'impresa') {
    return (
      <div className="bg-section rounded-card p-5 text-center">
        <Building2 size={28} className="mx-auto text-ink-3 mb-2" />
        <p className="text-[14px] font-semibold text-ink mb-1">Vista riservata all'impresa</p>
        <p className="text-[13px] text-ink-2">
          Cambia il ruolo in "Impresa" nella sezione Profilo per accedere a questa vista.
        </p>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<Clock size={28} />}
        title="Nessun foglio ricevuto"
        description="Le giornate inviate dai dipendenti con 'Invia all'impresa' appariranno qui per l'approvazione."
      />
    );
  }

  return (
    <div className="space-y-4">
      {months.map((key) => {
        const [y, m] = key.split('-').map(Number);
        const label = `${MESI_IT[m - 1]} ${y}`;
        const days = grouped[key];
        const totOre = days.reduce((s, d) => s + d.oreCalcolate, 0);

        return (
          <div key={key} className="bg-card rounded-card shadow-card border border-line/60 overflow-hidden">
            {/* Month header */}
            <div className="px-4 py-3 border-b border-line/50 flex items-center justify-between">
              <span className="font-semibold text-[15px] text-ink">{label}</span>
              <span className="text-[13px] text-ink-2 tnum font-medium">{totOre.toFixed(1)} h</span>
            </div>

            {/* Day rows */}
            <div className="divide-y divide-line/40">
              {days.map((day) => {
                const t = tipoInfo(day.tipo);
                const isApproved = day.status === 'approvato';

                return (
                  <div key={day.id} className="px-4 py-3 flex items-center gap-3">
                    {/* Type dot */}
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: t.color }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-semibold text-ink">
                          {new Date(day.data + 'T00:00:00').toLocaleDateString('it-IT', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })}
                        </span>
                        {day.cantiereName && (
                          <span className="text-[12px] text-ink-3 truncate">· {day.cantiereName}</span>
                        )}
                      </div>
                      <div className="text-[12px] text-ink-2 mt-0.5">
                        {t.label} · {day.oraInizio}–{day.oraFine}
                        {day.pausaMinuti > 0 && ` (pausa ${day.pausaMinuti}min)`}
                      </div>
                    </div>

                    {/* Hours */}
                    <span className="text-[14px] font-bold tnum text-ink flex-shrink-0">
                      {day.oreCalcolate.toFixed(1)}h
                    </span>

                    {/* Approve button / checkmark */}
                    {isApproved ? (
                      <CheckCircle2 size={20} className="text-success flex-shrink-0" />
                    ) : (
                      <Button
                        size="sm"
                        variant="subtle"
                        onClick={() => approva(day)}
                        disabled={approvando === day.id}
                        className="flex-shrink-0 text-[12px]"
                      >
                        Approva
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
