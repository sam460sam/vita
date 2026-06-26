// ============================================================================
// Result screen (BUILD-SPEC §2.5) — the honesty-first differentiator.
// Shows up to 3 candidates with confidence, a selectable detail card, the
// "refine" flow, save/share/new-scan, and a fixed AI disclaimer.
// Pro gates: "traditional meanings", "value range" and unlimited refine.
// ============================================================================
import { useState } from 'react';
import { ArrowLeft, Bookmark, Check, Lock, RefreshCw, Share2, Sparkles, X } from 'lucide-react';
import { Button, ConfidenceBar, Pill, useToast } from '@/ui';
import { cn } from '@/lib/cn';
import type { Candidate, IdentifyResult, RefineAnswer } from '@/lib/api';
import { api } from '@/lib/api';
import { stonesRepo } from '@/data/repo';
import { platform } from '@/platform/platform';
import { buildShareCard } from './shareCard';
import { RefineSheet } from './RefineSheet';

interface Props {
  photoDataUrl: string;
  imageBase64: string;
  initial: IdentifyResult;
  isPro: boolean;
  onUnlock: () => void;
  onClose: () => void;
  onNewScan: () => void;
}

const DISCLAIMER =
  'Identification is an AI-generated estimate and may be wrong. Don’t use it for safety, medical, or high-value buying/selling decisions.';

export function ResultScreen({ photoDataUrl, imageBase64, initial, isPro, onUnlock, onClose, onNewScan }: Props) {
  const toast = useToast();
  const [result, setResult] = useState<IdentifyResult>(initial);
  const [selected, setSelected] = useState(0);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refining, setRefining] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);

  const candidates = result.candidates;
  const top = candidates[selected];

  // Not a stone / empty.
  if (candidates.length === 0) {
    return (
      <Shell onClose={onClose}>
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-ink-3">
            <X size={30} />
          </div>
          <h2 className="mb-2 text-xl font-bold text-ink">Hmm, that doesn’t look like a stone</h2>
          <p className="mb-8 max-w-sm text-[15px] text-ink-2">
            {result.note || 'Try again with a clear, well-lit photo of a single crystal, rock or gem filling the frame.'}
          </p>
          <Button size="lg" icon={<RefreshCw size={18} />} onClick={onNewScan}>
            New scan
          </Button>
        </div>
      </Shell>
    );
  }

  const runRefine = async (answers: RefineAnswer[]) => {
    if (!isPro) {
      setRefineOpen(false);
      onUnlock();
      return;
    }
    setRefining(true);
    try {
      const next = await api.refine(imageBase64, answers);
      if (next.candidates.length) {
        setResult(next);
        setSelected(0);
        toast.show('Result refined ✨');
      } else {
        toast.show('Couldn’t refine — keeping current result');
      }
      setRefineOpen(false);
    } catch {
      toast.show('Refine failed. Check your connection.');
    } finally {
      setRefining(false);
    }
  };

  const save = async () => {
    if (saved) return;
    await stonesRepo.addFromCandidate(photoDataUrl, top, candidates);
    setSaved(true);
    platform.haptic('success');
    toast.show('Saved to your collection');
  };

  const share = async () => {
    setSharing(true);
    try {
      const blob = await buildShareCard({ photoDataUrl, candidate: top });
      await platform.shareImage(blob, `${top.common_name.replace(/\s+/g, '-').toLowerCase()}-geode.png`, `I identified this ${top.common_name} with Geode!`);
    } catch {
      toast.show('Couldn’t create the share card');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Shell onClose={onClose}>
      <div className="flex-1 overflow-y-auto px-4 pb-40 pt-2">
        {/* Photo */}
        <div className="relative mx-auto mb-5 aspect-square w-full max-w-xs overflow-hidden rounded-[28px] shadow-glass">
          <img src={photoDataUrl} alt="Your stone" className="h-full w-full object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>

        {result.low_confidence && (
          <div className="mx-auto mb-4 flex max-w-md items-center gap-2 rounded-xl bg-warning/10 px-3.5 py-2.5 text-[13px] text-warning">
            <Sparkles size={15} className="shrink-0" />
            Low confidence — answer a couple of quick tests below to narrow it down.
          </div>
        )}

        {/* Candidates */}
        <div className="mb-1 px-1 text-[13px] font-semibold uppercase tracking-wider text-ink-3">
          {candidates.length > 1 ? 'Top matches' : 'Best match'}
        </div>
        <div className="space-y-2">
          {candidates.map((c, i) => (
            <CandidateRow key={i} c={c} active={i === selected} onClick={() => setSelected(i)} />
          ))}
        </div>

        {/* Refine CTA */}
        {result.refine_questions.length > 0 && (
          <button
            onClick={() => setRefineOpen(true)}
            className="mt-4 flex w-full items-center justify-between rounded-2xl bg-amethyst/10 px-4 py-3.5 text-left transition-colors hover:bg-amethyst/15"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amethyst/20 text-amethyst">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="text-[15px] font-semibold text-ink">Refine the result</div>
                <div className="text-[13px] text-ink-3">Answer {result.refine_questions.length} quick physical tests</div>
              </div>
            </div>
            {!isPro && <Lock size={16} className="text-ink-3" />}
          </button>
        )}

        {/* Detail card for the selected candidate */}
        <DetailCard candidate={top} isPro={isPro} onUnlock={onUnlock} />

        <p className="mx-1 mt-5 text-center text-[12px] leading-relaxed text-ink-3">{DISCLAIMER}</p>
      </div>

      {/* Sticky action bar */}
      <div className="absolute inset-x-0 bottom-0 border-t border-line bg-section/80 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <div className="flex gap-2">
          <Button variant="glass" className="flex-1" icon={saved ? <Check size={18} /> : <Bookmark size={18} />} onClick={save}>
            {saved ? 'Saved' : 'Save'}
          </Button>
          <Button variant="glass" className="flex-1" loading={sharing} icon={!sharing ? <Share2 size={18} /> : undefined} onClick={share}>
            Share
          </Button>
          <Button className="flex-1" icon={<RefreshCw size={18} />} onClick={onNewScan}>
            New
          </Button>
        </div>
      </div>

      <RefineSheet
        open={refineOpen}
        onClose={() => setRefineOpen(false)}
        questions={result.refine_questions}
        loading={refining}
        onSubmit={runRefine}
      />
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-app animate-fade-in">
      <div className="flex items-center justify-between px-3 pt-[max(12px,env(safe-area-inset-top))] pb-1">
        <button onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-white/5">
          <ArrowLeft size={22} />
        </button>
        <div className="text-[15px] font-semibold text-ink">Identification</div>
        <div className="h-10 w-10" />
      </div>
      {children}
    </div>
  );
}

