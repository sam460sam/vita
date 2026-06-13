import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { MapPin } from 'lucide-react';
import { useT } from '@/i18n';
import { Sheet, Field, Input, Select, Button, BottomBar, useToast } from '@/ui';
import { listClients } from '@/services/clients';
import { createProject, updateProject } from '@/services/projects';
import { currentGeo } from '@/platform/geo';
import { ClientForm } from '@/features/clients';
import type { Project } from '@/data/types';

interface Props {
  open: boolean;
  onClose: () => void;
  existing?: Project;
  defaultClientId?: string;
  onSaved?: (id: string) => void;
}

export function ProjectForm({ open, onClose, existing, defaultClientId, onSaved }: Props) {
  const t = useT();
  const toast = useToast();
  const clients = useLiveQuery(() => listClients(), []) ?? [];
  const [clientId, setClientId] = useState(existing?.clientId ?? defaultClientId ?? '');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [siteAddress, setSiteAddress] = useState(existing?.siteAddress ?? '');
  const [geo, setGeo] = useState(existing?.geo);
  const [newClient, setNewClient] = useState(false);
  const [locating, setLocating] = useState(false);

  async function tagLocation() {
    setLocating(true);
    const g = await currentGeo();
    setLocating(false);
    if (g) {
      setGeo(g);
      toast.show('Location tagged', 'go');
    } else {
      toast.show('Location unavailable', 'attention');
    }
  }

  async function save() {
    if (!clientId) return toast.show(t('project.client') + ' ' + t('common.required').toLowerCase(), 'danger');
    if (!title.trim()) return toast.show(t('common.required'), 'danger');
    if (existing) {
      await updateProject(existing.id, { clientId, title, siteAddress, geo });
      onSaved?.(existing.id);
    } else {
      const p = await createProject({ clientId, title, siteAddress, geo });
      onSaved?.(p.id);
    }
    onClose();
  }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={existing ? t('project.edit') : t('project.new')}
        footer={
          <BottomBar>
            <Button className="w-full" onClick={save}>
              {t('common.save')}
            </Button>
          </BottomBar>
        }
      >
        <Field label={t('project.client')}>
          <Select value={clientId} onChange={(e) => (e.target.value === '__new' ? setNewClient(true) : setClientId(e.target.value))}>
            <option value="">{t('common.none')}</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.company ? ` · ${c.company}` : ''}
              </option>
            ))}
            <option value="__new">+ {t('clients.new')}</option>
          </Select>
        </Field>
        <Field label={t('project.title')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backyard paver patio" autoFocus />
        </Field>
        <Field label={t('project.siteAddress')} hint={t('common.optional')}>
          <Input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} placeholder="123 Oak St" />
        </Field>
        <Button variant="secondary" className="w-full" onClick={tagLocation} disabled={locating}>
          <MapPin size={18} /> {geo ? `${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}` : locating ? '…' : 'Tag site location'}
        </Button>
      </Sheet>

      {newClient && (
        <ClientForm
          open={newClient}
          onClose={() => setNewClient(false)}
          onSaved={(id) => {
            setClientId(id);
            setNewClient(false);
          }}
        />
      )}
    </>
  );
}
