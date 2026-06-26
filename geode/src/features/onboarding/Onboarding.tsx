// ============================================================================
// Onboarding — 4 swipeable slides. Honest pitch. The LAST slide CTA starts the
// first free scan (NOT the paywall) — the paywall comes after the first "wow"
// (BUILD-SPEC §2.2).
// ============================================================================
import { useState } from 'react';
import { Camera, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/ui';
import { cn } from '@/lib/cn';

interface Slide {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    icon: <Sparkles size={40} />,
    title: 'Meet Geode',
    body: 'Point your camera at any crystal, rock, mineral or gem and get an honest, AI-powered identification in seconds.',
    accent: '#a87bff',
  },
  {
    icon: <Camera size={40} />,
    title: 'Point → Identify → Collect',
    body: 'Snap a photo, see the top matches with real confidence scores, then save your finds to a beautiful offline collection.',
    accent: '#f0c3ff',
  },
  {
    icon: <ShieldCheck size={40} />,
    title: 'Honest by design',
    body: 'No single over-confident guess. Geode shows up to 3 candidates and asks quick physical-test questions to narrow it down.',
    accent: '#3ddc97',
  },
  {
    icon: <Layers size={40} />,
    title: 'Your pocket rock guide',
    body: 'A free “Stone of the Day”, care tips and a searchable collection — most of it works fully offline. Your first scan is on us.',
    accent: '#a87bff',
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  return (
    <div className="flex min-h-full flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))]">
      <div className="flex justify-end">
        {!last && (
          <button onClick={onDone} className="text-sm font-medium text-ink-3 hover:text-ink-2">
            Skip
          </button>
        )}
      </div>

      <div key={i} className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
        <div
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-[32px] text-white shadow-glow"
          style={{ background: `linear-gradient(140deg, ${slide.accent}, #6d28d9)` }}
        >
          {slide.icon}
        </div>
        <h1 className="mb-3 text-[28px] font-bold leading-tight text-ink">{slide.title}</h1>
        <p className="max-w-sm text-[16px] leading-relaxed text-ink-2">{slide.body}</p>
      </div>

      <div className="mb-8 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              idx === i ? 'w-6 bg-amethyst' : 'w-2 bg-white/15',
            )}
          />
        ))}
      </div>

      <Button
        block
        size="lg"
        onClick={() => (last ? onDone() : setI(i + 1))}
        icon={last ? <Camera size={20} /> : undefined}
      >
        {last ? 'Start my first scan' : 'Continue'}
      </Button>
    </div>
  );
}
