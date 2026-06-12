import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, FilePlus2, Camera } from 'lucide-react';
import { useT } from '@/i18n';
import { Sheet, EmptyState, Button } from '@/ui';
import { listProjects } from '@/services/projects';
import type { ID } from '@/data/types';

type Intent = 'estimate' | 'change_order' | 'photo';

interface QuickAddCtx {
  open: () => void;
}
const Ctx = createContext<QuickAddCtx | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [openSheet, setOpenSheet] = useState(false);
  const [intent, setIntent] = useState<Intent | null>(null);
  const nav = useNavigate();
  const t = useT();
  const projects = useLiveQuery(() => listProjects(), []) ?? [];

  const open = useCallback(() => {
    setIntent(null);
    setOpenSheet(true);
  }, []);

  const close = useCallback(() => setOpenSheet(false), []);

  const go = useCallback(
    (projectId: ID) => {
      const tab = intent === 'change_order' ? 'changeOrders' : intent === 'photo' ? 'log' : 'estimate';
      close();
      nav(`/jobs/${projectId}?tab=${tab}`);
    },
    [intent, nav, close],
  );

  const value = useMemo(() => ({ open }), [open]);

  const actions: Array<{ id: Intent; icon: ReactNode; label: string }> = [
    { id: 'estimate', icon: <FileText size={20} />, label: t('quick.newEstimate') },
    { id: 'change_order', icon: <FilePlus2 size={20} />, label: t('quick.newChangeOrder') },
    { id: 'photo', icon: <Camera size={20} />, label: t('quick.sitePhoto') },
  ];

  return (
    <Ctx.Provider value={value}>
      {children}
      <Sheet open={openSheet} onClose={close} title={intent ? t('project.client') : t('quick.title')}>
        {!intent ? (
          <div className="flex flex-col gap-2">
            {actions.map((a) => (
              <button
                key={a.id}
                onClick={() => setIntent(a.id)}
                className="flex min-h-touch items-center gap-3 rounded-btn border border-steel bg-asphalt px-4 py-3 text-left text-chalk active:bg-steel/60"
              >
                <span className="text-safety">{a.icon}</span>
                <span className="font-display font-bold">{a.label}</span>
              </button>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title={t('jobs.empty.title')}
            body={t('jobs.empty.body')}
            action={
              <Button
                onClick={() => {
                  close();
                  nav('/clients');
                }}
              >
                {t('jobs.empty.cta')}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => go(p.id)}
                className="min-h-touch rounded-btn border border-steel bg-asphalt px-4 py-3 text-left active:bg-steel/60"
              >
                <div className="font-display font-bold text-chalk">{p.title}</div>
                <div className="truncate text-sm text-dust">{p.siteAddress}</div>
              </button>
            ))}
          </div>
        )}
      </Sheet>
    </Ctx.Provider>
  );
}

export function useQuickAdd(): QuickAddCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useQuickAdd must be used within QuickAddProvider');
  return ctx;
}
