import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sheet, Field, Input, Textarea, Button, BottomBar, useToast } from '@/ui';
import { PhotoStrip } from '@/ui/Photo';
import { todayISO } from '@/lib/format';
import { newDiaryId, createDiaryEntry } from '@/services/diary';
import { takePhoto, photosForRef, deletePhoto } from '@/services/photos';
import type { Project } from '@/data/types';

export function AddLogSheet({ open, onClose, project }: { open: boolean; onClose: () => void; project: Project }) {
  const toast = useToast();
  const entryId = useMemo(() => newDiaryId(), []);
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayISO());
  const photos = useLiveQuery(() => photosForRef('diary', entryId), [entryId]) ?? [];

  async function addPhoto() {
    const p = await takePhoto(project.id, 'diary', entryId);
    if (!p) toast.show('No photo captured', 'signal');
  }

  async function save() {
    if (!text.trim() && photos.length === 0) return toast.show('Add a note or a photo', 'signal');
    await createDiaryEntry({ id: entryId, projectId: project.id, text, date, photoIds: photos.map((p) => p.id) });
    toast.show('Log saved', 'go');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Daily log"
      footer={
        <BottomBar>
          <Button className="w-full" onClick={save}>
            Save log
          </Button>
        </BottomBar>
      }
    >
      <Field label="Date">
        <Input value={date} onChange={(e) => setDate(e.target.value)} type="date" />
      </Field>
      <Field label="Notes">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Crew, weather, work done, issues…" autoFocus />
      </Field>
      <Field label="Photos" hint="auto geotagged + timestamped">
        <PhotoStrip photos={photos} onAdd={addPhoto} onRemove={(id) => deletePhoto(id)} />
      </Field>
    </Sheet>
  );
}
