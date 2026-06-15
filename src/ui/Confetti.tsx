import { useEffect, useMemo } from 'react';

const COLORS = ['#C9A227', '#16a34a', '#0EA5E9', '#f472b6', '#fbbf24', '#8b93ff', '#ff6b4a'];

/** Full-screen one-shot confetti rain for celebrations. Auto-unmounts via onDone. */
export function Confetti({ count = 90, onDone }: { count?: number; onDone?: () => void }) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), 1900);
    return () => clearTimeout(id);
  }, [onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        dur: 1.2 + Math.random() * 0.8,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 7,
        rot: Math.random() * 360,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `confetti-rain ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
