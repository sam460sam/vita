import { useEffect, useState } from 'react';
import { X, Share2 } from 'lucide-react';
import { StarMascot } from '@/ui';
import { useI18n } from '@/i18n';
import type { WeeklyRecap } from './logic';

/**
 * Full-screen, tappable "Wrapped"-style recap of the week. Tap the right side to
 * advance, the left side to go back. Pure presentation over the weekly recap
 * data — no data leaves the device.
 */
interface Slide {
  bg: string;
  kicker: string;
  big: string;
  label: string;
}

const CHROME = {
  yourWeek: { it: 'La tua settimana', en: 'Your week' },
  intro: { it: 'Ecco cosa hai costruito', en: "Here's what you built" },
  habits: { it: 'abitudini completate', en: 'habits completed' },
  water: { it: "d'acqua bevuta", en: 'of water' },
  workouts: { it: 'allenamenti', en: 'workouts' },
  tasks: { it: 'task completati', en: 'tasks completed' },
  journal: { it: 'pagine di diario', en: 'journal entries' },
  outro: { it: 'Continua così 💪', en: 'Keep it up 💪' },
  share: { it: 'Condividi', en: 'Share' },
} as const;

export function WrappedStories({ recap, name, onClose, onShare }: { recap: WeeklyRecap; name?: string; onClose: () => void; onShare: () => void }) {
  const { lang } = useI18n();
  const liters = `${(recap.waterMl / 1000).toFixed(1)} L`;

  const slides: Slide[] = [
    { bg: 'linear-gradient(160deg, #7C3AED, #4F46E5)', kicker: name ? `${name} ·` : '', big: '✨', label: CHROME.intro[lang] },
    { bg: 'linear-gradient(160deg, #FF6B57, #EF4444)', kicker: CHROME.yourWeek[lang], big: String(recap.habitsCompleted), label: CHROME.habits[lang] },
    { bg: 'linear-gradient(160deg, #0EA5E9, #2563EB)', kicker: CHROME.yourWeek[lang], big: liters, label: CHROME.water[lang] },
    { bg: 'linear-gradient(160deg, #10B981, #059669)', kicker: CHROME.yourWeek[lang], big: String(recap.workouts), label: CHROME.workouts[lang] },
    { bg: 'linear-gradient(160deg, #F59E0B, #D97706)', kicker: CHROME.yourWeek[lang], big: String(recap.tasksCompleted), label: CHROME.tasks[lang] },
    { bg: 'linear-gradient(160deg, #EC4899, #BE185D)', kicker: CHROME.yourWeek[lang], big: String(recap.journalEntries), label: CHROME.journal[lang] },
  ];

  const [i, setI] = useState(0);
  const total = slides.length + 1; // + outro
  const isOutro = i >= slides.length;

  // Close on Escape for desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setI((v) => Math.min(total - 1, v + 1));
      if (e.key === 'ArrowLeft') setI((v) => Math.max(0, v - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, total]);

  function next() {
    setI((v) => (v + 1 >= total ? v : v + 1));
  }
  function prev() {
    setI((v) => Math.max(0, v - 1));
  }

  const bg = isOutro ? 'linear-gradient(160deg, #111827, #312E81)' : slides[i].bg;

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white pt-safe-top pb-safe-bottom" style={{ background: bg }}>
      {/* progress bars */}
      <div className="flex gap-1 px-3 pt-3">
        {Array.from({ length: total }).map((_, idx) => (
          <div key={idx} className="h-1 flex-1 rounded-full bg-white/30 overflow-hidden">
            <div className="h-full bg-white transition-all" style={{ width: idx < i ? '100%' : idx === i ? '100%' : '0%' }} />
          </div>
        ))}
      </div>

      <button onClick={onClose} aria-label="Close" className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-white/15 flex items-center justify-center mt-safe-top">
        <X size={20} />
      </button>

      {/* tap zones */}
      <button onClick={prev} className="absolute inset-y-0 left-0 w-1/3 z-0" aria-label="Previous" />
      <button onClick={next} className="absolute inset-y-0 right-0 w-2/3 z-0" aria-label="Next" />

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
        {isOutro ? (
          <>
            <StarMascot size={96} mood="starstruck" animated />
            <div className="text-3xl font-extrabold mt-5">Vyta</div>
            <p className="text-lg font-semibold text-white/90 mt-1">{CHROME.outro[lang]}</p>
            <button
              onClick={onShare}
              className="pointer-events-auto mt-8 inline-flex items-center gap-2 bg-white text-ink font-semibold rounded-full h-12 px-6"
            >
              <Share2 size={18} /> {CHROME.share[lang]}
            </button>
          </>
        ) : (
          <>
            {slides[i].kicker && <div className="text-sm font-semibold uppercase tracking-wide text-white/80 mb-3">{slides[i].kicker}</div>}
            <div className="text-7xl font-extrabold tnum leading-none">{slides[i].big}</div>
            <div className="text-xl font-semibold text-white/90 mt-3 max-w-[16rem]">{slides[i].label}</div>
          </>
        )}
      </div>
    </div>
  );
}
