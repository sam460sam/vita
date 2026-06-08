import { useState, useEffect } from 'react';
import { Star, BookUser } from 'lucide-react';
import { Sheet, Field, Input, Textarea, Button } from '@/ui';
import { useToast } from '@/ui';
import { saveOperaio, deleteOperaio } from '@/data/cantiere-repo';
import type { Operaio } from '@/data/types';
import { SPECIALIZZAZIONI } from './logic';

declare global {
  interface Navigator {
    contacts?: {
      select: (props: string[], opts?: { multiple?: boolean }) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
    };
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  operaio?: Operaio;
}

export function OperaioForm({ open, onClose, operaio }: Props) {
  const { show } = useToast();
  const [nome, setNome] = useState('');
  const [telefono, setTelefono] = useState('');
  const [specializzazioni, setSpecializzazioni] = useState<string[]>([]);
  const [valutazione, setValutazione] = useState<1 | 2 | 3 | 4 | 5 | undefined>();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) return;
    if (operaio) {
      setNome(operaio.nome);
      setTelefono(operaio.telefono ?? '');
      setSpecializzazioni(operaio.specializzazioni);
      setValutazione(operaio.valutazione);
      setNote(operaio.notePrivate ?? '');
    } else {
      setNome('');
      setTelefono('');
      setSpecializzazioni([]);
      setValutazione(undefined);
      setNote('');
    }
  }, [operaio, open]);

  function toggleSpec(s: string) {
    setSpecializzazioni((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function importContact() {
    if (!navigator.contacts) return;
    try {
      const results = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (results.length > 0) {
        const c = results[0];
        if (c.name?.[0]) setNome(c.name[0]);
        if (c.tel?.[0]) setTelefono(c.tel[0]);
      }
    } catch { /* user cancelled */ }
  }

  async function save() {
    if (!nome.trim()) return;
    await saveOperaio({
      nome: nome.trim(),
      telefono: telefono.trim() || undefined,
      specializzazioni,
      valutazione,
      notePrivate: note.trim() || undefined,
      attivo: true,
      id: operaio?.id,
    });
    show(operaio ? 'Operaio aggiornato' : 'Operaio salvato');
    onClose();
  }

  async function destroy() {
    if (!operaio) return;
    if (!confirm('Eliminare operaio?')) return;
    await deleteOperaio(operaio.id);
    show('Operaio eliminato');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={operaio ? 'Modifica operaio' : 'Nuovo operaio'}
      footer={
        <div className="flex flex-col gap-2">
          <Button onClick={save} block disabled={!nome.trim()}>
            {operaio ? 'Aggiorna' : 'Aggiungi operaio'}
          </Button>
          {operaio && (
            <Button variant="danger" onClick={destroy} block>
              Elimina
            </Button>
          )}
        </div>
      }
    >
      <Field label="Nome *">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Mario Rossi"
          autoFocus
        />
      </Field>

      <Field label="Telefono">
        <div className="flex gap-2">
          <Input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+39 333 000 0000"
            className="flex-1"
          />
          {navigator.contacts && (
            <button
              type="button"
              onClick={importContact}
              className="flex-shrink-0 h-11 px-3 rounded-xl bg-section border border-line text-ink-2 flex items-center gap-1.5 text-[13px] font-medium active:bg-divider"
            >
              <BookUser size={16} />
              Contatti
            </button>
          )}
        </div>
      </Field>

      <div className="mb-4">
        <div className="text-[13px] font-semibold text-ink-2 mb-2">Specializzazioni</div>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZZAZIONI.map((s) => (
            <button
              key={s}
              onClick={() => toggleSpec(s)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
                specializzazioni.includes(s)
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-section text-ink-2 border-line'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-[13px] font-semibold text-ink-2 mb-2">Valutazione (privata)</div>
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button key={n} onClick={() => setValutazione(n === valutazione ? undefined : n)}>
              <Star
                size={30}
                className={
                  n <= (valutazione ?? 0)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-ink-3'
                }
              />
            </button>
          ))}
        </div>
      </div>

      <Field label="Note private">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Affidabile, puntuale… solo tu puoi vederle"
        />
      </Field>
    </Sheet>
  );
}
