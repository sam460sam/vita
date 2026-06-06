import { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Sheet, Button, Field, Input } from '@/ui';
import { useToast } from '@/ui';
import { saveCantiere } from '@/data/cantiere-repo';
import type { Cantiere } from '@/data/types';

const CHECKLIST = [
  'Spessore conforme al contratto',
  'Planarità entro tolleranza (3mm/3m — UNI 10966)',
  'Superficie priva di crepe o distacchi visibili',
  'Stagionatura completata correttamente',
  'Cantiere pulito e sgombrato',
];

const DISCLAIMER =
  'Firmando il presente verbale, il sottoscritto dichiara di aver ispezionato il lavoro eseguito e ' +
  'di accettarlo come conforme alle condizioni contrattuali concordate. ' +
  'La presente firma elettronica semplice ha valore probatorio ai sensi del Regolamento UE 910/2014 (eIDAS) ' +
  'e del D.Lgs. 82/2005 (CAD). Eventuali vizi occulti potranno essere segnalati entro 60 giorni ' +
  'ai sensi dell\'art. 1667 c.c. È esclusa qualsiasi contestazione relativa a difetti visibili ' +
  'al momento della presente accettazione.';

interface Props {
  open: boolean;
  cantiere: Cantiere;
  onClose: () => void;
}

type Step = 'disclaimer' | 'firma';

export function VerbaleSheet({ open, cantiere, onClose }: Props) {
  const { show } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const [step, setStep] = useState<Step>('disclaimer');
  const [clienteNome, setClienteNome] = useState('');
  const [disclaimerAccettato, setDisclaimerAccettato] = useState(false);
  const [foto, setFoto] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [firmaPresente, setFirmaPresente] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('disclaimer');
      setClienteNome(cantiere.verbaleClienteNome ?? cantiere.cliente);
      setDisclaimerAccettato(false);
      setFoto(cantiere.foto ?? []);
      setChecklist([]);
      setFirmaPresente(!!cantiere.firmaCliente);
      if (cantiere.firmaCliente) {
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const img = new Image();
          img.onload = () => canvas.getContext('2d')?.drawImage(img, 0, 0);
          img.src = cantiere.firmaCliente!;
        }, 80);
      }
    }
  }, [open, cantiere]);

  // --- Canvas signature ---
  function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * sx, y: (e.touches[0].clientY - rect.top) * sy };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  function initCtx() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return null;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  }

  function onStart(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault();
    drawing.current = true;
    setFirmaPresente(true);
    const ctx = initCtx();
    if (!ctx) return;
    const { x, y } = getPos(e, canvasRef.current!);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function onMove(e: React.TouchEvent | React.MouseEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = initCtx();
    if (!ctx) return;
    const { x, y } = getPos(e, canvasRef.current!);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function onEnd() { drawing.current = false; }

  function clearFirma() {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaPresente(false);
  }

  // --- Photos ---
  function addFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setFoto((f) => [...f, ev.target!.result as string]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function toggleCheck(item: string) {
    setChecklist((prev) => prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]);
  }

  // --- Save ---
  async function salva() {
    const firma = firmaPresente ? canvasRef.current?.toDataURL() : undefined;
    const timestamp = new Date().toISOString();
    await saveCantiere({
      ...cantiere,
      foto,
      firmaCliente: firma,
      verbaleTimestamp: firma ? timestamp : cantiere.verbaleTimestamp,
      verbaleClienteNome: clienteNome.trim() || cantiere.cliente,
      verbaleDisclaimerAccettato: disclaimerAccettato,
    });
    show('Verbale salvato');
    onClose();
  }

  // ---- Step 1: disclaimer + client name ----
  if (step === 'disclaimer') {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title="Verbale di consegna"
        footer={
          <Button
            onClick={() => setStep('firma')}
            block
            disabled={!disclaimerAccettato || !clienteNome.trim()}
          >
            Procedi alla firma →
          </Button>
        }
      >
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-ink">Documento legale</span>
          </div>
          <p className="text-[13px] text-ink-2 leading-relaxed">{DISCLAIMER}</p>
        </div>

        <Field label="Nome e cognome del cliente che firma *">
          <Input
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Mario Rossi"
            autoFocus
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Verifica l'identità del cliente prima di procedere.
          </p>
        </Field>

        <label className="flex items-start gap-3 cursor-pointer mt-2 p-3 rounded-xl border border-line">
          <input
            type="checkbox"
            checked={disclaimerAccettato}
            onChange={(e) => setDisclaimerAccettato(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded accent-slate-600 flex-shrink-0"
          />
          <span className="text-[14px] leading-snug">
            Il cliente ha letto e accetta il presente verbale di consegna
          </span>
        </label>

        <p className="text-[11px] text-ink-3 mt-3 text-center">
          Firma elettronica semplice (FES) · Reg. UE 910/2014 · D.Lgs. 82/2005
        </p>
      </Sheet>
    );
  }

  // ---- Step 2: photos + checklist + signature ----
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Firma e documentazione"
      footer={<Button onClick={salva} block>Salva verbale</Button>}
    >
      {/* Confirmation banner */}
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 mb-4">
        <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
        <span className="text-[13px] text-green-700 dark:text-green-300">
          <strong>{clienteNome}</strong> ha accettato il verbale
        </span>
      </div>

      {/* Photos */}
      <Field label="Foto del lavoro">
        <div className="flex flex-wrap gap-2 mb-1">
          {foto.map((f, i) => (
            <div key={i} className="relative">
              <img src={f} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <button
                onClick={() => setFoto((arr) => arr.filter((_, idx) => idx !== i))}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-line flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
            <Camera size={22} className="text-ink-3" />
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={addFoto} />
          </label>
        </div>
      </Field>

      {/* Checklist */}
      <Field label="Conformità lavoro (UNI 10966)">
        <div className="space-y-2.5">
          {CHECKLIST.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.includes(item)}
                onChange={() => toggleCheck(item)}
                className="w-4 h-4 rounded accent-slate-600 flex-shrink-0"
              />
              <span className="text-[13px]">{item}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Signature canvas */}
      <Field label="Firma del cliente">
        <p className="text-[12px] text-ink-3 mb-2">
          Il cliente firma qui con il dito — {new Date().toLocaleString('it-IT')}
        </p>
        <div className="border-2 border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full touch-none block"
            style={{ cursor: 'crosshair' }}
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
          />
        </div>
        <button
          onClick={clearFirma}
          className="text-[12px] text-ink-3 mt-1.5 hover:text-ink-2 transition-colors"
        >
          Pulisci firma
        </button>
      </Field>
    </Sheet>
  );
}
