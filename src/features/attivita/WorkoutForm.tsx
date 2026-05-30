import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Sheet, Button, Field, Input, useToast } from '@/ui';
import { createWorkout } from '@/data/repo';
import { SPORTS, getSport, estimateKcal } from './sports';
import { SportPicker } from './SportPicker';
import type { Sport } from './sports';

/** Manual workout entry (used by global quick-add). */
export function WorkoutForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: () => void }) {
  const [sport, setSport] = useState<Sport>(SPORTS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [minutes, setMinutes] = useState('30');
  const [kcal, setKcal] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const toast = useToast();

  async function save() {
    const durationSec = Math.max(0, Math.round(parseFloat(minutes || '0') * 60));
    const activeKcal = kcal ? Math.round(parseFloat(kcal)) : estimateKcal(sport.met, durationSec);
    await createWorkout({
      sportId: sport.id,
      durationSec,
      activeKcal,
      totalKcal: Math.round(activeKcal * 1.25),
      distanceM: sport.hasDistance && distanceKm ? Math.round(parseFloat(distanceKm) * 1000) : undefined,
      source: 'manual',
    });
    toast.show('Allenamento aggiunto');
    onSaved?.();
    reset();
    onClose();
  }

  function reset() {
    setMinutes('30');
    setKcal('');
    setDistanceKm('');
  }

  const Icon = getSport(sport.id).icon;

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title="Nuovo allenamento"
        footer={
          <Button block size="lg" onClick={save} disabled={!minutes}>
            Salva allenamento
          </Button>
        }
      >
        <Field label="Sport">
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full h-11 px-3.5 rounded-btn bg-section border border-line flex items-center justify-between text-[15px] text-ink"
          >
            <span className="flex items-center gap-2">
              <Icon size={18} className="text-activity" />
              {sport.name}
            </span>
            <ChevronDown size={18} className="text-ink-3" />
          </button>
        </Field>

        <Field label="Durata (minuti)">
          <Input type="number" inputMode="numeric" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Calorie attive">
            <Input
              type="number"
              inputMode="numeric"
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              placeholder={String(estimateKcal(sport.met, parseFloat(minutes || '0') * 60))}
            />
          </Field>
          {sport.hasDistance && (
            <Field label="Distanza (km)">
              <Input type="number" inputMode="decimal" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} placeholder="0" />
            </Field>
          )}
        </div>
      </Sheet>

      <SportPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(s) => {
          setSport(s);
          setPickerOpen(false);
        }}
      />
    </>
  );
}
