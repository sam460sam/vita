import { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

// Canvas signature capture. Draws on a white field (so the exported PNG embeds
// cleanly into the printable PDF). Exposes the PNG via onChange.
interface Props {
  onChange: (hasInk: boolean) => void;
  height?: number;
}

export interface SignatureHandle {
  toPngBlob: () => Promise<Blob | null>;
  clear: () => void;
}

export function SignaturePad({ onChange, height = 200, handleRef }: Props & { handleRef: { current: SignatureHandle | null } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const inked = useRef(false);
  const [, force] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#0E1013';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    handleRef.current = {
      toPngBlob: () =>
        new Promise((resolve) => {
          if (!inked.current) return resolve(null);
          canvas.toBlob((b) => resolve(b), 'image/png');
        }),
      clear: () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);
        inked.current = false;
        onChange(false);
        force((n) => n + 1);
      },
    };

    const pos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      drawing.current = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      canvas.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      if (!inked.current) {
        inked.current = true;
        onChange(true);
        force((n) => n + 1);
      }
    };
    const up = () => {
      drawing.current = false;
    };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointerleave', up);
    return () => {
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointerleave', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="signature-canvas w-full rounded-card border border-steel bg-white" style={{ height }} />
      <button
        type="button"
        onClick={() => handleRef.current?.clear()}
        className="absolute right-2 top-2 flex items-center gap-1 rounded-btn bg-asphalt/80 px-2 py-1 text-xs font-semibold text-chalk"
      >
        <Eraser size={13} /> Clear
      </button>
    </div>
  );
}
