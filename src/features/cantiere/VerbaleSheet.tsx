import { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import { Sheet, Button, Field, Input } from '@/ui';
import { useToast } from '@/ui';
import { saveCantiere } from '@/data/cantiere-repo';
import type { Cantiere } from '@/data/types';
import { formatEuro } from './logic';
import { CHECKLIST_ITEMS } from './verbale-data';

export { CHECKLIST_ITEMS };

// Shown to client in-app; full legal text goes in PDF
const RIEPILOGO_VERBALE =
  'Il presente documento costituisce verbale di collaudo e accettazione definitiva ' +
  "dell'opera ai sensi dell'art. 1665 c.c. Con la firma, il committente dichiara che i " +
  'lavori sono stati eseguiti a regola d\'arte e accetta il saldo dovuto alle condizioni ' +
  'indicate. Le clausole relative ai vizi apparenti, agli interessi di mora e al foro ' +
  'competente richiedono approvazione separata (art. 1341 c.c.).';

interface Props {
  open: boolean;
  cantiere: Cantiere;
  onClose: () => void;
}

type Step = 'dati' | 'firma';

export function VerbaleSheet({ open, cantiere, onClose }: Props) {
  const { show } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const [step, setStep] = useState<Step>('dati');
  const [clienteNome, setClienteNome] = useState('');
  const [scadenzaPagamento, setScadenzaPagamento] = useState('');
  const [foto, setFoto] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [firmaPresente, setFirmaPresente] = useState(false);

  // Art. 1341 c.c. — clausole che richiedono specifica approvazione
  const [art1341Approvato, setArt1341Approvato] = useState(false);
  // General acceptance
  const [accettazioneGenerale, setAccettazioneGenerale] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('dati');
      setClienteNome(cantiere.verbaleClienteNome ?? cantiere.cliente);
      setScadenzaPagamento(cantiere.scadenzaPagamento ?? '');
      setAccettazioneGenerale(false);
      setArt1341Approvato(false);
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

  async function salva() {
    const firma = firmaPresente ? canvasRef.current?.toDataURL() : undefined;
    const timestamp = new Date().toISOString();
    await saveCantiere({
      ...cantiere,
      foto,
      firmaCliente: firma,
      verbaleTimestamp: firma ? timestamp : cantiere.verbaleTimestamp,
      verbaleClienteNome: clienteNome.trim() || cantiere.cliente,
      verbaleDisclaimerAccettato: accettazioneGenerale && art1341Approvato,
      scadenzaPagamento: scadenzaPagamento || cantiere.scadenzaPagamento,
    });
    show('Verbale salvato');
    onClose();
  }

  const saldo = cantiere.importo - (cantiere.acconto ?? 0);
  const canProceed = accettazioneGenerale && art1341Approvato && clienteNome.trim().length > 0;

  // ---- Step 1: dati + consensi ----
  if (step === 'dati') {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title="Verbale di consegna"
        footer={
          <Button onClick={() => setStep('firma')} block disabled={!canProceed}>
            Procedi alla firma →
          </Button>
        }
      >
        {/* Saldo in evidenza */}
        {saldo > 0 && (
          <div className="bg-slate-800 text-white rounded-xl p-4 mb-4 text-center">
            <div className="text-[12px] text-slate-300 mb-0.5">Saldo da pagare alla firma</div>
            <div className="text-3xl font-bold">{formatEuro(saldo)}</div>
            {cantiere.acconto != null && cantiere.acconto > 0 && (
              <div className="text-[11px] text-slate-400 mt-0.5">
                Totale {formatEuro(cantiere.importo)} · Acconto {formatEuro(cantiere.acconto)} già ricevuto
              </div>
            )}
          </div>
        )}

        {/* Descrizione documento */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-ink">Documento legale vincolante</span>
          </div>
          <p className="text-[12.5px] text-ink-2 leading-relaxed">{RIEPILOGO_VERBALE}</p>
        </div>

        {/* Nome cliente */}
        <Field label="Nome e cognome del firmatario *">
          <Input
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Mario Rossi"
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Verificare l'identità del cliente prima di procedere (documento d'identità).
          </p>
        </Field>

        {/* Scadenza pagamento */}
        <Field label="Scadenza pagamento">
          <Input
            type="date"
            value={scadenzaPagamento}
            onChange={(e) => setScadenzaPagamento(e.target.value)}
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Indicare la data entro cui il saldo deve essere versato.
          </p>
        </Field>

        {/* Accettazione generale */}
        <div className="mt-3 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-line bg-section">
            <input
              type="checkbox"
              checked={accettazioneGenerale}
              onChange={(e) => setAccettazioneGenerale(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded accent-slate-700 flex-shrink-0"
            />
            <span className="text-[13px] leading-snug text-ink">
              Il committente dichiara di aver verificato i lavori e di accettarli
              come conformi alle condizioni pattuite (art. 1665 c.c.), impegnandosi
              al pagamento del saldo indicato alle scadenze concordate.
            </span>
          </label>

          {/* Art. 1341 — clausole vessatorie: specifica approvazione */}
          <div className="p-3 rounded-xl border-2 border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Scale size={14} className="text-slate-600 dark:text-slate-400 flex-shrink-0" />
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Approvazione specifica — art. 1341 c.c.
              </span>
            </div>
            <p className="text-[11.5px] text-ink-3 mb-3 leading-relaxed">
              Le seguenti clausole limitano diritti del committente e richiedono
              approvazione separata per essere valide (art. 1341 comma 2 c.c.):
            </p>
            <ul className="text-[12px] text-ink-2 space-y-1.5 mb-3 pl-1">
              <li>• <strong>Esclusione vizi apparenti</strong> — i difetti visibili al momento
                dell'accettazione non potranno essere contestati successivamente (art. 1667 c.c.)</li>
              <li>• <strong>Interessi di mora automatici</strong> — in caso di ritardo nel pagamento
                decorrono automaticamente gli interessi senza necessità di messa in mora
                (D.Lgs. 231/2002 per rapporti commerciali; art. 1224 c.c. per rapporti civili)</li>
              <li>• <strong>Foro esclusivo di Treviso</strong> — per qualsiasi controversia è
                competente il Tribunale di Treviso</li>
            </ul>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={art1341Approvato}
                onChange={(e) => setArt1341Approvato(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded accent-slate-700 flex-shrink-0"
              />
              <span className="text-[13px] font-semibold leading-snug text-ink">
                Il committente approva specificamente le clausole sopra elencate
              </span>
            </label>
          </div>
        </div>

        <p className="text-[10.5px] text-ink-3 mt-3 text-center leading-relaxed">
          Firma Elettronica Semplice (FES) · Reg. UE 910/2014 (eIDAS) · D.Lgs. 82/2005 (CAD)
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
          <strong>{clienteNome}</strong> · clausole approvate · in attesa di firma
        </span>
      </div>

      {/* Photos */}
      <Field label="Foto del lavoro (documentazione probatoria)">
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
      <Field label="Conformità lavoro — spuntare le voci verificate">
        <div className="space-y-2.5">
          {CHECKLIST_ITEMS.map((item) => (
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
      <Field label="Firma autografa del committente">
        <p className="text-[12px] text-ink-3 mb-2">
          {clienteNome} — {new Date().toLocaleString('it-IT')}
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
