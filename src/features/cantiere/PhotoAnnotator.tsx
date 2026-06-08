import { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface Props {
  src: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

const COLORS = [
  { value: '#ef4444', label: 'Rosso' },
  { value: '#000000', label: 'Nero' },
  { value: '#ffffff', label: 'Bianco' },
  { value: '#3b82f6', label: 'Blu' },
];

function getPos(
  e: React.Touch | React.MouseEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const clientX = 'clientX' in e ? (e as React.MouseEvent).clientX : (e as React.Touch).clientX;
  const clientY = 'clientY' in e ? (e as React.MouseEvent).clientY : (e as React.Touch).clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

export function PhotoAnnotator({ src, onSave, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#ef4444');
  const [thick, setThick] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0);
    };
    img.src = src;
  }, [src]);

  function startDraw(pos: { x: number; y: number }) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((h) => [...h, snapshot]);
    lastPos.current = pos;
    setDrawing(true);
  }

  function moveDraw(pos: { x: number; y: number }) {
    if (!drawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thick ? 8 : 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    setDrawing(false);
    lastPos.current = null;
  }

  function undo() {
    if (history.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const last = history[history.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory((h) => h.slice(0, -1));
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/jpeg', 0.85));
  }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    startDraw(getPos(e.touches[0], canvas));
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;
    moveDraw(getPos(e.touches[0], canvas));
  }

  function onMouseDown(e: React.MouseEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    startDraw(getPos(e, canvas));
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    moveDraw(getPos(e, canvas));
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80">
        <button
          onClick={onCancel}
          className="h-9 w-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10"
          aria-label="Annulla"
        >
          <X size={20} />
        </button>
        <span className="text-white font-semibold text-[15px]">Annota foto</span>
        <button
          onClick={handleSave}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-on-primary"
          aria-label="Salva"
        >
          <Check size={20} />
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ maxWidth: '100%', maxHeight: '100%', touchAction: 'none', cursor: 'crosshair' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0 bg-black/80 gap-4">
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              aria-label={c.label}
              className="w-7 h-7 rounded-full border-2 transition-transform"
              style={{
                backgroundColor: c.value,
                borderColor: color === c.value ? 'var(--c-primary)' : 'transparent',
                transform: color === c.value ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThick(false)}
            className={`h-7 px-3 rounded-full text-[12px] font-medium transition-colors ${
              !thick ? 'bg-primary text-on-primary' : 'bg-white/10 text-white/60'
            }`}
          >
            Sottile
          </button>
          <button
            onClick={() => setThick(true)}
            className={`h-7 px-3 rounded-full text-[12px] font-medium transition-colors ${
              thick ? 'bg-primary text-on-primary' : 'bg-white/10 text-white/60'
            }`}
          >
            Spesso
          </button>
        </div>

        <button
          onClick={undo}
          disabled={history.length === 0}
          className="h-9 w-9 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30"
          aria-label="Annulla ultima"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
