// ============================================================================
// Scan flow orchestrator: consent → capture → analyze → result.
// Handles client-side compression, the cache, the free-scan counter and errors.
// ============================================================================
import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Camera as CameraIcon, WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/ui';
import { processImage } from '@/lib/image';
import { hashImage } from '@/lib/hash';
import { isDemoMode } from '@/lib/demo';
import { api, ApiError, type IdentifyResult } from '@/lib/api';
import { cacheRepo } from '@/data/repo';
import { takePhoto, type PhotoSource } from '@/platform/camera';
import { useAppState } from '@/state/AppState';
import { ConsentScreen } from '@/features/consent/ConsentScreen';
import { Analyzing } from './Analyzing';
import { ResultScreen } from '@/features/result/ResultScreen';

type Step = 'consent' | 'capture' | 'analyzing' | 'result' | 'error';

export function ScanFlow({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const { aiConsent, grantAiConsent, isPro, freeScansLeft, registerScan } = useAppState();
  const [step, setStep] = useState<Step>(aiConsent ? 'capture' : 'consent');
  const [photo, setPhoto] = useState('');
  const [base64, setBase64] = useState('');
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState<{ msg: string; offline: boolean } | null>(null);

  // If consent gets granted elsewhere while mounted, advance.
  useEffect(() => {
    if (aiConsent && step === 'consent') setStep('capture');
  }, [aiConsent, step]);

  const capture = async (source: PhotoSource) => {
    const raw = await takePhoto(source);
    if (!raw) return; // cancelled
    await analyze(raw);
  };

  const analyze = async (rawDataUrl: string) => {
    setStep('analyzing');
    setError(null);
    try {
      const processed = await processImage(rawDataUrl);
      setPhoto(processed.dataUrl);
      setBase64(processed.base64);

      // Cache: identical image → cached result, no second API call.
      const hash = hashImage(processed.base64);
      const cached = await cacheRepo.get(hash);
      let res: IdentifyResult;
      if (cached) {
        res = cached;
      } else {
        res = await api.identify(processed.base64);
        await cacheRepo.put(hash, res);
        // Only count a *real* identification against the free quota.
        await registerScan();
      }
      setResult(res);
      setStep('result');
    } catch (e) {
      const err = e as ApiError;
      setError({
        msg: err.message || 'Something went wrong. Please try again.',
        offline: err instanceof ApiError && err.kind === 'offline',
      });
      setStep('error');
    }
  };

  // ---- render -------------------------------------------------------------

  if (step === 'consent') {
    return (
      <Overlay>
        <ConsentScreen onAccept={() => void grantAiConsent()} onDecline={onClose} />
      </Overlay>
    );
  }

  if (step === 'analyzing') {
    return (
      <Overlay>
        <Analyzing photo={photo} />
      </Overlay>
    );
  }

  if (step === 'error' && error) {
    return (
      <Overlay>
        <Header onBack={onClose} />
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-ink-3">
            {error.offline ? <WifiOff size={28} /> : <RotateCcw size={28} />}
          </div>
          <h2 className="mb-2 text-xl font-bold text-ink">
            {error.offline ? 'You’re offline' : 'Couldn’t identify'}
          </h2>
          <p className="mb-8 max-w-sm text-[15px] text-ink-2">{error.msg}</p>
          <div className="flex gap-2">
            <Button variant="glass" onClick={() => setStep('capture')}>
              Choose another photo
            </Button>
            {photo && <Button onClick={() => void analyze(photo)}>Try again</Button>}
          </div>
        </div>
      </Overlay>
    );
  }

  if (step === 'result' && result) {
    return (
      <ResultScreen
        photoDataUrl={photo}
        imageBase64={base64}
        initial={result}
        isPro={isPro}
        onUnlock={onUnlock}
        onClose={onClose}
        onNewScan={() => {
          setResult(null);
          setStep('capture');
        }}
      />
    );
  }

  // capture
  return (
    <Overlay>
      <Header onBack={onClose} />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 animate-float items-center justify-center rounded-[28px] bg-gradient-amethyst text-white shadow-glow">
          <CameraIcon size={42} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-ink">Identify a stone</h1>
        <p className="mb-8 max-w-xs text-[15px] text-ink-2">
          Fill the frame with a single, well-lit stone for the best result.
        </p>

        <div className="w-full max-w-sm space-y-3">
          <Button block size="lg" icon={<CameraIcon size={20} />} onClick={() => void capture('camera')}>
            Take a photo
          </Button>
          <Button block size="lg" variant="glass" icon={<ImagePlus size={20} />} onClick={() => void capture('photos')}>
            Choose from gallery
          </Button>
        </div>

        {!isPro && (
          <p className="mt-6 text-[13px] text-ink-3">
            {freeScansLeft > 0
              ? `${freeScansLeft} free scan${freeScansLeft > 1 ? 's' : ''} left`
              : 'Free scans used'}
          </p>
        )}

        {isDemoMode() && (
          <p className="mt-3 rounded-pill bg-warning/10 px-3 py-1.5 text-[12px] font-medium text-warning">
            Demo mode — results are simulated (no AI key configured)
          </p>
        )}
      </div>
    </Overlay>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return <div className="fixed inset-0 z-40 flex flex-col bg-app animate-fade-in">{children}</div>;
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center px-3 pt-[max(12px,env(safe-area-inset-top))] pb-1">
      <button onClick={onBack} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-white/5">
        <ArrowLeft size={22} />
      </button>
    </div>
  );
}
