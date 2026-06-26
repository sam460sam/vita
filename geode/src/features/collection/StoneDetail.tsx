// ============================================================================
// Stone detail — editable: notes, find location, tags. Re-share, delete.
// Shown as a full sheet over the collection (BUILD-SPEC §2.6).
// ============================================================================
import { useEffect, useState } from 'react';
import { Share2, Trash2 } from 'lucide-react';
import { Sheet, Button, Pill, useToast } from '@/ui';
import { stonesRepo } from '@/data/repo';
import type { SavedStone } from '@/data/types';
import { formatDate } from '@/lib/format';
import { platform } from '@/platform/platform';
import { buildShareCard } from '@/features/result/shareCard';

export function StoneDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast();
  const [stone, setStone] = useState<SavedStone | null>(null);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let on = true;
    void stonesRepo.get(id).then((s) => {
      if (!on || !s) return;
      setStone(s);
      setNotes(s.notes);
      setLocation(s.foundLocation);
      setTagsText(s.tags.join(', '));
    });
    return () => {
      on = false;
    };
  }, [id]);

  const persist = async () => {
    if (!stone) return;
    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    await stonesRepo.update(stone.id, { notes, foundLocation: location, tags });
  };

  const close = async () => {
    await persist();
    onClose();
  };

  const remove = async () => {
    if (!stone) return;
    if (!confirm(`Remove ${stone.commonName} from your collection?`)) return;
    await stonesRepo.remove(stone.id);
    toast.show('Removed from collection');
    onClose();
  };

  const share = async () => {
    if (!stone) return;
    setSharing(true);
    try {
      const blob = await buildShareCard({
        photoDataUrl: stone.photo,
        candidate: {
          common_name: stone.commonName,
          scientific_name: stone.scientificName,
          confidence: stone.confidence,
          key_features: stone.keyFeatures,
          mohs_hardness: stone.mohsHardness,
          description: stone.description,
          traditional_meanings: stone.traditionalMeanings,
          care_tips: stone.careTips,
          value_range_usd: stone.valueRange,
        },
      });
      await platform.shareImage(blob, `${stone.commonName.replace(/\s+/g, '-').toLowerCase()}-geode.png`);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Sheet open onClose={close} title={stone?.commonName ?? 'Stone'} size="full">
      {!stone ? null : (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-card">
            <img src={stone.photo} alt={stone.commonName} className="aspect-square w-full object-cover" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {stone.scientificName && <span className="text-[13px] italic text-ink-3">{stone.scientificName}</span>}
            {stone.mohsHardness && <Pill tone="amethyst">Mohs {stone.mohsHardness}</Pill>}
            <Pill>{Math.round(stone.confidence)}% match</Pill>
            <span className="ml-auto text-[12px] text-ink-3">{formatDate(stone.createdAt)}</span>
          </div>

          {stone.description && <p className="text-[14px] leading-relaxed text-ink-2">{stone.description}</p>}

          <Editable label="Your notes" value={notes} onChange={setNotes} onBlur={persist} placeholder="Add notes about this stone…" textarea />
          <Editable label="Where you found it" value={location} onChange={setLocation} onBlur={persist} placeholder="e.g. Lake Superior shore" />
          <Editable label="Tags (comma separated)" value={tagsText} onChange={setTagsText} onBlur={persist} placeholder="e.g. purple, tumbled, gift" />

          {stone.careTips && <ReadOnly label="Care & cleaning" body={stone.careTips} />}
          {stone.traditionalMeanings && (
            <ReadOnly label="Traditional meanings (folklore)" body={stone.traditionalMeanings} note="Tradition / folklore — not health advice." />
          )}
          {stone.valueRange && <ReadOnly label="Indicative value" body={stone.valueRange} note="Rough estimate, not an appraisal." />}

          <div className="flex gap-2 pt-2">
            <Button variant="glass" className="flex-1" loading={sharing} icon={!sharing ? <Share2 size={18} /> : undefined} onClick={share}>
              Share
            </Button>
            <Button variant="danger" icon={<Trash2 size={18} />} onClick={remove}>
              Remove
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function Editable({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    'w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-ink placeholder:text-ink-3 outline-none ring-1 ring-white/5 focus:ring-amethyst/50';
  return (
    <div>
      <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

function ReadOnly({ label, body, note }: { label: string; body: string; note?: string }) {
  return (
    <div>
      <div className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">{label}</div>
      <p className="text-[14px] leading-relaxed text-ink-2">{body}</p>
      {note && <p className="mt-1 text-[11px] italic text-ink-3">{note}</p>}
    </div>
  );
}