function CandidateRow({ c, active, onClick }: { c: Candidate; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all',
        active ? 'bg-card ring-1 ring-amethyst/40' : 'bg-white/[0.03] hover:bg-white/[0.06]',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[15px] font-semibold text-ink">{c.common_name}</span>
          <span className="shrink-0 text-sm font-bold text-quartz">{Math.round(c.confidence)}%</span>
        </div>
        {c.scientific_name && <div className="truncate text-[12px] italic text-ink-3">{c.scientific_name}</div>}
        <ConfidenceBar value={c.confidence} className="mt-1.5" />
      </div>
    </button>
  );
}

function DetailCard({ candidate, isPro, onUnlock }: { candidate: Candidate; isPro: boolean; onUnlock: () => void }) {
  return (
    <div className="mt-5 rounded-card bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{candidate.common_name}</h3>
          {candidate.scientific_name && <div className="text-[13px] italic text-ink-3">{candidate.scientific_name}</div>}
        </div>
        {candidate.mohs_hardness && <Pill tone="amethyst">Mohs {candidate.mohs_hardness}</Pill>}
      </div>

      {candidate.description && <p className="mb-4 text-[14px] leading-relaxed text-ink-2">{candidate.description}</p>}

      {candidate.key_features && (
        <Field label="What the photo shows" body={candidate.key_features} />
      )}
      {candidate.care_tips && <Field label="Care & cleaning" body={candidate.care_tips} />}

      {/* Pro-gated content */}
      <LockedField
        label="Traditional meanings (folklore)"
        body={candidate.traditional_meanings}
        note="Tradition / folklore — not health or medical advice."
        isPro={isPro}
        onUnlock={onUnlock}
      />
      <LockedField
        label="Indicative value"
        body={candidate.value_range_usd}
        note="Rough estimate, not an appraisal."
        isPro={isPro}
        onUnlock={onUnlock}
      />
    </div>
  );
}

function Field({ label, body, note }: { label: string; body: string; note?: string }) {
  return (
    <div className="mb-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <p className="text-[14px] leading-relaxed text-ink-2">{body}</p>
      {note && <p className="mt-1 text-[11px] italic text-ink-3">{note}</p>}
    </div>
  );
}

function LockedField({
  label,
  body,
  note,
  isPro,
  onUnlock,
}: {
  label: string;
  body: string;
  note: string;
  isPro: boolean;
  onUnlock: () => void;
}) {
  if (!body) return null;
  if (isPro) return <Field label={label} body={body} note={note} />;
  return (
    <div className="mb-3 border-t border-line pt-3">
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        <Lock size={12} /> {label}
      </div>
      <div className="relative">
        <p className="select-none text-[14px] leading-relaxed text-ink-2 blur-[6px]">{body}</p>
        <button
          onClick={onUnlock}
          className="absolute inset-0 flex items-center justify-center rounded-lg text-[13px] font-semibold text-quartz"
        >
          Unlock with Pro
        </button>
      </div>
    </div>
  );
}
