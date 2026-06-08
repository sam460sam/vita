import { useState, useEffect } from 'react';
import { Plus, X, RefreshCw } from 'lucide-react';
import { Sheet, Button, Input, Textarea, Select } from '@/ui';
import { uid, db } from '@/data/db';
import { saveGiornaleEntry, getGiornaleEntry } from '@/data/giornale-repo';
import { fetchMeteoPerIndirizzo } from './meteo-api';
import type { ManodoporaVoce, AttrezzaturaVoce, MaterialeVoce } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  cantiereId: string;
  data: string; // ISO yyyy-MM-dd
}

const METEO_OPTIONS = [
  { value: 'sereno', emoji: '☀️', label: 'Sereno' },
  { value: 'poco_nuvoloso', emoji: '🌤', label: 'Poco nuv.' },
  { value: 'nuvoloso', emoji: '⛅', label: 'Nuvoloso' },
  { value: 'coperto', emoji: '☁️', label: 'Coperto' },
  { value: 'pioggia', emoji: '🌧', label: 'Pioggia' },
  { value: 'neve', emoji: '🌨', label: 'Neve' },
  { value: 'temporale', emoji: '⛈', label: 'Temporale' },
  { value: 'vento', emoji: '💨', label: 'Vento' },
];

const GIORNI_IT = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

