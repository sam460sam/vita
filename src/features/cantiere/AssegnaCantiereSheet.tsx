import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { MessageCircle } from 'lucide-react';
import { Sheet, Field, Select, Input, Button } from '@/ui';
import { db } from '@/data/db';
import type { Cantiere, Operaio } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  operaio: Operaio | undefined;
}

function fmtDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function AssegnaCantiereSheet({ open, onClose, operaio }: Props) {
  const cantieri = useLiveQuery<Cantiere[], Cantiere[]>(
    () => db.cantieri.toArray().then((arr) => arr.sort((a, b) => a.cliente.localeCompare(b.cliente))),
    [],
    [],
  );

  const [cantiereId, setCantiereId] = useState('');
  const [mq, setMq] = useState('');
  const [data, setData] = useState('');
  const [ora, setOra] = useState('');

  const selected = cantieri.find((c) => c.id === cantiereId);

  useEffect(() => {
    if (!open) return;
    setCantiereId('');
    setMq('');
    setData('');
    setOra('');
  }, [open]);

  useEffect(() => {
    if (selected) setMq(selected.mq ? String(selected.mq) : '');
  }, [cantiereId]); // eslint-disable-line react-hooks/exhaustive-deps

  function sendWhatsApp() {
    if (!operaio?.telefono || !selected) return;
    const luogo = selected.indirizzo
      ? `${selected.cliente} — ${selected.indirizzo}`
      : selected.cliente;
    const mqPart = mq ? ` (${mq} m²)` : '';
    const quando = data
      ? ` il ${fmtDate(data)}${ora ? ` alle ${ora}` : ''}`
      : '';
    const msg =
      `Ciao ${operaio.nome}! 👷\n` +
      `Sei assegnato al cantiere: ${luogo}${mqPart}${quando}.\n` +
      `Conferma disponibilità. Grazie!`;
    const tel = operaio.telefono.replace(/[\s\-()]/g, '').replace(/^\+/, '');
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(msg)}`, '_blank');
    onClose();
  }

  const canSend = !!operaio?.telefono && !!cantiereId;

  return (
    <Sheet open={open} onClose={onClose} title={`Assegna cantiere — ${operaio?.nome ?? ''}`}>
      <Field label="Cantiere">
        <Select
          value={cantiereId}
          onChange={(e) => setCantiereId(e.target.value)}
        >
          <option value="">Seleziona cantiere...</option>
          {cantieri.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cliente}{c.indirizzo ? ` — ${c.indirizzo}` : ''}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="m²">
          <Input
            type="number"
            min={0}
            value={mq}
            onChange={(e) => setMq(e.target.value)}
            placeholder="100"
          />
        </Field>
        <Field label="Orario">
          <Input
            type="time"
            value={ora}
            onChange={(e) => setOra(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Data">
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </Field>

      {!operaio?.telefono && (
        <p className="text-[13px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl mb-1">
          Aggiungi il numero di telefono all'operaio per inviare su WhatsApp.
        </p>
      )}

      {cantiereId && operaio?.telefono && (
        <div className="bg-section rounded-xl px-3 py-2.5 mb-1">
          <p className="text-[12px] font-semibold text-ink-2 mb-1">Anteprima messaggio</p>
          <p className="text-[12px] text-ink-3 leading-relaxed whitespace-pre-line">
            {`Ciao ${operaio.nome}! 👷\nSei assegnato al cantiere: ${selected?.indirizzo ? `${selected?.cliente} — ${selected?.indirizzo}` : (selected?.cliente ?? '')}${mq ? ` (${mq} m²)` : ''}${data ? ` il ${fmtDate(data)}${ora ? ` alle ${ora}` : ''}` : ''}.\nConferma disponibilità. Grazie!`}
          </p>
        </div>
      )}

      <Button
        block
        disabled={!canSend}
        icon={<MessageCircle size={17} />}
        onClick={sendWhatsApp}
        className="mt-3"
      >
        Manda su WhatsApp
      </Button>
    </Sheet>
  );
}
