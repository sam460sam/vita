import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Sheet, Field, Input, Button, BottomBar, useToast } from '@/ui';
import { VoiceCapture } from '@/ui/VoiceCapture';
import { PhotoStrip } from '@/ui/Photo';
import { todayISO } from '@/lib/format';
import { newDiaryId, createDiaryEntry } from '@/services/diary';
import { takePhoto, photosForRef, deletePhoto } from '@/services/photos';
import { aiEnabled, getProvider, OfflineQueuedError } from '@/services/ai';
import type { Project } from '@/data/types';

export function AddLogSheet({ open, onClose, project }: { open: boolean; onClose: () => void; project: Project }) {
  const toast = useToast();
  const { lang } = useI18n();
  const entryId = useMemo(() => newDiaryId(), []);
  const [text, setText] = useState('');
  const [date, setDate] = useState(todayISO());
  const [summarizing, setSummarizing] = useState(false);
  const photos = useLiveQuery(() => photosForRef('diary', entryId), [entryId]) ?? [];
  const showAi = useLiveQuery(() => aiEnabled(), []) ?? false;

  async function addPhoto() {
    const p = await takePhoto(project.id, 'diary', entryId);
    if (!p) toast.show('No photo captured', 'attention');
  }

  // Flow C: dictate 30s in English or Spanish → structured English log entry.
  async function summarize() {
    if (!text.trim()) return toast.show('Dictate or type first', 'attention');
    setSummarizing(true);
    try {
      const provider = await getProvider();
      const draft = await provider.summarizeLog({ transcript: text, date, locale: lang });
      setText(draft.text || text);
      toast.show('Summarized', 'go');
    } catch (e) {
      toast.show(e instanceof OfflineQueuedError ? e.message : 'Summarize failed', 'attention');
    } finally {
      setSummarizing(false);
    }
  }

  async function save() {
    if (!text.trim() && photos.length === 0) return toast.show('Add a note or a photo', 'attention');
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
        <VoiceCapture value={text} onChange={setText} placeholder="Crew, weather, work done, issues… (English or Spanish)" />
      </Field>
      {showAi && (
        <Button variant="secondary" className="mb-4 w-full" onClick={summarize} disabled={summarizing}>
          <Sparkles size={18} /> {summarizing ? 'Summarizing…' : 'Summarize to English log'}
        </Button>
      )}
      <Field label="Photos" hint="auto geotagged + timestamped">
        <PhotoStrip photos={photos} onAdd={addPhoto} onRemove={(id) => deletePhoto(id)} />
      </Field>
    </Sheet>
  );
}
