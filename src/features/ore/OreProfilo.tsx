import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button, Field, Input } from '@/ui';
import { saveWorkProfile } from '@/data/ore-repo';
import { useToast } from '@/ui';
import type { WorkProfile } from '@/data/types';
import { cn } from '@/lib/cn';

interface Props {
  profile: WorkProfile;
  onSaved: (updated: WorkProfile) => void;
}

export function OreProfilo({ profile, onSaved }: Props) {
  const { show } = useToast();
  const [nome, setNome] = useState(profile.nome);
  const [tariffaOraria, setTariffaOraria] = useState(String(profile.tariffaOraria));
  const [aliquotaIRPEF, setAliquotaIRPEF] = useState(String(profile.aliquotaIRPEF));
  const [aliquotaINPS, setAliquotaINPS] = useState(String(profile.aliquotaINPS));
  const [oreDefault, setOreDefault] = useState(String(profile.oreDefaultGiornata));
  const [ruolo, setRuolo] = useState<WorkProfile['ruolo']>(profile.ruolo);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNome(profile.nome);
    setTariffaOraria(String(profile.tariffaOraria));
    setAliquotaIRPEF(String(profile.aliquotaIRPEF));
    setAliquotaINPS(String(profile.aliquotaINPS));
    setOreDefault(String(profile.oreDefaultGiornata));
    setRuolo(profile.ruolo);
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated: WorkProfile = {
        id: 'work',
        nome: nome.trim(),
        tariffaOraria: parseFloat(tariffaOraria) || 0,
        aliquotaIRPEF: parseFloat(aliquotaIRPEF) || 0,
        aliquotaINPS: parseFloat(aliquotaINPS) || 0,
        oreDefaultGiornata: parseFloat(oreDefault) || 8,
        ruolo,
        updatedAt: Date.now(),
      };
      await saveWorkProfile(updated);
      onSaved(updated);
      show('Profilo salvato');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-3">Ruolo</div>
        <div className="grid grid-cols-2 gap-2">
          {(['dipendente', 'impresa'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRuolo(r)}
              className={cn(
                'py-3 rounded-xl text-[14px] font-semibold border-2 transition-colors',
                ruolo === r
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-section text-ink-2 border-line',
              )}
            >
              {r === 'dipendente' ? '👷 Dipendente' : '🏢 Impresa'}
            </button>
          ))}
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-3">
          Informazioni personali
        </div>
        <Field label="Nome e cognome">
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Mario Rossi"
          />
        </Field>
      </div>

      {/* Payroll settings */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-3">
          Dati retributivi
        </div>

        <Field label="Tariffa oraria lorda (€)">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={tariffaOraria}
            onChange={(e) => setTariffaOraria(e.target.value)}
            placeholder="15.00"
          />
        </Field>

        <Field label="Ore default giornata non lavorativa">
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={24}
            step={0.5}
            value={oreDefault}
            onChange={(e) => setOreDefault(e.target.value)}
            placeholder="8"
          />
        </Field>
      </div>

      {/* Tax rates */}
      <div className="bg-card rounded-card shadow-card border border-line/60 p-4">
        <div className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide mb-3">
          Imposte e contributi
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Aliquota IRPEF (%)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.01}
              value={aliquotaIRPEF}
              onChange={(e) => setAliquotaIRPEF(e.target.value)}
              placeholder="23"
            />
          </Field>
          <Field label="Contributi INPS (%)">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={0.01}
              value={aliquotaINPS}
              onChange={(e) => setAliquotaINPS(e.target.value)}
              placeholder="9.19"
            />
          </Field>
        </div>

        <div className="text-[11px] text-ink-3 mt-1">
          Aliquote di default per lavoratori dipendenti italiani. Adatta alla tua situazione.
          Totale trattenute: {((parseFloat(aliquotaIRPEF) || 0) + (parseFloat(aliquotaINPS) || 0)).toFixed(2)}%.
        </div>
      </div>

      <Button
        onClick={handleSave}
        block
        size="lg"
        disabled={saving}
        icon={<Save size={18} />}
      >
        {saving ? 'Salvataggio…' : 'Salva modifiche'}
      </Button>
    </div>
  );
}
