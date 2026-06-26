// ============================================================================
// Home — "Stone of the Day" (offline retention loop), a big scan CTA, and a
// preview of the user's collection (BUILD-SPEC §2.7).
// ============================================================================
import { useLiveQuery } from 'dexie-react-hooks';
import { Camera, ChevronRight, Crown, Sparkles } from 'lucide-react';
import { Card, SectionTitle } from '@/ui';
import { stoneOfTheDay } from '@/data/reference';
import { stonesRepo } from '@/data/repo';
import { CONFIG } from '@/lib/config';
import { useAppState } from '@/state/AppState';
import { useNav } from '@/app/nav';

export function HomeScreen() {
  const { isPro, freeScansLeft, startScan, openPaywall } = pickNav();
  const stones = useLiveQuery(() => stonesRepo.all(), [], []);
  const sod = stoneOfTheDay();

  return (
    <div className="px-4 pt-[max(20px,env(safe-area-inset-top))] pb-tab">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-ink-3">{CONFIG.appName}</div>
          <h1 className="text-[26px] font-bold leading-tight text-ink">{greeting()}</h1>
        </div>
        {!isPro && (
          <button
            onClick={() => openPaywall('manual')}
            className="inline-flex items-center gap-1.5 rounded-pill bg-amethyst/15 px-3 py-1.5 text-[13px] font-semibold text-quartz"
          >
            <Crown size={14} /> Unlock Pro
          </button>
        )}
      </div>

      {/* Primary scan CTA */}
      <button
        onClick={startScan}
        className="group relative mb-6 flex w-full items-center gap-4 overflow-hidden rounded-card bg-gradient-amethyst p-5 text-left text-white shadow-glow"
      >
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
          <Camera size={28} />
        </div>
        <div className="relative">
          <div className="text-lg font-bold">Identify a stone</div>
          <div className="text-[13px] text-white/80">
            {isPro ? 'Unlimited scans' : `${freeScansLeft} free scan${freeScansLeft === 1 ? '' : 's'} left`}
          </div>
        </div>
        <ChevronRight size={22} className="relative ml-auto opacity-70 transition-transform group-active:translate-x-1" />
      </button>

      {/* Stone of the Day */}
      <SectionTitle className="mb-2">Stone of the day</SectionTitle>
      <Card glass className="mb-6">
        <div className="flex gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{ background: `linear-gradient(140deg, ${sod.color}, #2a1a45)` }}
          >
            {sod.name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[17px] font-bold text-ink">{sod.name}</h3>
              <span className="rounded-pill bg-white/5 px-2 py-0.5 text-[11px] text-ink-3">Mohs {sod.mohs}</span>
            </div>
            <div className="text-[12px] italic text-ink-3">{sod.scientific}</div>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">{sod.fact}</p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/[0.03] p-3">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-amethyst" />
          <div>
            <span className="text-[13px] text-ink-2">{sod.folklore}</span>
            <span className="ml-1 text-[11px] italic text-ink-3">(folklore — not medical advice)</span>
          </div>
        </div>
      </Card>

      {/* Collection preview */}
      <div className="mb-2 flex items-center justify-between">
        <SectionTitle>Your collection</SectionTitle>
        {stones.length > 0 && <CollectionLink />}
      </div>
      {stones.length === 0 ? (
        <Card className="text-center">
          <p className="py-4 text-[14px] text-ink-2">
            Your saved stones will appear here. Identify your first one to start your collection.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {stones.slice(0, 6).map((s) => (
            <PreviewTile key={s.id} photo={s.photo} name={s.commonName} id={s.id} />
          ))}
        </div>
      )}
    </div>
  );
}

// Small helpers that need nav without importing into module scope twice.
function pickNav() {
  const app = useAppState();
  const nav = useNav();
  return { ...app, ...nav };
}

function CollectionLink() {
  const { setTab } = useNav();
  return (
    <button onClick={() => setTab('collection')} className="flex items-center gap-0.5 text-[13px] font-medium text-quartz">
      See all <ChevronRight size={15} />
    </button>
  );
}

function PreviewTile({ photo, name, id }: { photo: string; name: string; id: string }) {
  const { openStone } = useNav();
  return (
    <button onClick={() => openStone(id)} className="relative aspect-square overflow-hidden rounded-2xl">
      <img src={photo} alt={name} className="h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
        <span className="line-clamp-1 text-[11px] font-medium text-white">{name}</span>
      </div>
    </button>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
