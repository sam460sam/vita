// ============================================================================
// "Analysis in progress" state — shows the captured photo with an animated
// scanning overlay while the proxy call runs (BUILD-SPEC §2.4).
// ============================================================================
import { useEffect, useState } from 'react';

const STEPS = [
  'Enhancing your photo…',
  'Examining colour & lustre…',
  'Matching against minerals…',
  'Ranking the best candidates…',
];

export function Analyzing({ photo }: { photo: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 animate-fade-in">
      <div className="relative h-72 w-72 overflow-hidden rounded-[32px] shadow-glass">
        <img src={photo} alt="Your stone" className="h-full w-full object-cover" />
        {/* scanning sheen */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-amethyst/0 via-amethyst/40 to-amethyst/0"
            style={{ animation: 'scan 2s ease-in-out infinite' }}
          />
        </div>
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
      </div>

      <div className="mt-8 flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-amethyst/30 border-t-amethyst" />
        <span className="text-[15px] font-medium text-ink-2">{STEPS[step]}</span>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(300%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </div>
  );
}
