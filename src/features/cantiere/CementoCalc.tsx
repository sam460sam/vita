import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, CardHeader, Button, Field, Input, Select } from '@/ui';
import { saveCantiere } from '@/data/cantiere-repo';
import type { Cantiere } from '@/data/types';
import { calcolaCemento, generaMessaggioCemento, CLASSI_CEMENTO, ADDITIVI } from './logic';

export function CementoCalc({ cantiere }: { cantiere: Cantiere }) {
  const m3 = calcolaCemento(cantiere.mq, cantiere.spessore);
  const [classe, setClasse] = useState(cantiere.classeCemento ?? 'C30/37');
  const [additivi, setAdditivi] = useState<string[]>(cantiere.additivi);
  const [dataConsegna, setDataConsegna] = useState('');
  const [ora, setOra] = useState('07:00');
  const [copiato, setCopiato] = useState(false);

  function toggleAdditivo(a: string) {
    setAdditivi((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function copia() {
    const msg = generaMessaggioCemento({
      m3,
      classeCemento: classe,
      additivi,
      dataConsegna: dataConsegna || '___',
      ora,
      indirizzo: cantiere.indirizzo ?? 'indirizzo da confermare',
    });
    await navigator.clipboard.writeText(msg);
    await saveCantiere({ ...cantiere, classeCemento: classe, additivi });
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  }

  return (
    <Card className="mb-4">
      <CardHeader title="Calcola cemento" />

      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4 text-center">
        <div className="text-[13px] text-amber-700 dark:text-amber-300 mb-1">m³ stimati</div>
        <div className="text-5xl font-bold text-amber-600">{m3}</div>
        <div className="text-[12px] text-amber-600/70 mt-1">
          {cantiere.mq} m² × {cantiere.spessore} cm
        </div>
      </div>

      <Field label="Classe cemento">
        <Select value={classe} onChange={(e) => setClasse(e.target.value)}>
          {CLASSI_CEMENTO.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </Field>

      <div className="mb-4">
        <div className="text-[13px] font-semibold text-ink-2 mb-2">Additivi</div>
        <div className="flex flex-wrap gap-2">
          {ADDITIVI.map((a) => (
            <button
              key={a}
              onClick={() => toggleAdditivo(a)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                additivi.includes(a)
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-section text-ink-2 border-line'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Data consegna">
          <Input type="date" value={dataConsegna} onChange={(e) => setDataConsegna(e.target.value)} />
        </Field>
        <Field label="Ora">
          <Input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />
        </Field>
      </div>

      <Button onClick={copia} block variant={copiato ? 'ghost' : 'primary'}>
        {copiato ? (
          <>
            <Check size={16} className="mr-2" />
            Copiato!
          </>
        ) : (
          <>
            <Copy size={16} className="mr-2" />
            Copia messaggio WhatsApp
          </>
        )}
      </Button>
    </Card>
  );
}
