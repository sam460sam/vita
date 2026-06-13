import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { NotebookPen, Plus, Trash2 } from 'lucide-react';
import { EmptyState, Button, Card } from '@/ui';
import { PhotoThumb } from '@/ui/Photo';
import { usDate } from '@/lib/format';
import { diaryForProject, deleteDiaryEntry } from '@/services/diary';
import { getPhotos } from '@/services/photos';
import { AddLogSheet } from '@/features/log/AddLogSheet';
import type { DiaryEntry, Photo, Project } from '@/data/types';

export function LogTab({ project }: { project: Project }) {
  const entries = useLiveQuery(() => diaryForProject(project.id), [project.id]);
  const [addOpen, setAddOpen] = useState(false);

  if (entries === undefined) return null;

  if (entries.length === 0) {
    return (
      <>
        <EmptyState
          icon={<NotebookPen size={36} />}
          title="No log entries yet"
          body="Note what happened on site each day — it feeds your proof package."
          action={<Button onClick={() => setAddOpen(true)}>Add log entry</Button>}
        />
        {addOpen && <AddLogSheet open={addOpen} onClose={() => setAddOpen(false)} project={project} />}
      </>
    );
  }

  return (
    <div className="p-4">
      <Button className="mb-4 w-full" onClick={() => setAddOpen(true)}>
        <Plus size={18} /> Add log entry
      </Button>
      <div className="flex flex-col gap-2">
        {entries.map((e) => (
          <LogEntryCard key={e.id} entry={e} />
        ))}
      </div>
      {addOpen && <AddLogSheet open={addOpen} onClose={() => setAddOpen(false)} project={project} />}
    </div>
  );
}

function LogEntryCard({ entry }: { entry: DiaryEntry }) {
  const photos = useLiveQuery<Photo[]>(() => getPhotos(entry.photoIds), [entry.photoIds.join(',')]) ?? [];
  return (
    <Card>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-ink">{usDate(entry.date)}</span>
          <button onClick={() => deleteDiaryEntry(entry.id)} className="text-muted" aria-label="Delete">
            <Trash2 size={15} />
          </button>
        </div>
        {entry.text && <p className="whitespace-pre-wrap text-sm text-ink">{entry.text}</p>}
        {photos.length > 0 && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {photos.map((p) => (
              <PhotoThumb key={p.id} blobId={p.blobId} className="h-20 w-20 shrink-0" />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
