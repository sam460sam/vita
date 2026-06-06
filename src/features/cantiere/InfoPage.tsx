import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, HardHat, Shield, FileText, Mail, Pencil, Check, X } from 'lucide-react';
import { CantierePageHeader as PageHeader } from './CantierePageHeader';
import { Screen } from '@/app/Screen';
import { Card, Divider } from '@/ui';
import { getMioProfilo, saveMioProfilo } from './profiloRepo';
import type { MioProfilo } from './profiloRepo';

const VERSION = '1.0.0';

const VENETO_PROVINCE = ['TV', 'VE', 'PD', 'VI', 'VR', 'BL', 'RO'];

const PROVINCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'TV', label: 'TV — Treviso' },
  { value: 'VE', label: 'VE — Venezia' },
  { value: 'PD', label: 'PD — Padova' },
  { value: 'VI', label: 'VI — Vicenza' },
  { value: 'VR', label: 'VR — Verona' },
  { value: 'BL', label: 'BL — Belluno' },
  { value: 'RO', label: 'RO — Rovigo' },
  { value: 'AG', label: 'AG — Agrigento' },
  { value: 'AL', label: 'AL — Alessandria' },
  { value: 'AN', label: 'AN — Ancona' },
  { value: 'AO', label: 'AO — Aosta' },
  { value: 'AQ', label: "AQ — L'Aquila" },
  { value: 'AR', label: 'AR — Arezzo' },
  { value: 'AP', label: 'AP — Ascoli Piceno' },
  { value: 'AT', label: 'AT — Asti' },
  { value: 'AV', label: 'AV — Avellino' },
  { value: 'BA', label: 'BA — Bari' },
  { value: 'BT', label: 'BT — Barletta-Andria-Trani' },
  { value: 'BN', label: 'BN — Benevento' },
  { value: 'BG', label: 'BG — Bergamo' },
  { value: 'BI', label: 'BI — Biella' },
  { value: 'BO', label: 'BO — Bologna' },
  { value: 'BZ', label: 'BZ — Bolzano' },
  { value: 'BS', label: 'BS — Brescia' },
  { value: 'BR', label: 'BR — Brindisi' },
  { value: 'CA', label: 'CA — Cagliari' },
  { value: 'CL', label: 'CL — Caltanissetta' },
  { value: 'CB', label: 'CB — Campobasso' },
  { value: 'CE', label: 'CE — Caserta' },
  { value: 'CT', label: 'CT — Catania' },
  { value: 'CZ', label: 'CZ — Catanzaro' },
  { value: 'CH', label: 'CH — Chieti' },
  { value: 'CO', label: 'CO — Como' },
  { value: 'CS', label: 'CS — Cosenza' },
  { value: 'CR', label: 'CR — Cremona' },
  { value: 'KR', label: 'KR — Crotone' },
  { value: 'CN', label: 'CN — Cuneo' },
  { value: 'EN', label: 'EN — Enna' },
  { value: 'FM', label: 'FM — Fermo' },
  { value: 'FE', label: 'FE — Ferrara' },
  { value: 'FI', label: 'FI — Firenze' },
  { value: 'FG', label: 'FG — Foggia' },
  { value: 'FC', label: 'FC — Forlì-Cesena' },
  { value: 'FR', label: 'FR — Frosinone' },
  { value: 'GE', label: 'GE — Genova' },
  { value: 'GO', label: 'GO — Gorizia' },
  { value: 'GR', label: 'GR — Grosseto' },
  { value: 'IM', label: 'IM — Imperia' },
  { value: 'IS', label: 'IS — Isernia' },
  { value: 'SP', label: 'SP — La Spezia' },
  { value: 'LT', label: 'LT — Latina' },
  { value: 'LE', label: 'LE — Lecce' },
  { value: 'LC', label: 'LC — Lecco' },
  { value: 'LI', label: 'LI — Livorno' },
  { value: 'LO', label: 'LO — Lodi' },
  { value: 'LU', label: 'LU — Lucca' },
  { value: 'MC', label: 'MC — Macerata' },
  { value: 'MN', label: 'MN — Mantova' },
  { value: 'MS', label: 'MS — Massa-Carrara' },
  { value: 'MT', label: 'MT — Matera' },
  { value: 'ME', label: 'ME — Messina' },
  { value: 'MI', label: 'MI — Milano' },
  { value: 'MO', label: 'MO — Modena' },
  { value: 'MB', label: 'MB — Monza e della Brianza' },
  { value: 'NA', label: 'NA — Napoli' },
  { value: 'NO', label: 'NO — Novara' },
  { value: 'NU', label: 'NU — Nuoro' },
  { value: 'OR', label: 'OR — Oristano' },
  { value: 'PA', label: 'PA — Palermo' },
  { value: 'PR', label: 'PR — Parma' },
  { value: 'PV', label: 'PV — Pavia' },
  { value: 'PG', label: 'PG — Perugia' },
  { value: 'PU', label: 'PU — Pesaro e Urbino' },
  { value: 'PE', label: 'PE — Pescara' },
  { value: 'PC', label: 'PC — Piacenza' },
  { value: 'PI', label: 'PI — Pisa' },
  { value: 'PT', label: 'PT — Pistoia' },
  { value: 'PN', label: 'PN — Pordenone' },
  { value: 'PZ', label: 'PZ — Potenza' },
  { value: 'PO', label: 'PO — Prato' },
  { value: 'RG', label: 'RG — Ragusa' },
  { value: 'RA', label: 'RA — Ravenna' },
  { value: 'RC', label: 'RC — Reggio Calabria' },
  { value: 'RE', label: 'RE — Reggio Emilia' },
  { value: 'RI', label: 'RI — Rieti' },
  { value: 'RN', label: 'RN — Rimini' },
  { value: 'RM', label: 'RM — Roma' },
  { value: 'SA', label: 'SA — Salerno' },
  { value: 'SS', label: 'SS — Sassari' },
  { value: 'SV', label: 'SV — Savona' },
  { value: 'SI', label: 'SI — Siena' },
  { value: 'SR', label: 'SR — Siracusa' },
  { value: 'SO', label: 'SO — Sondrio' },
  { value: 'SU', label: 'SU — Sud Sardegna' },
  { value: 'TA', label: 'TA — Taranto' },
  { value: 'TE', label: 'TE — Teramo' },
  { value: 'TR', label: 'TR — Terni' },
  { value: 'TO', label: 'TO — Torino' },
  { value: 'TP', label: 'TP — Trapani' },
  { value: 'TN', label: 'TN — Trento' },
  { value: 'TS', label: 'TS — Trieste' },
  { value: 'UD', label: 'UD — Udine' },
  { value: 'VA', label: 'VA — Varese' },
  { value: 'VC', label: 'VC — Vercelli' },
  { value: 'VB', label: 'VB — Verbano-Cusio-Ossola' },
  { value: 'VT', label: 'VT — Viterbo' },
  { value: 'VV', label: 'VV — Vibo Valentia' },
];

