import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Trash2, Info, Sparkles } from 'lucide-react';
import { getSettings, updateSettings, exportBackup, importBackup, clearAllData } from '@/data/repo';
import { seedDemoData } from '@/data/seed';
import { defaultSettings } from '@/data/defaults';
import { platform } from '@/platform/platform';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, Field, Input, Button, Divider, useToast } from '@/ui';
import { format } from 'date-fns';
import type { VitaBackup } from '@/data/types';

export function SettingsPage() {
  const settings = useLiveQuery(() => getSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const [name, setName] = useState('');
  const [move, setMove] = useState('600');
  const [exercise, setExercise] = useState('30');
  const [stand, setStand] = useState('12');
  const [currency, setCurrency] = useState('EUR');
  const toast = useToast();

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setMove(String(settings.goals.moveKcal));
      setExercise(String(settings.goals.exerciseMin));
      setStand(String(settings.goals.standHours));
      setCurrency(settings.currency);
    }
  }, [settings]);

  async function saveProfile() {
    await updateSettings({
      name: name.trim(),
      goals: { moveKcal: +move || 600, exerciseMin: +exercise || 30, standHours: +stand || 12 },
      currency: currency.trim().toUpperCase() || 'EUR',
    });
    toast.show('Impostazioni salvate');
  }

  async function toggleModule(key: keyof typeof s.modules) {
    await updateSettings({ modules: { ...s.modules, [key]: !s.modules[key] } });
  }

  async function doExport() {
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);
    await platform.saveTextFile(`vita-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, json);
    toast.show('Backup esportato');
  }

  async function doImport() {
    const text = await platform.pickTextFile();
    if (!text) return;
    try {
      const data = JSON.parse(text) as VitaBackup;
      await importBackup(data, 'replace');
      toast.show('Dati importati');
    } catch {
      toast.show('File non valido');
    }
  }

  async function doDemo() {
    if (confirm('Caricare i dati demo? Sostituiranno i dati attuali. Esporta prima un backup se vuoi conservarli.')) {
      await seedDemoData();
      toast.show('Dati demo caricati');
    }
  }

  async function doClear() {
    if (confirm('Eliminare TUTTI i dati di Vita? Questa azione non è reversibile. Esporta prima un backup se vuoi conservarli.')) {
      await clearAllData();
      toast.show('Tutti i dati eliminati');
    }
  }

  return (
    <>
      <PageHeader title="Impostazioni" back="/altro" />
      <Screen>
        <Card className="mb-4">
          <CardHeader title="Profilo & obiettivi" />
          <Field label="Il tuo nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Come ti chiami?" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Movimento (kcal)">
              <Input type="number" inputMode="numeric" value={move} onChange={(e) => setMove(e.target.value)} />
            </Field>
            <Field label="Allen. (min)">
              <Input type="number" inputMode="numeric" value={exercise} onChange={(e) => setExercise(e.target.value)} />
            </Field>
            <Field label="In piedi (ore)">
              <Input type="number" inputMode="numeric" value={stand} onChange={(e) => setStand(e.target.value)} />
            </Field>
          </div>
          <Field label="Valuta">
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="EUR" />
          </Field>
          <Button block onClick={saveProfile}>
            Salva
          </Button>
        </Card>

        <Card className="mb-4">
          <CardHeader title="Moduli" />
          <ModuleToggle label="Obiettivi" on={s.modules.goals} onToggle={() => toggleModule('goals')} />
          <Divider />
          <ModuleToggle label="Finanze" on={s.modules.finances} onToggle={() => toggleModule('finances')} />
          <Divider />
          <ModuleToggle label="Calendario" on={s.modules.calendar} onToggle={() => toggleModule('calendar')} />
        </Card>

        <Card className="mb-4">
          <CardHeader title="Dati & backup" />
          <p className="text-[13px] text-ink-2 mb-3 flex items-start gap-2">
            <Info size={15} className="mt-0.5 flex-shrink-0" />
            Tutti i dati sono salvati solo su questo dispositivo (offline-first). Esporta un backup per non perderli.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="subtle" block icon={<Download size={18} />} onClick={doExport}>
              Esporta backup (JSON)
            </Button>
            <Button variant="subtle" block icon={<Upload size={18} />} onClick={doImport}>
              Importa backup
            </Button>
            <Button variant="subtle" block icon={<Sparkles size={18} />} onClick={doDemo}>
              Carica dati demo
            </Button>
            <Button variant="ghost" block className="text-danger" icon={<Trash2 size={18} />} onClick={doClear}>
              Elimina tutti i dati
            </Button>
          </div>
        </Card>

        <p className="text-center text-[12px] text-ink-3">Vita v1.0 · offline-first · Capacitor-ready</p>
      </Screen>
    </>
  );
}

function ModuleToggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[15px] text-ink">{label}</span>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className="relative h-7 w-12 rounded-full transition-colors"
        style={{ background: on ? 'var(--c-ink)' : 'var(--c-line)' }}
      >
        <span
          className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition-transform"
          style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  );
}
