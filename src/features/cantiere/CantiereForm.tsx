import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookUser } from 'lucide-react';
import { Sheet, Field, Input, Select, Textarea, Button } from '@/ui';
import { useToast } from '@/ui';
import { saveCantiere, deleteCantiere } from '@/data/cantiere-repo';
import type { Cantiere } from '@/data/types';
import { STATI, PAGAMENTI, TIPO_USO } from './logic';

declare global {
  interface Navigator {
    contacts?: {
      select: (
        props: string[],
        opts?: { multiple?: boolean },
      ) => Promise<Array<{ name?: string[]; tel?: Array<{ value: string }> }>>;
    };
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  cantiere?: Cantiere;
}

type FormState = Omit<Cantiere, 'id' | 'createdAt' | 'updatedAt'>;

const DEFAULT: FormState = {
  cliente: '',
  mq: 0,
  spessore: 15,
  tipoUso: 'residenziale',
  stato: 'preventivo',
  importo: 0,
  pagamento: 'da_pagare',
  foto: [],
  operaiIds: [],
  additivi: [],
};

export function CantiereForm({ open, onClose, cantiere }: Props) {
  const navigate = useNavigate();
  const { show } = useToast();
  const [form, setForm] = useState<FormState>({ ...DEFAULT });

  useEffect(() => {
    if (!open) return;
    if (cantiere) {
      setForm({
        cliente: cantiere.cliente,
        telefono: cantiere.telefono,
        indirizzo: cantiere.indirizzo,
        mq: cantiere.mq,
        spessore: cantiere.spessore,
        tipoUso: cantiere.tipoUso,
        stato: cantiere.stato,
        importo: cantiere.importo,
        acconto: cantiere.acconto,
        dataPrevista: cantiere.dataPrevista,
        dataCompletamento: cantiere.dataCompletamento,
        note: cantiere.note,
        pagamento: cantiere.pagamento,
        scadenzaPagamento: cantiere.scadenzaPagamento,
        dataPagamento: cantiere.dataPagamento,
        classeCemento: cantiere.classeCemento,
        foto: cantiere.foto,
        firmaCliente: cantiere.firmaCliente,
        operaiIds: cantiere.operaiIds,
        additivi: cantiere.additivi,
      });
    } else {
      setForm({ ...DEFAULT });
    }
  }, [cantiere, open]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.cliente.trim()) return;
    const id = await saveCantiere({ ...form, id: cantiere?.id });
    show(cantiere ? 'Cantiere aggiornato' : 'Cantiere salvato');
    onClose();
    if (!cantiere) navigate(`/cantiere/${id}`);
  }

  async function importContact() {
    if (!navigator.contacts) return;
    try {
      const [contact] = await navigator.contacts.select(['name', 'tel'], { multiple: false });
      if (!contact) return;
      if (contact.name?.[0]) set('cliente', contact.name[0]);
      if (contact.tel?.[0]?.value) set('telefono', contact.tel[0].value.replace(/\s/g, ''));
    } catch { /* user cancelled */ }
  }

  async function destroy() {
    if (!cantiere) return;
    if (!confirm('Eliminare il cantiere?')) return;
    await deleteCantiere(cantiere.id);
    show('Cantiere eliminato');
    onClose();
    navigate('/cantiere');
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={cantiere ? 'Modifica cantiere' : 'Nuovo cantiere'}
      footer={
        <div className="flex flex-col gap-2">
          <Button onClick={save} block disabled={!form.cliente.trim()}>
            {cantiere ? 'Aggiorna' : 'Crea cantiere'}
          </Button>
          {cantiere && (
            <Button variant="danger" onClick={destroy} block>
              Elimina cantiere
            </Button>
          )}
        </div>
      }
    >
      <Field label="Cliente *">
        <div className="flex gap-2">
          <Input
            value={form.cliente}
            onChange={(e) => set('cliente', e.target.value)}
            placeholder="Nome cliente o azienda"
            className="flex-1"
          />
          {navigator.contacts && (
            <button
              type="button"
              onClick={importContact}
              className="h-11 w-11 flex items-center justify-center rounded-btn bg-section border border-line text-amber-500 flex-shrink-0"
              title="Importa contatto"
            >
              <BookUser size={18} />
            </button>
          )}
        </div>
      </Field>

      <Field label="Telefono">
        <Input
          type="tel"
          value={form.telefono ?? ''}
          onChange={(e) => set('telefono', e.target.value || undefined)}
          placeholder="+39 333 000 0000"
        />
      </Field>

      <Field label="Indirizzo cantiere">
        <Input
          value={form.indirizzo ?? ''}
          onChange={(e) => set('indirizzo', e.target.value || undefined)}
          placeholder="Via Roma 1, Milano"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="m²">
          <Input
            type="number"
            min={0}
            value={form.mq || ''}
            onChange={(e) => set('mq', Number(e.target.value))}
            placeholder="100"
            className="text-center"
          />
        </Field>
        <Field label="Spessore (cm)">
          <Input
            type="number"
            min={1}
            value={form.spessore || ''}
            onChange={(e) => set('spessore', Number(e.target.value))}
            placeholder="15"
            className="text-center"
          />
        </Field>
      </div>

      <Field label="Utilizzo">
        <Select value={form.tipoUso} onChange={(e) => set('tipoUso', e.target.value as Cantiere['tipoUso'])}>
          {TIPO_USO.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Importo (€)">
          <Input
            type="number"
            min={0}
            value={form.importo || ''}
            onChange={(e) => set('importo', Number(e.target.value))}
            placeholder="0"
            className="text-center"
          />
        </Field>
        <Field label="Acconto (€)">
          <Input
            type="number"
            min={0}
            value={form.acconto ?? ''}
            onChange={(e) => set('acconto', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0"
            className="text-center"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Stato">
          <Select value={form.stato} onChange={(e) => set('stato', e.target.value as Cantiere['stato'])}>
            {STATI.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Pagamento">
          <Select value={form.pagamento} onChange={(e) => set('pagamento', e.target.value as Cantiere['pagamento'])}>
            {PAGAMENTI.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Data prevista">
        <Input
          type="date"
          value={form.dataPrevista ?? ''}
          onChange={(e) => set('dataPrevista', e.target.value || undefined)}
        />
      </Field>

      <Field label="Note">
        <Textarea
          value={form.note ?? ''}
          onChange={(e) => set('note', e.target.value || undefined)}
          placeholder="Informazioni aggiuntive…"
        />
      </Field>
    </Sheet>
  );
}
