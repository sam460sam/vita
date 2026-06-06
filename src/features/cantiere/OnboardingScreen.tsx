import { HardHat, Calculator, PenTool, Users } from 'lucide-react';

interface Props {
  onDone: () => void;
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

export function OnboardingScreen({ onDone }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
      {/* Hero */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6 bg-gradient-to-b from-slate-700 to-slate-900">
        <img
          src="./betoniera.svg"
          alt="Cantieri"
          className="w-28 h-28 rounded-[28px] shadow-2xl mb-6"
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
          onClick={onDone}
          className="w-full h-14 rounded-2xl bg-slate-700 text-white text-[17px] font-semibold active:scale-[0.97] transition-transform shadow-lg"
        >
          Inizia subito →
        </button>
      </div>
    </div>
  );
}
