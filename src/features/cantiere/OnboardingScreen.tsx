import { useState } from 'react';
import { HardHat, Calculator, PenTool, Users, Building2 } from 'lucide-react';
import type { MioProfilo } from './profiloRepo';
import { saveMioProfilo } from './profiloRepo';

interface Props {
  onDone: (profilo: MioProfilo) => void;
}

const FEATURES = [
  {
    icon: <HardHat size={22} className="text-slate-600" />,
    title: 'Gestisci i cantieri',
    desc: 'Tieni traccia di ogni lavoro: cliente, m², stato avanzamento e pagamenti.',
  },
  {
    icon: <Calculator size={22} className="text-slate-600" />,
    title: 'Ordina il cemento',
    desc: 'Calcola i m³ esatti e genera il messaggio WhatsApp per il rappresentante.',
  },
  {
    icon: <PenTool size={22} className="text-slate-600" />,
    title: 'Firma il verbale',
    desc: 'Il cliente firma digitalmente alla consegna — protezione legale contro contestazioni.',
  },
  {
    icon: <Users size={22} className="text-slate-600" />,
    title: 'Gestisci gli operai',
    desc: 'Rubrica privata con specializzazioni e valutazioni. Solo tu la vedi.',
  },
];

// Veneto provinces first, then rest alphabetically
const PROVINCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'TV', label: 'TV — Treviso' },
  { value: 'VE', label: 'VE — Venezia' },
  { value: 'PD', label: 'PD — Padova' },
  { value: 'VI', label: 'VI — Vicenza' },
  { value: 'VR', label: 'VR — Verona' },
  { value: 'BL', label: 'BL — Belluno' },
  { value: 'RO', label: 'RO — Rovigo' },
  // Rest of Italy alphabetically
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
  { value: 'CI', label: 'CI — Carbonia-Iglesias' },
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
  { value: 'OG', label: 'OG — Ogliastra' },
  { value: 'OT', label: 'OT — Olbia-Tempio' },
  { value: 'OR', label: 'OR — Oristano' },
  { value: 'PD', label: 'PD — Padova' },
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

// Remove duplicate PD that slipped in (PD appears both in Veneto block and alphabetical)
const PROVINCE_OPTS = PROVINCE_OPTIONS.filter((p, i, arr) =>
  arr.findIndex((x) => x.value === p.value) === i,
);

export function OnboardingScreen({ onDone }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [provincia, setProvincia] = useState('');

  const canProceed = nome.trim().length > 0 && provincia !== '';

  function handleStart() {
    const profilo: MioProfilo = {
      nome: nome.trim(),
      provincia,
      ruolo: 'posatore',
      profiloPubblico: false,
      createdAt: new Date().toISOString(),
    };
    saveMioProfilo(profilo);
    onDone(profilo);
  }

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
        {/* Hero */}
        <div className="flex flex-col items-center pt-16 pb-8 px-6 bg-gradient-to-b from-slate-700 to-slate-900">
          <img
            src="./betoniera.png"
            alt="Cantieri"
            className="w-28 h-28 rounded-[28px] shadow-2xl mb-6 object-cover"
          />
          <h1 className="text-[30px] font-bold text-white tracking-tight">Cantieri</h1>
          <p className="text-[15px] text-slate-300 mt-2 text-center leading-relaxed max-w-xs">
            L'app per il posatore di pavimenti in cemento.
            Tutto in un posto, tutto offline.
          </p>
        </div>

        {/* Features */}
        <div className="flex-1 px-5 py-8 space-y-5 bg-white dark:bg-slate-950">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-semibold text-[15px] text-slate-900 dark:text-white">{f.title}</div>
                <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}

          <div className="pt-2 text-[12px] text-slate-400 dark:text-slate-500 text-center leading-relaxed">
            Tutti i dati rimangono solo sul tuo telefono.{'\n'}Nessun cloud, nessun account.
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-12 pt-2 bg-white dark:bg-slate-950">
          <button
            onClick={() => setStep(2)}
            className="w-full h-14 rounded-2xl bg-slate-700 text-white text-[17px] font-semibold active:scale-[0.97] transition-transform shadow-lg"
          >
            Continua →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6 bg-gradient-to-b from-slate-700 to-slate-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <div className="w-2 h-2 rounded-full bg-white" />
        </div>
        <h2 className="text-[24px] font-bold text-white tracking-tight mt-2">Il tuo profilo</h2>
        <p className="text-[14px] text-slate-300 mt-1 text-center">
          Personalizza l'app in base al tuo ruolo
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 py-8 space-y-6 bg-white dark:bg-slate-950">
        {/* Nome */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Nome e cognome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Es. Marco Rossi"
            className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[15px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-400 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors"
          />
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            Provincia
          </label>
          <select
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[15px] text-slate-900 dark:text-white focus:border-slate-400 focus:bg-white dark:focus:bg-slate-900 outline-none transition-colors appearance-none"
          >
            <option value="">Seleziona provincia...</option>
            <optgroup label="Veneto">
              {PROVINCE_OPTS.slice(0, 7).map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </optgroup>
            <optgroup label="Altre province">
              {PROVINCE_OPTS.slice(7).map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Ruolo — solo Impresa */}
        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-700 bg-slate-700 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Building2 size={26} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-[16px]">Posatore / Impresa</div>
            <div className="text-[12px] mt-0.5 text-slate-300">Gestisci cantieri, operai e verbali</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-12 pt-2 bg-white dark:bg-slate-950 space-y-3">
        <button
          onClick={handleStart}
          disabled={!canProceed}
          className="w-full h-14 rounded-2xl bg-slate-700 text-white text-[17px] font-semibold active:scale-[0.97] transition-transform shadow-lg disabled:opacity-40 disabled:scale-100"
        >
          Inizia →
        </button>
        <button
          onClick={() => setStep(1)}
          className="w-full text-center text-[13px] text-slate-400 py-1"
        >
          ← Indietro
        </button>
      </div>
    </div>
  );
}
