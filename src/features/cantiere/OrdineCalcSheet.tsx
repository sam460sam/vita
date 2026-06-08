import { useState } from 'react';
import { Calculator, ChevronLeft, ChevronRight, AlertTriangle, Phone, MapPin, Copy, Check } from 'lucide-react';
import { Sheet, Field, Input, Select } from '@/ui';
import {
  IMPIANTI_VENETO,
  PROVINCE_VENETO,
  PROVINCE_LABELS,
  mapsUrl,
  type ImpiantoCalcestruzzo,
} from './impianti';
import { calcolaOrdineCemento, generaMessaggioOrdineImpianto, CLASSI_CEMENTO, CARICO_MINIMO_AUTOBETONIERA } from './logic';

type Step = 'calcola' | 'impianto' | 'messaggio';

interface Props {
  open: boolean;
  onClose: () => void;
  provinciaIniziale?: string;
}

export function OrdineCalcSheet({ open, onClose, provinciaIniziale }: Props) {
  const [step, setStep] = useState<Step>('calcola');
  const [mq, setMq] = useState('');
  const [spessore, setSpessore] = useState('15');
  const [scarto, setScarto] = useState('5');
  const [classe, setClasse] = useState('C25/30');
  const [indirizzo, setIndirizzo] = useState('');
  const [filterProv, setFilterProv] = useState(provinciaIniziale ?? '');
  const [impianto, setImpianto] = useState<ImpiantoCalcestruzzo | null>(null);
  const [copiato, setCopiato] = useState(false);

  const mqNum = parseFloat(mq) || 0;
  const spessoreNum = parseFloat(spessore) || 0;
  const scartoNum = parseFloat(scarto) || 0;
  const ordine = mqNum > 0 && spessoreNum > 0 ? calcolaOrdineCemento(mqNum, spessoreNum, scartoNum) : null;

  const filteredImpianti = filterProv
    ? IMPIANTI_VENETO.filter((i) => i.provincia === filterProv)
    : IMPIANTI_VENETO;

  function reset() {
    setStep('calcola');
    setImpianto(null);
    setCopiato(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function scegliImpianto(i: ImpiantoCalcestruzzo) {
    setImpianto(i);
    setStep('messaggio');
  }

  async function copiaMessaggio() {
    if (!impianto || !ordine) return;
    const msg = generaMessaggioOrdineImpianto({
      impiantoNome: impianto.nome,
      m3: ordine.m3DaOrdinare,
      mq: mqNum,
      spessoreCm: spessoreNum,
      classeCemento: classe,
      indirizzo: indirizzo.trim() || 'da confermare',
    });
    await navigator.clipboard.writeText(msg);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  }

  // ---- Step 1: calcolo m³ ----
  if (step === 'calcola') {
    return (
      <Sheet open={open} onClose={handleClose} title="Quanto cemento ordinare" size="full">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 bg-accent-soft rounded-full flex items-center justify-center mb-3">
            <Calculator size={28} className="text-accent-soft-ink" />
          </div>
          <p className="text-[13px] text-ink-2 leading-relaxed max-w-xs">
            Inserisci superficie e spessore: calcolo i m³ netti, aggiungo lo scarto
            e arrotondo al carico minimo dell'autobetoniera.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <Field label="Superficie (m²) *">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={mq}
              onChange={(e) => setMq(e.target.value)}
              placeholder="es. 120"
              className="text-center"
            />
          </Field>
          <Field label="Spessore (cm) *">
            <Input
              type="number"
              inputMode="decimal"
              min={1}
              value={spessore}
              onChange={(e) => setSpessore(e.target.value)}
              placeholder="15"
              className="text-center"
            />
          </Field>
        </div>

        <Field label="Scarto (%)">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            value={scarto}
            onChange={(e) => setScarto(e.target.value)}
            placeholder="5"
            className="text-center"
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Margine consigliato 5–10% per compensare irregolarità del fondo e sprechi di getto.
          </p>
        </Field>

        <Field label="Classe cemento">
          <Select value={classe} onChange={(e) => setClasse(e.target.value)}>
            {CLASSI_CEMENTO.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Indirizzo cantiere (per il messaggio d'ordine)">
          <Input
            value={indirizzo}
            onChange={(e) => setIndirizzo(e.target.value)}
            placeholder="Via Roma 1, Treviso"
          />
        </Field>

        {ordine && (
          <div className="bg-accent-soft rounded-2xl p-5 mb-2 text-center">
            <div className="text-[13px] text-accent-soft-ink mb-1">m³ da ordinare</div>
            <div className="font-display text-6xl font-extrabold text-accent-soft-ink mb-1 tnum">
              {ordine.m3DaOrdinare}
            </div>
            <div className="text-[12px] text-accent-soft-ink" style={{ opacity: 0.75 }}>
              {ordine.m3Netti} m³ netti + {scartoNum}% scarto = {ordine.m3ConScarto} m³ →
              arrotondati al carico autobetoniera
            </div>
            {ordine.sottoMinimo && (
              <div className="flex items-start gap-1.5 mt-3 text-left bg-app/60 dark:bg-black/20 rounded-xl p-2.5">
                <AlertTriangle size={14} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-accent-soft-ink leading-relaxed">
                  Sotto i {CARICO_MINIMO_AUTOBETONIERA} m³ molti impianti applicano un supplemento
                  per piccola quantità: l'ordine è stato arrotondato al carico minimo conveniente.
                  Valuta di accorpare più getti nella stessa consegna.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setStep('impianto')}
          disabled={!ordine}
          className="w-full h-13 py-4 mt-3 rounded-2xl bg-primary text-on-primary text-[16px] font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          Scegli l'impianto e genera il messaggio
          <ChevronRight size={18} />
        </button>
      </Sheet>
    );
  }

  // ---- Step 2: scelta impianto ----
  if (step === 'impianto') {
    return (
      <Sheet open={open} onClose={handleClose} title="Scegli l'impianto" size="full">
        <button
          onClick={() => setStep('calcola')}
          className="flex items-center gap-1 text-[13px] text-ink-2 font-medium mb-3"
        >
          <ChevronLeft size={16} /> Modifica calcolo
        </button>

        {ordine && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-accent-soft rounded-xl">
            <Calculator size={15} className="text-accent-soft-ink flex-shrink-0" />
            <span className="text-[13px] text-accent-soft-ink">
              Ordine: <strong>{ordine.m3DaOrdinare} m³</strong> di <strong>{classe}</strong>
            </span>
          </div>
        )}

        <div className="mb-4">
          <select
            value={filterProv}
            onChange={(e) => setFilterProv(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-section border border-line text-[14px] text-ink focus:border-primary outline-none transition-colors appearance-none"
          >
            <option value="">Tutte le province</option>
            {PROVINCE_VENETO.map((p) => (
              <option key={p} value={p}>{p} — {PROVINCE_LABELS[p]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2.5">
          {filteredImpianti.map((i) => (
            <button
              key={i.id}
              onClick={() => scegliImpianto(i)}
              className="w-full flex items-start gap-3 p-3.5 rounded-xl border border-line bg-section text-left active:scale-[0.985] transition-transform"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px] text-ink leading-snug">{i.nome}</div>
                <div className="flex items-start gap-1 mt-1">
                  <MapPin size={12} className="text-ink-3 flex-shrink-0 mt-0.5" />
                  <span className="text-[12px] text-ink-2 leading-snug">{i.indirizzo}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-ink-3 mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  // ---- Step 3: messaggio d'ordine ----
  if (!impianto || !ordine) return null;
  const messaggio = generaMessaggioOrdineImpianto({
    impiantoNome: impianto.nome,
    m3: ordine.m3DaOrdinare,
    mq: mqNum,
    spessoreCm: spessoreNum,
    classeCemento: classe,
    indirizzo: indirizzo.trim() || 'da confermare',
  });

  return (
    <Sheet open={open} onClose={handleClose} title="Messaggio d'ordine" size="full">
      <button
        onClick={() => setStep('impianto')}
        className="flex items-center gap-1 text-[13px] text-ink-2 font-medium mb-3"
      >
        <ChevronLeft size={16} /> Cambia impianto
      </button>

      <div className="bg-section rounded-xl p-3.5 mb-4">
        <div className="font-semibold text-[15px] text-ink">{impianto.nome}</div>
        <div className="flex items-start gap-1 mt-1">
          <MapPin size={12} className="text-ink-3 flex-shrink-0 mt-0.5" />
          <span className="text-[12px] text-ink-2 leading-snug">{impianto.indirizzo}</span>
        </div>
        <div className="flex items-center gap-3 mt-2.5">
          {impianto.telefono && (
            <a href={`tel:${impianto.telefono.replace(/\s/g, '')}`} className="flex items-center gap-1 text-[13px] font-semibold text-ink-2">
              <Phone size={13} /> {impianto.telefono}
            </a>
          )}
          <a href={mapsUrl(impianto)} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 dark:text-blue-400 font-medium">
            Apri in Maps
          </a>
        </div>
      </div>

      <div className="text-[13px] font-semibold text-ink-2 mb-2">Messaggio pronto da inviare</div>
      <div className="bg-section rounded-xl p-3.5 mb-4 whitespace-pre-line text-[13px] text-ink-2 leading-relaxed">
        {messaggio}
      </div>

      <button
        onClick={copiaMessaggio}
        className={`w-full h-13 py-4 rounded-2xl text-[16px] font-semibold flex items-center justify-center gap-2 transition-colors ${
          copiato ? 'bg-section text-ink-2 border border-line' : 'bg-primary text-on-primary'
        }`}
      >
        {copiato ? <Check size={18} /> : <Copy size={18} />}
        {copiato ? 'Copiato!' : 'Copia messaggio'}
      </button>

      <p className="text-[11px] text-ink-3 mt-2 text-center leading-relaxed">
        Incollalo su WhatsApp, SMS o email — già pronto per {impianto.nome}.
      </p>
    </Sheet>
  );
}
