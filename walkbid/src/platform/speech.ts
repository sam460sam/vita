// Speech-to-text wrapper. Native via @capacitor-community/speech-recognition,
// web via the Web Speech API. Locales en-US (default) and es-US (crew log).
// Press-and-hold: start() begins streaming partial results, stop() resolves the
// final transcript. Falls back gracefully (callers offer a text field).
import { Capacitor } from '@capacitor/core';
import type { Locale } from '@/data/types';

export const speechLocale = (l: Locale): string => (l === 'es' ? 'es-US' : 'en-US');

interface WebSR extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionResultEventLike) => void) | null;
  onerror: (() => void) | null;
}
interface SpeechRecognitionResultEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}

function webCtor(): (new () => WebSR) | null {
  const w = window as unknown as { SpeechRecognition?: new () => WebSR; webkitSpeechRecognition?: new () => WebSR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export async function speechAvailable(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
      const { available } = await SpeechRecognition.available();
      return available;
    } catch {
      return false;
    }
  }
  return webCtor() !== null;
}

export interface SpeechSession {
  stop: () => Promise<string>;
}

/** Begin a session; `onPartial` streams interim text. Resolve final via stop(). */
export async function startSpeech(locale: Locale, onPartial: (text: string) => void): Promise<SpeechSession> {
  const lang = speechLocale(locale);

  if (Capacitor.isNativePlatform()) {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const perm = await SpeechRecognition.checkPermissions();
    if (perm.speechRecognition !== 'granted') {
      const req = await SpeechRecognition.requestPermissions();
      if (req.speechRecognition !== 'granted') throw new Error('Microphone permission denied');
    }
    let last = '';
    await SpeechRecognition.addListener('partialResults', (data: { matches: string[] }) => {
      last = data.matches?.[0] ?? last;
      onPartial(last);
    });
    await SpeechRecognition.start({ language: lang, partialResults: true, popup: false });
    return {
      stop: async () => {
        await SpeechRecognition.stop();
        await SpeechRecognition.removeAllListeners();
        return last;
      },
    };
  }

  const Ctor = webCtor();
  if (!Ctor) throw new Error('Speech recognition unavailable');
  const sr = new Ctor();
  sr.lang = lang;
  sr.continuous = true;
  sr.interimResults = true;
  let transcript = '';
  sr.onresult = (e) => {
    let interim = '';
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i];
      const text = res[0]?.transcript ?? '';
      if (res.isFinal) transcript += text + ' ';
      else interim += text;
    }
    onPartial((transcript + interim).trim());
  };
  sr.start();
  return {
    stop: async () => {
      sr.stop();
      return transcript.trim();
    },
  };
}
