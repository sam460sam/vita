// ============================================================================
// AI consent screen (REQUIRED — Apple, Nov 2025). Shown before the first scan.
// Must name the AI provider explicitly (BUILD-SPEC §2.3). Consent persists in
// Preferences so it's only shown once.
// ============================================================================
import { ShieldCheck, Cloud, Lock, ImageOff } from 'lucide-react';
import { Button } from '@/ui';
import { CONFIG } from '@/lib/config';

export function ConsentScreen({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="flex min-h-full flex-col px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(40px,env(safe-area-inset-top))] animate-fade-in">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amethyst/15 text-amethyst">
          <ShieldCheck size={38} />
        </div>
        <h1 className="mb-3 text-2xl font-bold text-ink">Before we identify</h1>
        <p className="max-w-md text-[15px] leading-relaxed text-ink-2">
          To identify your {CONFIG.verticalNoun}, your photo is sent to{' '}
          <span className="font-semibold text-quartz">{CONFIG.aiProviderName}</span> for analysis. We don’t collect
          personal data and we don’t store your photos on our servers.
        </p>

        <div className="mt-8 w-full max-w-md space-y-3 text-left">
          <Row icon={<Cloud size={18} />} title={`Analyzed by ${CONFIG.aiProviderName}`} body="Your photo is processed to recognize the stone, then discarded." />
          <Row icon={<ImageOff size={18} />} title="Photos aren’t stored on our servers" body="Anything you save stays only on this device, in your collection." />
          <Row icon={<Lock size={18} />} title="No account, no personal data" body="Geode works without sign-in. We don’t track who you are." />
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <Button block size="lg" onClick={onAccept}>
          Accept &amp; continue
        </Button>
        <Button block variant="ghost" onClick={onDecline}>
          No
        </Button>
        <p className="text-center text-xs text-ink-3">
          You can read the full details in our Privacy Policy any time in Settings.
        </p>
      </div>
    </div>
  );
}

function Row({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white/[0.04] p-3.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amethyst/15 text-amethyst">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-ink">{title}</div>
        <div className="text-[13px] leading-snug text-ink-3">{body}</div>
      </div>
    </div>
  );
}
