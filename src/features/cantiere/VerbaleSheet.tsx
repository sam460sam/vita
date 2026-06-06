import { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Sheet, Button, Field } from '@/ui';
import { useToast } from '@/ui';
import { saveCantiere } from '@/data/cantiere-repo';
import type { Cantiere } from '@/data/types';

const CHECKLIST = [
  'Spessore conforme al contratto',
  'Planarità entro tolleranza (3mm/3m)',
  'Superficie priva di crepe visibili',
  'Stagionatura completata correttamente',
  'Cantiere pulito e consegnato',
];

interface Props {
  open: boolean;
  cantiere: Cantiere;
  onClose: () => void;
}

export function VerbaleSheet({ open, cantiere, onClose }: Props) {
  const { show } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [foto, setFoto] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [firmaPresente, setFirmaPresente] = useState(false);

  useEffect(() => {
    if (open) {
      setFoto(cantiere.foto ?? []);
      setChecklist([]);
      setFirmaPresente(!!cantiere.firmaCliente);
      // Draw existing signature after canvas is rendered
      if (cantiere.firmaCliente) {
        setTimeout(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const img = new Image();
          img.onload = () => canvas.getContext('2d')?.drawImage(img, 0, 0);
          img.src = cantiere.firmaCliente!;
        }, 50);
      }
    }
  }, [open, cantiere]);

  function getPos(e: React.TouchEvent | React.MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * sx,
        y: (e.touches[0].clientY - rect.top) * sy,
      };
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

  function onEnd() {
    drawing.current = false;
  }

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
    setChecklist((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  async function salva() {
    const firma = firmaPresente ? canvasRef.current?.toDataURL() : undefined;
    await saveCantiere({ ...cantiere, foto, firmaCliente: firma });
    show('Verbale salvato');
    onClose();
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Verbale di consegna"
      footer={<Button onClick={salva} block>Salva verbale</Button>}
    >
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
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-line flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
            <Camera size={22} className="text-ink-3" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={addFoto}
            />
          </label>
        </div>
      </Field>

      {/* Checklist */}
      <Field label="Conformità lavoro">
        <div className="space-y-2.5">
          {CHECKLIST.map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.includes(item)}
                onChange={() => toggleCheck(item)}
                className="w-4 h-4 rounded accent-amber-500 flex-shrink-0"
              />
              <span className="text-[14px]">{item}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Signature pad */}
      <Field label="Firma cliente">
        <p className="text-[12px] text-ink-3 mb-2">Il cliente firma qui per accettare il lavoro</p>
        <div className="border-2 border-line rounded-xl overflow-hidden bg-white">
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
          className="text-[13px] text-ink-3 mt-1.5 hover:text-ink-2 transition-colors"
        >
          Pulisci firma
        </button>
      </Field>
    </Sheet>
  );
}
