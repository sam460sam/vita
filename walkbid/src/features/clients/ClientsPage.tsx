import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Plus, Users, Phone, Building2 } from 'lucide-react';
import { useT } from '@/i18n';
import { Screen } from '@/app/Screen';
import { Card, EmptyState, Button, IconButton } from '@/ui';
import { listClients } from '@/services/clients';
import { db } from '@/data/db';
import { ClientForm } from './ClientForm';
import type { Client } from '@/data/types';

export function ClientsPage() {
  const t = useT();
  const clients = useLiveQuery(() => listClients(), []);
  const counts = useLiveQuery(async () => {
    const all = await db.projects.toArray();
    const map: Record<string, number> = {};
    for (const p of all) map[p.clientId] = (map[p.clientId] ?? 0) + 1;
    return map;
  }, []) ?? {};
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>();

  return (
    <Screen
      title={t('clients.title')}
      action={
        <IconButton label={t('clients.new')} onClick={() => { setEditing(undefined); setFormOpen(true); }}>
          <Plus size={26} />
        </IconButton>
      }
    >
      {clients === undefined ? null : clients.length === 0 ? (
        <EmptyState
          icon={<Users size={40} />}
          title={t('clients.empty.title')}
          body={t('clients.empty.body')}
          action={<Button onClick={() => setFormOpen(true)}>{t('clients.empty.cta')}</Button>}
        />
      ) : (
        <div className="flex flex-col gap-2 p-4">
          {clients.map((c) => (
            <Card key={c.id} className="active:bg-graphite/70" onClick={() => { setEditing(c); setFormOpen(true); }}>
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-steel font-display text-lg font-bold text-chalk">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display font-bold text-chalk">{c.name}</div>
                  <div className="flex items-center gap-3 text-sm text-dust">
                    {c.company && (
                      <span className="flex items-center gap-1 truncate">
                        <Building2 size={13} /> {c.company}
                      </span>
                    )}
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={13} /> {c.phone}
                      </span>
                    )}
                  </div>
                </div>
                {(counts[c.id] ?? 0) > 0 && (
                  <span className="tnum rounded-full bg-steel px-2 py-0.5 text-xs font-semibold text-dust">
                    {counts[c.id]}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {formOpen && <ClientForm open={formOpen} onClose={() => setFormOpen(false)} existing={editing} />}
    </Screen>
  );
}
