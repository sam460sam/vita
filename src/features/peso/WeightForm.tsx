import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { Sheet, Button, Field, Input, useToast } from '@/ui';
import { logWeight, updateSettings, deleteWeightLog } from '@/data/repo';
import { todayISO } from '@/lib/format';
import { useT } from '@/i18n';
import type { Settings, WeightLog } from '@/data/types';
import { toDisplay, fromDisplay } from './logic';

export function WeightForm({
  open,
  onClose,
  settings,
  entry,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  entry?: WeightLog | null;
}) {
  const t = useT();
  const toast = useToast();
  const unit = settings.body.unit;
  const fileRef = useRef<HTMLInputElement>(null);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (open) {
      setWeight(entry ? String(Math.round(toDisplay(entry.weightKg, unit) * 10) / 10) : '');
      setDate(entry?.date ?? todayISO());
      setNote(entry?.note ?? '');
      setPhoto(entry?.photo);
      setHeight(settings.body.heightCm ? String(settings.body.heightCm) : '');
      setGoal(settings.body.goalWeightKg ? String(Math.round(toDisplay(settings.body.goalWeightKg, unit) * 10) / 10) : '');
    }
  }, [open, entry, settings, unit]);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Downscale to keep storage small (max 900px, JPEG).
    const dataUrl = await downscale(file, 900);
    setPhoto(dataUrl);
  }

  async function save() {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;
    // persist height/goal into settings
    const body = {
      ...settings.body,
      heightCm: height ? parseInt(height) : settings.body.heightCm,
      goalWeightKg: goal ? fromDisplay(parseFloat(goal), unit) : settings.body.goalWeightKg,
    };
    await updateSettings({ body });
    await logWeight({ date, weightKg: fromDisplay(w, unit), note: note.trim() || undefined, photo });
    toast.show(t('weightForm.saved'));
    onClose();
  }

  async function remove() {
    if (entry) {
      await deleteWeightLog(entry.id);
      onClose();
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('weightForm.title')}
      footer={
        <div className="flex gap-2">
          {entry && (
            <Button variant="ghost" className="text-danger" onClick={remove}>
              {t('common.delete')}
            </Button>
          )}
          <Button block size="lg" onClick={save} disabled={!weight}>
            {t('common.save')}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label={`${t('weightForm.weight')} (${unit})`}>
          <Input type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </Field>
        <Field label={t('weightForm.date')}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayISO()} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={t('weightForm.height')}>
          <Input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
        </Field>
        <Field label={`${t('weightForm.goalWeight')} (${unit})`}>
          <Input type="number" inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </Field>
      </div>

      <Field label={t('weightForm.photo')}>
        {photo ? (
          <div className="relative inline-block">
            <img src={photo} alt="" className="h-32 w-32 object-cover rounded-card" />
            <button
              onClick={() => setPhoto(undefined)}
              className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-ink text-app flex items-center justify-center"
              aria-label="−"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="h-32 w-32 rounded-card bg-section flex flex-col items-center justify-center gap-1 text-ink-3"
          >
            <Camera size={24} />
            <span className="text-[12px] font-medium">{t('weightForm.addPhoto')}</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPickPhoto} />
      </Field>

      <Field label={t('weightForm.note')}>
        <Input value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Sheet>
  );
}

/** Resize an image file to a max dimension and return a JPEG data URL. */
function downscale(file: File, max: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = url;
  });
}
