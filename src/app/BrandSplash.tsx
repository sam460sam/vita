import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import vLogoUrl from '/vyta-v.png';

/**
 * Animated brand splash shown on app launch: the green "V" logo appears centered,
 * then the word unfolds into "Vyta" (the V is the logo, "yta" is the same green).
 * Self-dismisses after the sequence. Rendered above everything at the app root.
 */
export function BrandSplash() {
  const [stage, setStage] = useState<'play' | 'out' | 'gone'>('play');

  useEffect(() => {
    // Respect reduced-motion: skip straight to a quick fade.
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const holdMs = reduce ? 700 : 2100;
    const t1 = setTimeout(() => setStage('out'), holdMs);
    const t2 = setTimeout(() => setStage('gone'), holdMs + 460);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (stage === 'gone') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-app select-none',
        stage === 'out' && 'animate-brand-fade',
      )}
      aria-hidden
    >
      <div className="flex items-center" style={{ gap: 2 }}>
        <img
          src={vLogoUrl}
          alt=""
          draggable={false}
          className="animate-brand-v object-contain"
          style={{ height: 86, width: 'auto', transformOrigin: 'center' }}
        />
        <span
          className="animate-brand-word inline-block overflow-hidden whitespace-nowrap font-extrabold tracking-tight text-primary"
          style={{ fontSize: 60, lineHeight: 1 }}
        >
          yta
        </span>
      </div>
    </div>
  );
}
