import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/ui';
import { getWorkDaysMonth } from '@/data/ore-repo';
import type { WorkProfile } from '@/data/types';
import {
  riepilogoMese,
  generaCSV,
  condividiCSV,
  TIPI_GIORNATA,
  nomeMese,
  formatEuroOre,
} from './ore-logic';

interface Props {
  profile: WorkProfile;
}

export function OreRiepilogo({ profile }: Props) {
  const today = new Date();
  const [anno, setAnno] = useState(today.getFullYear());
  const [mese, setMese] = useState(today.getMonth() + 1);
  const [exporting, setExporting] = useState(false);

  const workDays = useLiveQuery(() => getWorkDaysMonth(anno, mese), [anno, mese]) ?? [];
  const rie = riepilogoMese(workDays, profile);

  function prevMese() {
    if (mese === 1) { setAnno((a) => a - 1); setMese(12); }
    else setMese((m) => m - 1);
  }

  function nextMese() {
    if (mese === 12) { setAnno((a) => a + 1); setMese(1); }
    else setMese((m) => m + 1);
  }

  async function esporta() {
    setExporting(true);
    try {
      const csv = generaCSV(workDays, nomeMese(anno, mese));
      await condividiCSV(csv, `${anno}-${String(mese).padStart(2, '0')}`);
    } finally {
      setExporting(false);
    }
  }

  const nm = nomeMese(anno, mese);

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMese}
            className="h-9 w-9 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="font-display text-[16px] font-bold text-ink">{nm}</div>
          <button
            onClick={nextMese}
            className="h-9 w-9 flex items-center justify-center rounded-full text-ink-2 hover:bg-section active:scale-90 transition-transform"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-section rounded-xl p-3">
            <div className="text-[11px] text-ink-3 uppercase tracking-wide mb-1">Ore totali</div>
            <div className="font-display text-3xl font-extrabold text-ink tnum">
              {rie.totalOre.toFixed(1)}
            </div>
          </div>
          <div className="bg-section rounded-xl p-3">
            <div className="text-[11px] text-ink-3 uppercase tracking-wide mb-1">Giorni registrati</div>
            <div className="font-display text-3xl font-extrabold text-ink tnum">
              {rie.giorniTotali}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by type */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="text-[13px] font-semibold text-ink mb-3">Dettaglio per tipo</div>
        <div className="space-y-2.5">
          {TIPI_GIORNATA.map((t) => {
            const count = rie.giorniPerTipo[t.value] ?? 0;
            const ore = workDays
              .filter((w) => w.tipo === t.value)
              .reduce((s, w) => s + w.oreCalcolate, 0);
            return (
              <div key={t.value} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="flex-1 text-[14px] text-ink font-medium">{t.label}</span>
                <span className="text-[13px] text-ink-2 tnum font-semibold">{count}g</span>
                <span className="text-[13px] text-ink-2 tnum w-14 text-right">{ore.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payroll card */}
      {profile.tariffaOraria > 0 && (
        <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
          <div className="text-[13px] font-semibold text-ink mb-3">Retribuzione stimata</div>

          <div className="space-y-2 text-[14px]">
            <div className="flex justify-between">
              <span className="text-ink-2">Ore ordinarie</span>
              <span className="tnum font-medium text-ink">{rie.oreLavorate.toFixed(1)} h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Tariffa oraria</span>
              <span className="tnum font-medium text-ink">{formatEuroOre(profile.tariffaOraria)}/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-2">Totale ore (incluse assenze pagate)</span>
              <span className="tnum font-medium text-ink">{rie.totalOre.toFixed(1)} h</span>
            </div>
            <div className="pt-2 border-t border-line/50 flex justify-between">
              <span className="text-ink-2 font-semibold">Lordo</span>
              <span className="tnum font-bold text-ink text-[16px]">{formatEuroOre(rie.lordo)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-3">INPS ({profile.aliquotaINPS}%)</span>
              <span className="tnum text-ink-3">
                -{formatEuroOre((rie.lordo * profile.aliquotaINPS) / 100)}
              </span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-ink-3">IRPEF ({profile.aliquotaIRPEF}%)</span>
              <span className="tnum text-ink-3">
                -{formatEuroOre((rie.lordo * profile.aliquotaIRPEF) / 100)}
              </span>
            </div>
            <div className="pt-2 border-t border-line/50 flex justify-between">
              <span className="font-bold text-ink">Netto stimato</span>
              <span className="tnum font-extrabold text-success text-[18px]">
                {formatEuroOre(rie.netto)}
              </span>
            </div>
          </div>

          <p className="text-[10.5px] text-ink-3 mt-3">
            Stima indicativa. Non include detrazioni personali, addizionali regionali/comunali
            o altri contributi. Verifica sempre con un consulente del lavoro.
          </p>
        </div>
      )}

      {/* Export CSV */}
      {workDays.length > 0 && (
        <Button
          onClick={esporta}
          block
          size="lg"
          variant="subtle"
          disabled={exporting}
          icon={<Download size={18} />}
        >
          {exporting ? 'Esportazione…' : `Esporta CSV — ${nm}`}
        </Button>
      )}
    </div>
  );
}
