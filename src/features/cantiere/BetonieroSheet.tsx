import { useState } from 'react';
import { HardHat, Calculator, PenTool, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { Sheet } from '@/ui';

const GUIDE = [
  {
    icon: <HardHat size={18} className="text-slate-600" />,
    title: 'Cantieri',
    steps: [
      'Tocca il + arancione per aggiungere un nuovo cantiere.',
      'Inserisci cliente, indirizzo, m², spessore e importo.',
      'Aggiorna lo stato man mano che il lavoro avanza.',
      'Segna i pagamenti ricevuti per non perdere i crediti.',
    ],
  },
  {
    icon: <Calculator size={18} className="text-slate-600" />,
    title: 'Calcolo cemento',
    steps: [
      'Apri un cantiere e scorri fino a "Calcolo cemento".',
      'I m³ vengono calcolati in automatico (m² × spessore × 0.01).',
      'Scegli la classe cemento (es. C25/30) e gli additivi.',
      'Tocca "Copia messaggio" per inviarlo al rappresentante via WhatsApp.',
    ],
  },
  {
    icon: <PenTool size={18} className="text-slate-600" />,
    title: 'Verbale di consegna',
    steps: [
      'Alla fine del lavoro, apri il cantiere e tocca "Apri verbale".',
      'Leggi il disclaimer al cliente e fallo accettare.',
      'Inserisci il suo nome, scatta foto del lavoro, fai firmare con il dito.',
      'La firma è legalmente valida (eIDAS/CAD) — protezione contro contestazioni.',
    ],
  },
  {
    icon: <Users size={18} className="text-slate-600" />,
    title: 'Operai',
    steps: [
      'Tocca l\'icona persone in alto a destra nella schermata Cantieri.',
      'Aggiungi i tuoi collaboratori con specializzazioni e valutazione.',
      'Le note private non sono visibili agli operai — solo a te.',
      'Associa gli operai a un cantiere dal form di modifica.',
    ],
  },
];

interface SectionProps {
  section: typeof GUIDE[0];
}

function GuideSection({ section }: SectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-slate-800 active:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          {section.icon}
        </div>
        <span className="flex-1 text-left font-semibold text-[15px] text-slate-900 dark:text-white">
          {section.title}
        </span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 bg-slate-50 dark:bg-slate-900 space-y-2">
          {section.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BetonieroSheet({ open, onClose }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Come funziona" size="full">
      {/* Mascot header */}
      <div className="flex flex-col items-center py-5 mb-4">
        <img
          src="./betoniera.png"
          alt="Betoniero"
          className="w-20 h-20 rounded-[20px] shadow-md mb-3"
        />
        <p className="text-[14px] text-slate-500 dark:text-slate-400 text-center max-w-xs leading-relaxed">
          Ciao! Sono il Betoniero. Ti spiego come usare l'app in pochi passi.
        </p>
      </div>

      {/* Guide sections */}
      <div className="space-y-3 pb-4">
        {GUIDE.map((s) => (
          <GuideSection key={s.title} section={s} />
        ))}
      </div>

      <div className="text-center text-[12px] text-slate-400 pb-2">
        Tocca ogni sezione per espanderla
      </div>
    </Sheet>
  );
}
