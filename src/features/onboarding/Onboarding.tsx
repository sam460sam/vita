import { useState } from 'react';
import { Sparkles, ShieldCheck, Plus } from 'lucide-react';
import { Button, Input } from '@/ui';
import { useT } from '@/i18n';
import { updateSettings } from '@/data/repo';

const STORAGE_KEY = 'vita.onboarded';

export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true; // fail open — never block the app
  }
}

function markOnboarded() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Full-screen first-run onboarding. Calls onDone when finished/skipped. */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');

  const slides = [
    { icon: Sparkles, color: 'var(--c-project)', title: t('onboard.1.title'), desc: t('onboard.1.desc') },
    { icon: ShieldCheck, color: 'var(--c-habit)', title: t('onboard.2.title'), desc: t('onboard.2.desc') },
    { icon: Plus, color: 'var(--c-activity)', title: t('onboard.3.title'), desc: t('onboard.3.desc') },
  ];

  const last = step === slides.length - 1;

  async function finish() {
    if (name.trim()) await updateSettings({ name: name.trim() });
    markOnboarded();
    onDone();
  }

  function skip() {
    markOnboarded();
    onDone();
  }

  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[70] bg-app flex flex-col pt-safe-top pb-safe-bottom animate-fade-in">
      <div className="flex justify-end px-5 pt-3">
        <button onClick={skip} className="text-[14px] font-semibold text-ink-3 px-3 py-2">
          {t('onboard.skip')}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <span className="h-20 w-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: `${slide.color}1a`, color: slide.color }}>
          <Icon size={40} />
        </span>
        <h1 className="text-2xl font-bold text-ink">{slide.title}</h1>
        <p className="text-[15px] text-ink-2 mt-2 max-w-sm leading-relaxed">{slide.desc}</p>

        {last && (
          <div className="w-full max-w-xs mt-7 text-left">
            <label className="block text-[13px] font-semibold text-ink-2 mb-1.5">{t('onboard.name')}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onboard.namePh')} />
          </div>
        )}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-5">
        {slides.map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-250"
            style={{ width: i === step ? 24 : 8, background: i === step ? 'var(--c-ink)' : 'var(--c-line)' }}
          />
        ))}
      </div>

      <div className="px-6 pb-6">
        <Button block size="lg" onClick={() => (last ? finish() : setStep((s) => s + 1))}>
          {last ? t('onboard.start') : t('onboard.next')}
        </Button>
      </div>
    </div>
  );
}
