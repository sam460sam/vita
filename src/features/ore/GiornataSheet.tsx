import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { Sheet, Button, Field, Input, Textarea, Select } from '@/ui';
import { saveWorkDay, deleteWorkDay, WORKER_ID } from '@/data/ore-repo';
import type { WorkDay, WorkDayType } from '@/data/types';
import {
  TIPI_GIORNATA,
  calcolaOre,
  calcolaRetribuzione,
  defaultOrari,
  formatEuroOre,
} from './ore-logic';
import type { WorkProfile } from '@/data/types';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  date: string;               // yyyy-MM-dd
  existing?: WorkDay | null;
  profile: WorkProfile;
  onClose: () => void;
  onSaved: () => void;
}

export function GiornataSheet({ open, date, existing, profile, onClose, onSaved }: Props) {
  const cantieri = (
    useLiveQuery(() => db.cantieri.toArray().then((rows) => rows.sort((a, b) => a.cliente.localeCompare(b.cliente))), []) ?? []
  );

  const [tipo, setTipo] = useState<WorkDayType>('lavorativa');
  const [oraInizio, setOraInizio] = useState('08:00');
  const [oraFine, setOraFine] = useState('17:00');
  const [pausaMinuti, setPausaMinuti] = useState(60);
  const [cantiereId, setCantiereId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTipo(existing.tipo);
      setOraInizio(existing.oraInizio);
      setOraFine(existing.oraFine);
      setPausaMinuti(existing.pausaMinuti);
      setCantiereId(existing.cantiereId ?? '');
      setNote(existing.note ?? '');
    } else {
      setTipo('lavorativa');
      setOraInizio('08:00');
      setOraFine('17:00');
      setPausaMinuti(60);
      setCantiereId('');
      setNote('');
    }
  }, [open, existing]);

  function handleTipoChange(t: WorkDayType) {
    setTipo(t);
    const info = TIPI_GIORNATA.find((x) => x.value === t)!;
    if (info.defaultOre !== null) {
      const { oraInizio: s, oraFine: e } = defaultOrari(info.defaultOre ?? profile.oreDefaultGiornata);
      setOraInizio(s);
      setOraFine(e);
      setPausaMinuti(0);
    }
  }

  const oreCalcolate = calcolaOre(oraInizio, oraFine, pausaMinuti);
  const retrib = calcolaRetribuzione(oreCalcolate, profile.tariffaOraria, profile.aliquotaIRPEF, profile.aliquotaINPS);

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  async function salva(status: WorkDay['status'] = 'bozza') {
    setSaving(true);
    try {
      const selectedCantiere = cantieri.find((c) => c.id === cantiereId);
      await saveWorkDay({
        id: existing?.id,
        data: date,
        tipo,
        oraInizio,
        oraFine,
        pausaMinuti,
        oreCalcolate,
        cantiereId: cantiereId || undefined,
        cantiereName: selectedCantiere?.cliente,
        note: note.trim() || undefined,
        status,
        workerId: WORKER_ID,
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function elimina() {
    if (!existing) return;
    setDeleting(true);
    try {
      await deleteWorkDay(existing.id);
      onSaved();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const titleDate = new Date(date + 'T00:00:00').toLocaleDateString('it-IT', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={existing ? `Modifica — ${titleDate}` : titleDate}
      size="full"
      footer={
        <div className="space-y-2">
          <Button
            onClick={() => salva('bozza')}
            block
            size="lg"
            disabled={saving}
          >
            {saving ? 'Salvataggio…' : 'Salva giornata'}
          </Button>
          {profile.ruolo === 'dipendente' && (
            <Button
              onClick={() => salva('inviato')}
              block
              size="md"
              variant="ghost"
              disabled={saving}
            >
              Invia all'impresa
            </Button>
          )}
          {existing && (
            <Button
              onClick={elimina}
              block
              variant="danger"
              size="sm"
              disabled={deleting}
            >
              {deleting ? 'Eliminazione…' : 'Elimina giornata'}
            </Button>
          )}
        </div>
      }
    >
      {/* Date heading */}
      <p className="text-[13px] text-ink-2 capitalize mb-4">{dateLabel}</p>

      {/* Day type chips */}
      <div className="mb-4">
        <label className="block text-[13px] font-semibold text-ink-2 mb-2">Tipo giornata</label>
        <div className="grid grid-cols-3 gap-2">
          {TIPI_GIORNATA.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTipoChange(t.value)}
              className={cn(
                'py-2.5 rounded-xl text-[13px] font-semibold transition-transform active:scale-95 border-2',
                tipo === t.value ? 'text-white border-transparent' : 'text-ink-2 bg-section border-line/60',
              )}
              style={tipo === t.value ? { backgroundColor: t.color, borderColor: t.color } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time inputs */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Field label="Inizio">
          <Input type="time" value={oraInizio} onChange={(e) => setOraInizio(e.target.value)} />
        </Field>
        <Field label="Fine">
          <Input type="time" value={oraFine} onChange={(e) => setOraFine(e.target.value)} />
        </Field>
        <Field label="Pausa (min)">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={480}
            value={pausaMinuti}
            onChange={(e) => setPausaMinuti(Number(e.target.value) || 0)}
          />
        </Field>
      </div>

      {/* Ore riepilogo */}
      <div className="bg-section rounded-xl p-3 mb-4 flex items-center justify-between">
        <span className="text-[13px] text-ink-2 font-medium">Ore calcolate</span>
        <span className="font-display text-2xl font-bold text-ink tnum">{oreCalcolate.toFixed(1)} h</span>
      </div>

      {/* Cantiere select */}
      <Field label="Cantiere (opzionale)">
        <Select value={cantiereId} onChange={(e) => setCantiereId(e.target.value)}>
          <option value="">— Nessun cantiere —</option>
          {cantieri.map((c) => (
            <option key={c.id} value={c.id}>{c.cliente} — {c.indirizzo ?? ''}</option>
          ))}
        </Select>
      </Field>

      {/* Note */}
      <Field label="Note (opzionale)">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Aggiungi una nota…"
          className="min-h-[80px]"
        />
      </Field>

      {/* Retribuzione preview */}
      {profile.tariffaOraria > 0 && oreCalcolate > 0 && (
        <div className="mt-2 rounded-xl border border-line bg-card p-4">
          <div className="text-[12px] font-semibold text-ink-2 uppercase tracking-wide mb-3">
            Retribuzione calcolata
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-ink-3 mb-0.5">Lordo</div>
              <div className="font-display text-xl font-bold text-ink tnum">{formatEuroOre(retrib.lordo)}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">{formatEuroOre(profile.tariffaOraria)}/h</div>
            </div>
            <div>
              <div className="text-[11px] text-ink-3 mb-0.5">Netto stimato</div>
              <div className="font-display text-xl font-bold text-success tnum">{formatEuroOre(retrib.netto)}</div>
              <div className="text-[11px] text-ink-3 mt-0.5">
                -{(profile.aliquotaIRPEF + profile.aliquotaINPS).toFixed(2)}%
              </div>
            </div>
          </div>
          <p className="text-[10px] text-ink-3 mt-2">
            Stima indicativa. Non considera detrazioni, addizionali o contributi aggiuntivi.
          </p>
        </div>
      )}
    </Sheet>
  );
}