function formatDataItaliana(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${GIORNI_IT[date.getDay()]} ${d} ${MESI_IT[m - 1]} ${y}`;
}

const UNITA_OPTIONS = ['m³', 'm²', 't', 'kg', 'sacchi', 'lt', 'pz'];

export function GiornaleSheet({ open, onClose, cantiereId, data }: Props) {
  const [meteo, setMeteo] = useState('');
  const [temperatura, setTemperatura] = useState<number | null>(null);
  const [vento, setVento] = useState<number | null>(null);
  const [meteoLoading, setMeteoLoading] = useState(false);
  const [condTerreno, setCondTerreno] = useState('');
  const [note, setNote] = useState('');
  const [manodopera, setManodopera] = useState<ManodoporaVoce[]>([]);
  const [attrezzature, setAttrezzature] = useState<AttrezzaturaVoce[]>([]);
  const [materiali, setMateriali] = useState<MaterialeVoce[]>([]);
  const [saving, setSaving] = useState(false);

  async function aggiornaMeteo() {
    setMeteoLoading(true);
    try {
      const cantiere = await db.cantieri.get(cantiereId);
      const indirizzo = cantiere?.indirizzo ?? cantiere?.cliente;
      if (!indirizzo) return;
      const wx = await fetchMeteoPerIndirizzo(indirizzo);
      if (wx) {
        setMeteo(wx.meteoKey);
        setTemperatura(wx.temperatura);
        setVento(wx.vento);
      }
    } finally {
      setMeteoLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    getGiornaleEntry(cantiereId, data).then((entry) => {
      if (entry) {
        setMeteo(entry.meteo ?? '');
        setTemperatura(entry.temperatura ?? null);
        setVento(entry.vento ?? null);
        setCondTerreno(entry.condTerrenoViabilita ?? '');
        setNote(entry.note ?? '');
        setManodopera(entry.manodopera);
        setAttrezzature(entry.attrezzature);
        setMateriali(entry.materiali);
        // Refresh weather if entry is today (might have changed since last save)
        if (!entry.meteo) aggiornaMeteo();
      } else {
        setMeteo('');
        setTemperatura(null);
        setVento(null);
        setCondTerreno('');
        setNote('');
        setManodopera([]);
        setAttrezzature([]);
        setMateriali([]);
        // Auto-fetch for new entries
        aggiornaMeteo();
      }
    });
  }, [open, cantiereId, data]); // eslint-disable-line react-hooks/exhaustive-deps

  function addManodopera() {
    setManodopera((prev) => [...prev, { id: uid('m'), nome: '', ore: 8, attivita: '' }]);
  }

  function updateManodopera(id: string, field: keyof ManodoporaVoce, value: string | number) {
    setManodopera((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }

  function removeManodopera(id: string) {
    setManodopera((prev) => prev.filter((v) => v.id !== id));
  }

  function addAttrezzatura() {
    setAttrezzature((prev) => [...prev, { id: uid('a'), nome: '', quantita: 1 }]);
  }

  function updateAttrezzatura(id: string, field: keyof AttrezzaturaVoce, value: string | number) {
    setAttrezzature((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }

  function removeAttrezzatura(id: string) {
    setAttrezzature((prev) => prev.filter((v) => v.id !== id));
  }

  function addMateriale() {
    setMateriali((prev) => [...prev, { id: uid('mat'), nome: '', quantita: 1, unita: 'm³' }]);
  }

  function updateMateriale(id: string, field: keyof MaterialeVoce, value: string | number) {
    setMateriali((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  }

  function removeMateriale(id: string) {
    setMateriali((prev) => prev.filter((v) => v.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveGiornaleEntry({
        cantiereId,
        data,
        meteo: meteo || undefined,
        temperatura: temperatura ?? undefined,
        vento: vento ?? undefined,
        condTerrenoViabilita: condTerreno || undefined,
        note: note || undefined,
        manodopera,
        attrezzature,
        materiali,
        foto: [],
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={formatDataItaliana(data)}
      size="full"
      footer={
        <Button onClick={handleSave} disabled={saving} variant="primary" className="w-full">
          {saving ? 'Salvataggio...' : 'Salva'}
        </Button>
      }
    >
      {/* Meteo */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">
            Meteo
            {temperatura !== null && (
              <span className="ml-2 text-[13px] font-bold text-ink normal-case tracking-normal">
                {temperatura}°C
                {vento !== null && vento > 15 && (
                  <span className="text-ink-3 font-normal"> · 💨 {vento} km/h</span>
                )}
              </span>
            )}
          </div>
          <button
            onClick={aggiornaMeteo}
            disabled={meteoLoading}
            className="flex items-center gap-1 text-[12px] text-primary font-semibold disabled:opacity-50"
          >
            <RefreshCw size={12} className={meteoLoading ? 'animate-spin' : ''} />
            {meteoLoading ? 'Rilevamento...' : 'Aggiorna'}
          </button>
        </div>
        {meteoLoading && !meteo ? (
          <div className="text-[13px] text-ink-3 py-2">Rilevamento meteo in corso...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {METEO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMeteo(meteo === opt.value ? '' : opt.value)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                  meteo === opt.value ? 'bg-primary text-on-primary' : 'bg-section text-ink-2'
                }`}
              >
                <span className="text-[20px] leading-none">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Condizioni terreno */}
      <div className="mb-5">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-2">Condizioni terreno / viabilità</div>
        <Input
          value={condTerreno}
          onChange={(e) => setCondTerreno(e.target.value)}
          placeholder="Es. terreno asciutto, accesso difficile..."
        />
      </div>

      {/* Manodopera */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">Manodopera</div>
          <button
            onClick={addManodopera}
            className="flex items-center gap-1 text-[12px] text-primary font-semibold"
          >
            <Plus size={14} />
            Aggiungi
          </button>
        </div>
        <div className="space-y-3">
          {manodopera.map((v) => (
            <div key={v.id} className="bg-section rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={v.nome}
                  onChange={(e) => updateManodopera(v.id, 'nome', e.target.value)}
                  placeholder="Nome operaio"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={String(v.ore)}
                  onChange={(e) => updateManodopera(v.id, 'ore', Number(e.target.value))}
                  placeholder="Ore"
                  className="w-16"
                />
                <span className="text-[12px] text-ink-3">h</span>
                <button onClick={() => removeManodopera(v.id)} className="text-ink-3 hover:text-red-500 flex-shrink-0">
                  <X size={16} />
                </button>
              </div>
              <Input
                value={v.attivita ?? ''}
                onChange={(e) => updateManodopera(v.id, 'attivita', e.target.value)}
                placeholder="Attività svolta"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Attrezzature */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">Attrezzature</div>
          <button
            onClick={addAttrezzatura}
            className="flex items-center gap-1 text-[12px] text-primary font-semibold"
          >
            <Plus size={14} />
            Aggiungi
          </button>
        </div>
        <div className="space-y-2">
          {attrezzature.map((v) => (
            <div key={v.id} className="flex items-center gap-2 bg-section rounded-xl p-3">
              <Input
                value={v.nome}
                onChange={(e) => updateAttrezzatura(v.id, 'nome', e.target.value)}
                placeholder="Attrezzatura"
                className="flex-1"
              />
              <Input
                type="number"
                value={String(v.quantita)}
                onChange={(e) => updateAttrezzatura(v.id, 'quantita', Number(e.target.value))}
                placeholder="Qtà"
                className="w-16"
              />
              <button onClick={() => removeAttrezzatura(v.id)} className="text-ink-3 hover:text-red-500 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Materiali */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">Materiali</div>
          <button
            onClick={addMateriale}
            className="flex items-center gap-1 text-[12px] text-primary font-semibold"
          >
            <Plus size={14} />
            Aggiungi
          </button>
        </div>
        <div className="space-y-2">
          {materiali.map((v) => (
            <div key={v.id} className="flex items-center gap-2 bg-section rounded-xl p-3">
              <Input
                value={v.nome}
                onChange={(e) => updateMateriale(v.id, 'nome', e.target.value)}
                placeholder="Materiale"
                className="flex-1"
              />
              <Input
                type="number"
                value={String(v.quantita)}
                onChange={(e) => updateMateriale(v.id, 'quantita', Number(e.target.value))}
                placeholder="Qtà"
                className="w-16"
              />
              <Select
                value={v.unita}
                onChange={(e) => updateMateriale(v.id, 'unita', e.target.value)}
                className="w-20"
              >
                {UNITA_OPTIONS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </Select>
              <button onClick={() => removeMateriale(v.id)} className="text-ink-3 hover:text-red-500 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mb-4">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-2">Note</div>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Annotazioni, problemi riscontrati, lavori eseguiti..."
          rows={4}
        />
      </div>
    </Sheet>
  );
}
