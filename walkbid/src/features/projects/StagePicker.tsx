import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useT, type TKey } from '@/i18n';
import { Sheet } from '@/ui';
import { setProjectStatus } from '@/services/projects';
import { PROJECT_STATUSES, type ProjectStatus } from '@/data/types';
import { cn } from '@/lib/cn';

// One current-stage chip → bottom-sheet picker (redesign B3). Removes the
// overflowing pipeline-pill row; faster to operate with gloves.
const DOT: Record<ProjectStatus, string> = {
  lead: 'bg-muted',
  quoted: 'bg-attention',
  signed: 'bg-accent',
  in_progress: 'bg-attention',
  done: 'bg-accent',
  disputed: 'bg-danger',
};
const TEXT: Record<ProjectStatus, string> = {
  lead: 'text-muted',
  quoted: 'text-attention',
  signed: 'text-accent',
  in_progress: 'text-attention',
  done: 'text-accent',
  disputed: 'text-danger',
};

export function StagePicker({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-3 py-1.5 text-sm font-semibold"
      >
        <span className={cn('h-2 w-2 rounded-full', DOT[status])} />
        <span className={TEXT[status]}>{t(`status.${status}` as TKey)}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Job stage">
        <div className="flex flex-col gap-1">
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s}
              onClick={async () => {
                await setProjectStatus(projectId, s);
                setOpen(false);
              }}
              className="flex min-h-touch items-center gap-3 rounded-btn px-3 text-left active:bg-surface-2"
            >
              <span className={cn('h-2.5 w-2.5 rounded-full', DOT[s])} />
              <span className={cn('flex-1 font-semibold', s === status ? TEXT[s] : 'text-ink')}>{t(`status.${s}` as TKey)}</span>
              {s === status && <Check size={18} className="text-accent" />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