function getInitials(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function ruoloLabel(ruolo: MioProfilo['ruolo']): string {
  return ruolo === 'posatore' ? 'Posatore / Impresa' : 'Operaio / Artigiano';
}

function ProfileCard() {
  const [profilo, setProfilo] = useState<MioProfilo | null>(() => getMioProfilo());
  const [editing, setEditing] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editProv, setEditProv] = useState('');
  const [editRuolo, setEditRuolo] = useState<MioProfilo['ruolo']>('posatore');

  if (!profilo) return null;

  function startEdit() {
    setEditNome(profilo!.nome);
    setEditProv(profilo!.provincia);
    setEditRuolo(profilo!.ruolo);
    setEditing(true);
  }

  function saveEdit() {
    const updated: MioProfilo = {
      ...profilo!,
      nome: editNome.trim() || profilo!.nome,
      provincia: editProv || profilo!.provincia,
      ruolo: editRuolo,
    };
    saveMioProfilo(updated);
    setProfilo(updated);
    setEditing(false);
  }

  function togglePublico() {
    const updated: MioProfilo = { ...profilo!, profiloPubblico: !profilo!.profiloPubblico };
    saveMioProfilo(updated);
    setProfilo(updated);
  }

  return (
    <Card className="mb-6">
      {!editing ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[20px] font-bold text-white">{getInitials(profilo.nome)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[17px] text-ink truncate">{profilo.nome}</div>
              <div className="text-[13px] text-ink-2 mt-0.5">
                {profilo.provincia} · {ruoloLabel(profilo.ruolo)}
              </div>
            </div>
            <button
              onClick={startEdit}
              className="w-8 h-8 rounded-full bg-section flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
              aria-label="Modifica profilo"
            >
              <Pencil size={15} className="text-ink-2" />
            </button>
          </div>

          {/* Public toggle */}
          <div className="border-t border-line pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium text-ink">Profilo pubblico</div>
                <div className="text-[11px] text-ink-3 mt-0.5">
                  La sincronizzazione cloud sarà disponibile nella prossima versione
                </div>
              </div>
              <button
                onClick={togglePublico}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${
                  profilo.profiloPubblico ? 'bg-slate-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={profilo.profiloPubblico}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    profilo.profiloPubblico ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Edit form */
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[14px] font-semibold text-ink">Modifica profilo</span>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="w-8 h-8 rounded-full bg-section flex items-center justify-center active:scale-95"
                aria-label="Annulla"
              >
                <X size={15} className="text-ink-2" />
              </button>
              <button
                onClick={saveEdit}
                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center active:scale-95"
                aria-label="Salva"
              >
                <Check size={15} className="text-white" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink-3 mb-1">Nome e cognome</label>
            <input
              type="text"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-section border border-line text-[14px] text-ink focus:border-ink/30 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink-3 mb-1">Provincia</label>
            <select
              value={editProv}
              onChange={(e) => setEditProv(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-section border border-line text-[14px] text-ink focus:border-ink/30 outline-none transition-colors appearance-none"
            >
              <optgroup label="Veneto">
                {PROVINCE_OPTIONS.filter((p) => VENETO_PROVINCE.includes(p.value)).map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </optgroup>
              <optgroup label="Altre province">
                {PROVINCE_OPTIONS.filter((p) => !VENETO_PROVINCE.includes(p.value)).map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-ink-3 mb-2">Ruolo</label>
            <div className="grid grid-cols-2 gap-2">
              {(['posatore', 'operaio'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setEditRuolo(r)}
                  className={`py-2.5 px-2 rounded-xl border-2 text-center transition-all text-[13px] font-medium ${
                    editRuolo === r
                      ? 'border-slate-700 bg-slate-700 text-white'
                      : 'border-line bg-section text-ink-2'
                  }`}
                >
                  {ruoloLabel(r)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export function InfoPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader title="Info" />
      <Screen>
        {/* Profile card */}
        <ProfileCard />

        {/* App identity */}
        <div className="flex flex-col items-center py-8 mb-2">
          <div className="w-20 h-20 rounded-[22px] bg-slate-600 flex items-center justify-center mb-4 shadow-card-hover">
            <HardHat size={40} className="text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-ink">Cantieri</h1>
          <p className="text-[13px] text-ink-2 mt-1">Versione {VERSION}</p>
          <p className="text-[12px] text-ink-3 mt-0.5">© 2025 Samuele Gubert</p>
        </div>

        <p className="text-[14px] text-ink-2 text-center mb-6 leading-relaxed px-4">
          Gestisci cantieri, calcola il cemento, firma i verbali di consegna e tieni i tuoi operai in
          un'unica app — tutto offline, sul tuo dispositivo.
        </p>

        {/* Legal links */}
        <Card inset={false} className="overflow-hidden mb-4">
          <button
            onClick={() => navigate('/privacy')}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <Shield size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Informativa Privacy</div>
              <div className="text-[12px] text-ink-3">GDPR · eIDAS · D.Lgs. 82/2005</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <Divider />
          <button
            onClick={() => navigate('/termini')}
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <FileText size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Termini di Servizio</div>
              <div className="text-[12px] text-ink-3">Legge italiana · Foro competente</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </button>
          <Divider />
          <a
            href="mailto:gubertsamuele31@gmail.com"
            className="w-full flex items-center gap-3 px-4 py-4 active:bg-section transition-colors"
          >
            <Mail size={20} className="text-slate-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <div className="text-[15px] font-medium text-ink">Contattaci</div>
              <div className="text-[12px] text-ink-3">gubertsamuele31@gmail.com</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </a>
        </Card>

        {/* Legal note */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-4">
          <p className="text-[13px] text-amber-800 dark:text-amber-200 leading-relaxed font-medium mb-1">
            Nota sulla firma elettronica
          </p>
          <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
            La firma raccolta tramite verbale è una <strong>Firma Elettronica Semplice (FES)</strong> ai
            sensi del Regolamento UE 910/2014 (eIDAS). Ha valore probatorio in caso di contestazione.
            Per lavori di importo significativo, valuta di affiancarla a una firma cartacea.
          </p>
        </div>

        <div className="text-center text-[11px] text-ink-3 pb-4">
          Tutti i dati sono salvati solo sul tuo dispositivo. Nessun cloud, nessun account.
        </div>
      </Screen>
    </>
  );
}
