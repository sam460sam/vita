import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useI18n } from '@/i18n';
import { Textarea } from './Field';
import { cn } from '@/lib/cn';
import { speechAvailable, startSpeech, type SpeechSession } from '@/platform/speech';
import { haptic } from '@/platform/haptics';

// Press & hold to dictate; live partial results stream into the editable field
// so the owner can fix anything. If speech is unavailable, it's just a textarea.
interface Props {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

export function VoiceCapture({ value, onChange, placeholder }: Props) {
  const { lang } = useI18n();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const session = useRef<SpeechSession | null>(null);
  const base = useRef('');

  useEffect(() => {
    speechAvailable().then(setAvailable);
  }, []);

  async function start() {
    if (listening) return;
    base.current = value ? value.trim() + ' ' : '';
    try {
      await haptic('light');
      session.current = await startSpeech(lang, (partial) => onChange(base.current + partial));
      setListening(true);
    } catch {
      setAvailable(false);
    }
  }

  async function stop() {
    if (!session.current) return;
    const final = await session.current.stop();
    session.current = null;
    setListening(false);
    onChange(base.current + final);
    await haptic('light');
  }

  return (
    <div>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[120px]" />
      {available !== false && (
        <button
          type="button"
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={() => listening && stop()}
          className={cn(
            'mt-3 flex min-h-touch w-full items-center justify-center gap-2 rounded-btn font-display font-bold transition-colors',
            listening ? 'bg-risk text-white' : 'bg-safety text-asphalt',
          )}
        >
          {listening ? <Square size={18} /> : <Mic size={18} />}
          {listening ? 'Listening… release to stop' : 'Hold to talk'}
        </button>
      )}
      {available === false && <p className="mt-2 text-xs text-dust">Voice unavailable — type above.</p>}
    </div>
  );
}
