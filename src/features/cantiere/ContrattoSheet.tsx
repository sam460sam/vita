import { useRef, useState, useEffect } from 'react';
import { CheckCircle2, Scale, FileSignature } from 'lucide-react';
import { Sheet, Button, Field, Input } from '@/ui';
import { useToast } from '@/ui';
import { saveCantiere } from '@/data/cantiere-repo';
import { useTeam } from '@/auth/TeamContext';
import type { Cantiere } from '@/data/types';
import { formatEuro } from './logic';

const RIEPILOGO_CONTRATTO =
  'Il presente documento costituisce contratto di appalto per l\'esecuzione di ' +
  'lavori di pavimentazione in calcestruzzo ai sensi dell\'art. 1655 c.c. Con la ' +
  'firma, il committente accetta le condizioni tecniche ed economiche indicate e ' +
  'si impegna al pagamento del corrispettivo pattuito. Le clausole relative agli ' +
  'interessi di mora e al foro competente richiedono approvazione separata ' +
  '(art. 1341 c.c.).';

interface Props {
  open: boolean;
  cantiere: Cantiere;
  onClose: () => void;
}

type Step = 'dati' | 'firma';

export function ContrattoSheet({ open, cantiere, onClose }: Props) {
  const { show } = useToast();
  const { team } = useTeam();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const [step, setStep] = useState<Step>('dati');
  const [clienteNome, setClienteNome] = useState('');
  const [firmaPresente, setFirmaPresente] = useState(false);
  const [accettazioneGenerale, setAccettazioneGenerale] = useState(false);
  const [art1341Approvato, setArt1341Approvato] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('dati');
      setClienteNome(cantiere.contrattoClienteNome ?? cantiere.cliente);
      setAccettazioneGenerale(false);
      setArt1341Approvato(false);
      setFirmaPresente(!!cantiere.contrattoFirmaCliente);
      if (cantiere.contrattoFirmaCliente) {
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const img = new Image();
          img.onload = () => canvas.getContext('2d')?.drawImage(img, 0, 0);
          img.src = cantiere.contrattoFirmaCliente!;
        }, 80);
      }
    }
  }, [open, cantiere]);

  // ── Canvas signature ──────────────────────────────────────────────

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

  async function salva() {
    const firma = firmaPresente ? canvasRef.current?.toDataURL() : undefined;
    const timestamp = new Date().toISOString();
    const primaFirma = !!firma && !cantiere.contrattoFirmaCliente;
    if (!team) return;
    await saveCantiere({
      ...cantiere,
      contrattoFirmaCliente: firma,
      contrattoTimestamp: firma ? timestamp : cantiere.contrattoTimestamp,
      contrattoClienteNome: clienteNome.trim() || cantiere.cliente,
      // Confermato → in_corso when client signs contract (unless already further along)
      stato: primaFirma && cantiere.stato === 'preventivo' ? 'confermato' : cantiere.stato,
    }, team.id);
    show(primaFirma ? 'Contratto firmato — cantiere confermato' : 'Contratto salvato');
    onClose();
  }

  const saldo = cantiere.importo - (cantiere.acconto ?? 0);
  const canProceed = accettazioneGenerale && art1341Approvato && clienteNome.trim().length > 0;

  // ── Step 1: dati + consensi ──────────────────────────────────────

  if (step === 'dati') {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title="Contratto pre-lavori"
        footer={
          <Button onClick={() => setStep('firma')} block disabled={!canProceed}>
            Procedi alla firma →
          </Button>
        }
      >
        {/* Riepilogo lavori */}
        <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
          <div className="text-[12px] text-slate-300 mb-2 font-semibold uppercase tracking-wide">
            Riepilogo lavori
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 text-[13px]">
            <span className="text-slate-400">Superficie</span>
            <span className="font-semibold text-right">{cantiere.mq} m²</span>
            <span className="text-slate-400">Spessore</span>
            <span className="font-semibold text-right">{cantiere.spessore} cm</span>
            {cantiere.dataPrevista && (
              <>
                <span className="text-slate-400">Data prevista</span>
                <span className="font-semibold text-right">
                  {new Date(cantiere.dataPrevista).toLocaleDateString('it-IT')}
                </span>
              </>
            )}
            <span className="text-slate-400">Importo totale</span>
            <span className="font-bold text-right text-[15px]">{formatEuro(cantiere.importo)}</span>
            {cantiere.acconto != null && cantiere.acconto > 0 && (
              <>
                <span className="text-slate-400">Acconto</span>
                <span className="font-semibold text-right text-green-400">{formatEuro(cantiere.acconto)}</span>
                <span className="text-slate-400">Saldo alla consegna</span>
                <span className="font-semibold text-right text-amber-400">{formatEuro(saldo)}</span>
              </>
            )}
          </div>
          {cantiere.note && (
            <p className="text-[11.5px] text-slate-400 mt-2 italic border-t border-slate-700 pt-2">
              {cantiere.note}
            </p>
          )}
        </div>

        {/* Descrizione documento */}
        <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2 mb-2">
            <FileSignature size={15} className="text-primary flex-shrink-0 mt-0.5" />
            <span className="text-[13px] font-semibold text-ink">Contratto vincolante</span>
          </div>
          <p className="text-[12.5px] text-ink-2 leading-relaxed">{RIEPILOGO_CONTRATTO}</p>
        </div>

        {/* Nome firmatario */}
        <Field label="Nome e cognome del firmatario *">
          <Input
            value={clienteNome}
            onChange={(e) => setClienteNome(e.target.value)}
            placeholder="Mario Rossi"
          />
          <p className="text-[11px] text-ink-3 mt-1">
            Verificare l'identità del cliente prima di procedere.
          </p>
        </Field>

        {/* Checkboxes */}
        <div className="mt-3 space-y-3">
          {/* Accettazione generale */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-line bg-section">
            <input
              type="checkbox"
              checked={accettazioneGenerale}
              onChange={(e) => setAccettazioneGenerale(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded accent-slate-700 flex-shrink-0"
            />
            <span className="text-[13px] leading-snug text-ink">
              Il committente dichiara di aver preso visione delle condizioni tecniche
              ed economiche e accetta di commissionare i lavori alle condizioni
              descritte nel presente contratto (art. 1655 c.c.), impegnandosi al
              pagamento del corrispettivo indicato.
            </span>
          </label>

          {/* Art. 1341 */}
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

  // ── Step 2: firma ─────────────────────────────────────────────────

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Firma contratto"
      footer={<Button onClick={salva} block>Salva contratto</Button>}
    >
      {/* Confirmation banner */}
      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-3 py-2 mb-4">
        <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />
        <span className="text-[13px] text-green-700 dark:text-green-300">
          <strong>{clienteNome}</strong> · clausole approvate · in attesa di firma
        </span>
      </div>

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

      <p className="text-[11px] text-ink-3 mt-2 leading-relaxed">
        Con la firma il committente sottoscrive il contratto e approva le clausole
        indicate. Il documento PDF verrà generato e potrà essere condiviso.
      </p>
    </Sheet>
  );
}
