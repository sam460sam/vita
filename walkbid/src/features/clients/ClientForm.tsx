import { useState } from 'react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Textarea, Select, Button, BottomBar, useToast } from '@/ui';
import { createClient, updateClient } from '@/services/clients';
import type { Client, Locale } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: Client;
  onSaved?: (id: string) => void;
}

export function ClientForm({ open, onClose, existing, onSaved }: Props) {
  const t = useT();
  const toast = useToast();
  const [name, setName] = useState(existing?.name ?? '');
  const [company, setCompany] = useState(existing?.company ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [language, setLanguage] = useState<Locale>(existing?.language ?? 'en');

  async function save() {
    if (!name.trim()) {
      toast.show(t('common.required'), 'danger');
      return;
    }
    const patch = { name, company, phone, email, address, notes, language };
    if (existing) {
      await updateClient(existing.id, patch);
      onSaved?.(existing.id);
    } else {
      const c = await createClient(patch);
      onSaved?.(c.id);
    }
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={existing ? t('clients.edit') : t('clients.new')}
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            {t('common.save')}
          </Button>
        </BottomBar>
      }
    >
      <Field label={t('clients.name')}>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adam Appleseed" autoFocus />
      </Field>
      <Field label={t('clients.company')} hint={t('common.optional')}>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
      </Field>
      <Field label={t('clients.phone')} hint={t('common.optional')}>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" />
      </Field>
      <Field label={t('clients.email')} hint={t('common.optional')}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" />
      </Field>
      <Field label={t('clients.address')} hint={t('common.optional')}>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <Field label={t('clients.language')}>
        <Select value={language} onChange={(e) => setLanguage(e.target.value as Locale)}>
          <option value="en">English</option>
          <option value="es">Español</option>
        </Select>
      </Field>
      <Field label={t('clients.notes')} hint={t('common.optional')}>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
    </Sheet>
  );
}
