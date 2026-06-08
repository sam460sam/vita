import { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Calculator, Truck, AlertTriangle } from 'lucide-react';
import { Sheet } from '@/ui';
import { calcolaCemento } from './logic';

type Step = 0 | 1 | 2 | 3 | 4;

interface TutorState {
  mq: string;
  spessore: string;
  uso: string;
}

const USI = [
  { id: 'industriale', label: 'Industriale', desc: 'Capannoni, magazzini, officine', classe: 'C32/40', spessore: 18 },
  { id: 'residenziale', label: 'Residenziale', desc: 'Case, appartamenti, garage', classe: 'C25/30', spessore: 12 },
  { id: 'esterno', label: 'Esterno / Cortile', desc: 'Piazzali, vialetti, aree esterne', classe: 'C28/35', spessore: 15 },
  { id: 'garage', label: 'Garage / Box', desc: 'Autorimesse, parcheggi coperti', classe: 'C25/30', spessore: 15 },
];

const POMPA_SOGLIA = 6; // sotto i 6 m³ conviene senza pompa

export function CementoTutor({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<TutorState>({ mq: '', spessore: '', uso: '' });

  function reset() {
    setStep(0);
    setState({ mq: '', spessore: '' , uso: '' });
  }

  function handleClose() {
    reset();
    onClose();
  }

  const usoSel = USI.find((u) => u.id === state.uso);
  const mqNum = parseFloat(state.mq) || 0;
  const spessoreNum = parseFloat(state.spessore) || (usoSel?.spessore ?? 12);
  const m3 = mqNum > 0 ? calcolaCemento(mqNum, spessoreNum) : 0;
  const needsPompa = m3 >= POMPA_SOGLIA;

  // Step 0 — intro
  if (step === 0) return (
    <Sheet open={open} onClose={handleClose} title="Tutor cemento" size="full">
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 bg-accent-soft rounded-full flex items-center justify-center mb-4">
          <Calculator size={36} className="text-accent-soft-ink" />
        </div>
        <h2 className="text-[20px] font-bold text-ink mb-2">Calcola il cemento giusto</h2>
        <p className="text-[14px] text-ink-2 text-center max-w-xs leading-relaxed">
          Ti guido passo per passo: quanti m³ ordinare, che classe scegliere,
          se serve la pompa e il messaggio pronto per il rappresentante.
        </p>
      </div>
      <div className="space-y-3 mb-6">
        {[
          { n: 1, text: 'Tipo di utilizzo del pavimento' },
          { n: 2, text: 'Superficie in m²' },
          { n: 3, text: 'Spessore consigliato' },
          { n: 4, text: 'Calcolo finale + classe + pompa' },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-3 px-2">
            <span className="w-7 h-7 rounded-full bg-slate-600 text-white text-[12px] font-bold flex items-center justify-center flex-shrink-0">{s.n}</span>
            <span className="text-[14px] text-ink-2">{s.text}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => setStep(1)}
        className="w-full h-13 py-4 rounded-2xl bg-primary text-on-primary text-[16px] font-semibold"
      >
        Inizia il calcolo →
      </button>
    </Sheet>
  );

  // Step 1 — tipo uso
  if (step === 1) return (
    <Sheet open={open} onClose={handleClose} title="Tipo di pavimento" size="full">
      <p className="text-[14px] text-ink-2 mb-4">
        Il tipo di utilizzo determina la classe del cemento e lo spessore minimo raccomandato.
      </p>
      <div className="space-y-3 mb-6">
        {USI.map((u) => (
          <button
            key={u.id}
            onClick={() => { setState((s) => ({ ...s, uso: u.id, spessore: String(u.spessore) })); setStep(2); }}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
              state.uso === u.id
                ? 'border-primary bg-accent-soft'
                : 'border-line bg-section'
            }`}
          >
            <div className="flex-1">
              <div className="font-semibold text-[15px] text-ink">{u.label}</div>
              <div className="text-[12px] text-ink-3 mt-0.5">{u.desc}</div>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  Classe {u.classe}
                </span>
                <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  ~{u.spessore} cm
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-3 mt-1 flex-shrink-0" />
          </button>
        ))}
      </div>
    </Sheet>
  );

  // Step 2 — m² e spessore
  if (step === 2) return (
    <Sheet open={open} onClose={handleClose} title="Superficie e spessore" size="full">
      <div className="flex items-center gap-2 mb-4 p-3 bg-accent-soft rounded-xl">
        <span className="text-[13px] text-accent-soft-ink">
          Tipo: <strong>{usoSel?.label}</strong> · Classe consigliata: <strong>{usoSel?.classe}</strong>
        </span>
      </div>

      <div className="space-y-5 mb-6">
        <div>
          <label className="text-[13px] font-semibold text-ink-2 block mb-1.5">
            Superficie da gettare (m²) *
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={state.mq}
            onChange={(e) => setState((s) => ({ ...s, mq: e.target.value }))}
            placeholder="es. 150"
            className="w-full h-12 px-4 rounded-xl border border-line bg-white dark:bg-slate-800 text-ink text-[16px] focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-ink-3 mt-1">Misura la lunghezza × larghezza del locale</p>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-ink-2 block mb-1.5">
            Spessore (cm) — consigliato {usoSel?.spessore} cm
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={state.spessore}
            onChange={(e) => setState((s) => ({ ...s, spessore: e.target.value }))}
            placeholder={String(usoSel?.spessore ?? 12)}
            className="w-full h-12 px-4 rounded-xl border border-line bg-white dark:bg-slate-800 text-ink text-[16px] focus:outline-none focus:border-primary"
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Spessore minimo normativo {usoSel?.id === 'industriale' ? '15–20 cm' : '10–15 cm'}
          </p>
        </div>

        {mqNum > 0 && spessoreNum > 0 && (
          <div className="bg-accent-soft rounded-xl p-4 text-center">
            <div className="text-[12px] text-accent-soft-ink mb-0.5">Anteprima m³</div>
            <div className="font-display text-4xl font-extrabold text-accent-soft-ink tnum">{calcolaCemento(mqNum, spessoreNum)}</div>
            <div className="text-[11px] text-accent-soft-ink mt-0.5" style={{ opacity: 0.7 }}>{mqNum} × {spessoreNum} cm × 0.01</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="h-12 px-5 rounded-xl border border-line text-ink-2 font-medium flex items-center gap-1">
          <ChevronLeft size={16} /> Indietro
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!mqNum || !spessoreNum}
          className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-semibold disabled:opacity-40"
        >
          Calcola →
        </button>
      </div>
    </Sheet>
  );

  // Step 3 — risultato + consigli
  if (step === 3) {
    const classeRac = usoSel?.classe ?? 'C25/30';
    const scartoPerc = 5;
    const m3ConScarto = Math.ceil(m3 * (1 + scartoPerc / 100) * 10) / 10;
    return (
      <Sheet open={open} onClose={handleClose} title="Risultato calcolo" size="full">
        {/* Main result */}
        <div className="bg-accent-soft rounded-2xl p-5 mb-4 text-center">
          <div className="text-[13px] text-accent-soft-ink mb-1">m³ da ordinare</div>
          <div className="font-display text-6xl font-extrabold text-accent-soft-ink mb-1 tnum">{m3ConScarto}</div>
          <div className="text-[12px] text-accent-soft-ink" style={{ opacity: 0.7 }}>
            {m3} m³ netti + {scartoPerc}% scarto = {m3ConScarto} m³
          </div>
        </div>

        {/* Pump advice */}
        <div className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${needsPompa ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
          <Truck size={20} className={needsPompa ? 'text-blue-600 flex-shrink-0 mt-0.5' : 'text-green-600 flex-shrink-0 mt-0.5'} />
          <div>
            <div className={`font-semibold text-[14px] ${needsPompa ? 'text-blue-700 dark:text-blue-300' : 'text-green-700 dark:text-green-300'}`}>
              {needsPompa ? 'Serve la pompa' : 'Senza pompa è ok'}
            </div>
            <div className={`text-[12px] mt-0.5 ${needsPompa ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
              {needsPompa
                ? `Con ${m3ConScarto} m³ conviene prenotare la pompa insieme alla macchina.`
                : `Con meno di ${POMPA_SOGLIA} m³ la pompa non è necessaria.`}
            </div>
          </div>
        </div>

        {/* Class + additivi advice */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-2">Classe consigliata</span>
            <span className="font-bold text-[15px] text-ink">{classeRac}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-2">Additivi consigliati</span>
            <span className="text-[13px] font-medium text-ink">
              {usoSel?.id === 'industriale' ? 'Fibre + Indurente' : usoSel?.id === 'esterno' ? 'Impermeabilizzante' : 'Nessuno obbligatorio'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-2">Superfice trattata</span>
            <span className="text-[13px] font-medium text-ink">{mqNum} m²</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-ink-2">Spessore</span>
            <span className="text-[13px] font-medium text-ink">{spessoreNum} cm</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4">
          <AlertTriangle size={15} className="text-warning flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-300">
            Aggiungi sempre 5–10% di scarto per compensare irregolarità del fondo. Per superfici &gt;500 m² consulta un ingegnere strutturale.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(2)} className="h-12 px-5 rounded-xl border border-line text-ink-2 font-medium flex items-center gap-1">
            <ChevronLeft size={16} /> Modifica
          </button>
          <button
            onClick={() => { reset(); onClose(); }}
            className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-semibold flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            Fatto
          </button>
        </div>
      </Sheet>
    );
  }

  return null;
}
