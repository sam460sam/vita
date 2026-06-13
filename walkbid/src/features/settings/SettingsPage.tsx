import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useT, useI18n } from '@/i18n';
import { Screen } from '@/app/Screen';
import { Card, Field, Input, Textarea, Select, Button, useToast } from '@/ui';
import { readSettings, updateCompany, updateSettings } from '@/services/settings';
import { exportBackup, importBackup } from '@/services/backup';
import { BRAND, BRAND_TAGLINE } from '@/config/brand';
import { Download, Upload } from 'lucide-react';
import type { Locale } from '@/data/types';

export function SettingsPage() {
  const t = useT();
  const { lang, setLang } = useI18n();
  const toast = useToast();
  const settings = useLiveQuery(() => readSettings(), []);

  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [payInstr, setPayInstr] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [aiMode, setAiMode] = useState<'off' | 'mock' | 'live'>('mock');
  const [aiProxyUrl, setAiProxyUrl] = useState('');

  useEffect(() => {
    if (!settings) return;
    setName(settings.company.name);
    setLicense(settings.company.licenseNumber ?? '');
    setAddress(settings.company.address ?? '');
    setPhone(settings.company.phone ?? '');
    setEmail(settings.company.email ?? '');
    setPayInstr(settings.company.paymentInstructions ?? '');
    setTaxRate(String((settings.defaultTaxRate * 100).toFixed(2)).replace(/\.00$/, ''));
    setAiMode(settings.aiMode);
    setAiProxyUrl(settings.aiProxyUrl ?? '');
  }, [settings]);

  async function saveAi() {
    await updateSettings({ aiMode, aiProxyUrl: aiProxyUrl.trim() || undefined });
    toast.show('AI settings saved', 'go');
  }

  async function saveCompany() {
    await updateCompany({ name, licenseNumber: license, address, phone, email, paymentInstructions: payInstr });
    await updateSettings({ defaultTaxRate: (Number(taxRate) || 0) / 100 });
    toast.show(t('common.save') + 'd', 'go');
  }

  return (
    <Screen title={t('nav.settings')}>
      <div className="flex flex-col gap-4 p-4">
        <Card>
          <div className="p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">Company</h3>
            <Field label="Company name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Elite Hardscapes LLC" />
            </Field>
            <Field label="License number" hint={t('common.optional')}>
              <Input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="#438F829" />
            </Field>
            <Field label="Address" hint={t('common.optional')}>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" hint={t('common.optional')}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
              </Field>
              <Field label="Email" hint={t('common.optional')}>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </Field>
            </div>
            <Field label="Default tax rate (%)" hint="varies by state — confirm with your accountant">
              <Input value={taxRate} onChange={(e) => setTaxRate(e.target.value)} type="number" inputMode="decimal" />
            </Field>
            <Field
              label="Payment instructions"
              hint="Zelle / check payable to / ACH — shown when you request payment"
            >
              <Textarea value={payInstr} onChange={(e) => setPayInstr(e.target.value)} placeholder="Zelle: pay@elitehardscapes.com" />
            </Field>
            <Button className="w-full" onClick={saveCompany}>
              {t('common.save')}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">App</h3>
            <Field label="Language">
              <Select value={lang} onChange={(e) => setLang(e.target.value as Locale)}>
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">AI assist</h3>
            <Field label="Mode" hint="voice estimate, change orders & logs">
              <Select value={aiMode} onChange={(e) => setAiMode(e.target.value as 'off' | 'mock' | 'live')}>
                <option value="off">Off — hide AI</option>
                <option value="mock">On-device (offline)</option>
                <option value="live">Live (your proxy)</option>
              </Select>
            </Field>
            {aiMode === 'live' && (
              <Field label="AI proxy URL" hint="your serverless endpoint — see docs/AI_PROXY.md">
                <Input value={aiProxyUrl} onChange={(e) => setAiProxyUrl(e.target.value)} placeholder="https://your-worker.workers.dev" inputMode="url" />
              </Field>
            )}
            <Button variant="secondary" className="w-full" onClick={saveAi}>
              {t('common.save')}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-muted">Backup</h3>
            <p className="mb-3 text-sm text-muted">
              {BRAND} keeps everything on this device. Export a .zip (data + photos + signed PDFs) to keep it safe or
              move to a new phone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                onClick={async () => {
                  await exportBackup();
                  toast.show('Backup exported', 'go');
                }}
              >
                <Download size={18} /> Export
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.zip,application/zip';
                  input.onchange = async () => {
                    const f = input.files?.[0];
                    if (!f) return;
                    try {
                      await importBackup(f);
                      toast.show('Backup restored', 'go');
                    } catch (e) {
                      toast.show((e as Error).message, 'danger');
                    }
                  };
                  input.click();
                }}
              >
                <Upload size={18} /> Restore
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-sm text-muted">
            <p className="font-semibold text-attention">Before you use the contract template</p>
            <p className="mt-1">
              Home-improvement contract requirements vary by state (license display, right-to-cancel notices, etc.).
              Have the template reviewed by a construction attorney before use. {BRAND} does not provide legal advice.
            </p>
          </div>
        </Card>

        <div className="px-1 text-center text-xs text-muted">
          {BRAND} · {BRAND_TAGLINE}
        </div>
      </div>
    </Screen>
  );
}
