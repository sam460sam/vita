import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Upload, Trash2, Info, Sparkles } from 'lucide-react';
import { readSettings, updateSettings, exportBackup, importBackup, clearAllData } from '@/data/repo';
import { seedDemoData } from '@/data/seed';
import { defaultSettings } from '@/data/defaults';
import { platform } from '@/platform/platform';
import { notifications } from '@/platform/notifications';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, CardHeader, Field, Input, Button, Divider, useToast } from '@/ui';
import { format } from 'date-fns';
import { useI18n, LANGS, type LangPref, type TKey } from '@/i18n';
import { useTheme, type ThemePref } from '@/theme/theme';
import type { VitaBackup } from '@/data/types';

export function SettingsPage() {
  const { t, pref, setPref } = useI18n();
  const { pref: themePref, setPref: setThemePref } = useTheme();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const s = settings ?? defaultSettings();
  const [name, setName] = useState('');
  const [move, setMove] = useState('600');
  const [exercise, setExercise] = useState('30');
  const [stand, setStand] = useState('12');
  const [currency, setCurrency] = useState('EUR');
  const [waterGoalL, setWaterGoalL] = useState('2');
  const [glassMl, setGlassMl] = useState('200');
  const toast = useToast();

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setMove(String(settings.goals.moveKcal));
      setExercise(String(settings.goals.exerciseMin));
      setStand(String(settings.goals.standHours));
      setCurrency(settings.currency);
      setWaterGoalL(String(settings.water.dailyGoalMl / 1000));
      setGlassMl(String(settings.water.glassMl));
    }
  }, [settings]);

  async function saveProfile() {
    await updateSettings({
      name: name.trim(),
      goals: { moveKcal: +move || 600, exerciseMin: +exercise || 30, standHours: +stand || 12 },
      currency: currency.trim().toUpperCase() || 'EUR',
      water: { dailyGoalMl: Math.round((parseFloat(waterGoalL) || 2) * 1000), glassMl: parseInt(glassMl) || 200 },
    });
    toast.show(t('settings.saved'));
  }

  async function toggleModule(key: keyof typeof s.modules) {
    await updateSettings({ modules: { ...s.modules, [key]: !s.modules[key] } });
  }

  async function setReminder(kind: 'water' | 'workout' | 'journal', time: string) {
    const reminders = { ...s.reminders, [kind]: time || undefined };
    await updateSettings({ reminders });
    if (time && notifications.supported()) await notifications.requestPermission();
    await notifications.setDailyReminder(
      kind,
      t(`reminder.${kind}.title` as TKey),
      t(`reminder.${kind}.body` as TKey),
      time || undefined,
    );
  }

  async function doExport() {
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);
    await platform.saveTextFile(`vita-backup-${format(new Date(), 'yyyy-MM-dd')}.json`, json);
    toast.show(t('settings.exported'));
  }

  async function doImport() {
    const text = await platform.pickTextFile();
    if (!text) return;
    try {
      const data = JSON.parse(text) as VitaBackup;
      await importBackup(data, 'replace');
      toast.show(t('settings.imported'));
    } catch {
      toast.show(t('settings.invalidFile'));
    }
  }

  async function doDemo() {
    if (confirm(t('settings.demoConfirm'))) {
      await seedDemoData();
      toast.show(t('settings.demoLoaded'));
    }
  }

  async function doClear() {
    if (confirm(t('settings.clearConfirm'))) {
      await clearAllData();
      toast.show(t('settings.cleared'));
    }
  }

  const langOptions = [
    { value: 'system' as LangPref, label: t('settings.language.system') },
    ...LANGS.map((l) => ({ value: l.code as LangPref, label: l.label })),
  ];

  const themeOptions: { value: ThemePref; label: string }[] = [
    { value: 'system', label: t('settings.theme.system') },
    { value: 'light', label: t('settings.theme.light') },
    { value: 'dark', label: t('settings.theme.dark') },
  ];

  return (
    <>
      <PageHeader title={t('settings.title')} back="/altro" />
      <Screen>
        <Card className="mb-4">
          <CardHeader title={t('settings.profile')} />
          <Field label={t('settings.name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('settings.namePh')} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label={t('settings.goal.move')}>
              <Input type="number" inputMode="numeric" value={move} onChange={(e) => setMove(e.target.value)} />
            </Field>
            <Field label={t('settings.goal.exercise')}>
              <Input type="number" inputMode="numeric" value={exercise} onChange={(e) => setExercise(e.target.value)} />
            </Field>
            <Field label={t('settings.goal.stand')}>
              <Input type="number" inputMode="numeric" value={stand} onChange={(e) => setStand(e.target.value)} />
            </Field>
          </div>
          <Field label={t('settings.currency')}>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="EUR" />
          </Field>
          <Button block onClick={saveProfile}>
            {t('common.save')}
          </Button>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('water.title')} />
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('water.goal')}>
              <Input type="number" inputMode="decimal" value={waterGoalL} onChange={(e) => setWaterGoalL(e.target.value)} />
            </Field>
            <Field label={t('water.glassSize')}>
              <Input type="number" inputMode="numeric" value={glassMl} onChange={(e) => setGlassMl(e.target.value)} />
            </Field>
          </div>
          <Button block onClick={saveProfile}>
            {t('common.save')}
          </Button>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.language')} />
          <div className="flex flex-col gap-2">
            {langOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setPref(o.value)}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-[15px] text-ink">{o.label}</span>
                <span
                  className="h-5 w-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: pref === o.value ? 'var(--c-ink)' : 'var(--c-line)' }}
                >
                  {pref === o.value && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.theme')} />
          <div className="flex flex-col gap-2">
            {themeOptions.map((o) => (
              <button key={o.value} onClick={() => setThemePref(o.value)} className="flex items-center justify-between py-2.5">
                <span className="text-[15px] text-ink">{o.label}</span>
                <span
                  className="h-5 w-5 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: themePref === o.value ? 'var(--c-ink)' : 'var(--c-line)' }}
                >
                  {themePref === o.value && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                </span>
              </button>
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.reminders')} />
          <ReminderRow label={t('settings.reminders.water')} value={s.reminders.water ?? ''} onChange={(v) => setReminder('water', v)} />
          <Divider />
          <ReminderRow label={t('settings.reminders.workout')} value={s.reminders.workout ?? ''} onChange={(v) => setReminder('workout', v)} />
          <Divider />
          <ReminderRow label={t('settings.reminders.journal')} value={s.reminders.journal ?? ''} onChange={(v) => setReminder('journal', v)} />
          <p className="text-[12px] text-ink-3 mt-3">{t('settings.reminders.note')}</p>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.modules')} />
          <ModuleToggle label={t('nav.goals')} on={s.modules.goals} onToggle={() => toggleModule('goals')} />
          <Divider />
          <ModuleToggle label={t('nav.finances')} on={s.modules.finances} onToggle={() => toggleModule('finances')} />
          <Divider />
          <ModuleToggle label={t('nav.calendar')} on={s.modules.calendar} onToggle={() => toggleModule('calendar')} />
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.data')} />
          <p className="text-[13px] text-ink-2 mb-3 flex items-start gap-2">
            <Info size={15} className="mt-0.5 flex-shrink-0" />
            {t('settings.data.note')}
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="subtle" block icon={<Download size={18} />} onClick={doExport}>
              {t('settings.export')}
            </Button>
            <Button variant="subtle" block icon={<Upload size={18} />} onClick={doImport}>
              {t('settings.import')}
            </Button>
            <Button variant="subtle" block icon={<Sparkles size={18} />} onClick={doDemo}>
              {t('settings.demo')}
            </Button>
            <Button variant="ghost" block className="text-danger" icon={<Trash2 size={18} />} onClick={doClear}>
              {t('settings.clear')}
            </Button>
          </div>
        </Card>

        <p className="text-center text-[12px] text-ink-3">{t('settings.version')}</p>
      </Screen>
    </>
  );
}

function ReminderRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 gap-3">
      <span className="text-[15px] text-ink">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-3 rounded-btn bg-section border border-line dark:border-transparent text-[15px] text-ink outline-none"
      />
    </div>
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
