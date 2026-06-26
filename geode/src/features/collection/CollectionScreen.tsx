// ============================================================================
// Collection (BUILD-SPEC §2.6) — the retention loop. Fully offline grid of
// saved stones with search, stats, and tap-through to an editable detail.
// ============================================================================
import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Gem, Camera } from 'lucide-react';
import { Button, SectionTitle } from '@/ui';
import { stonesRepo } from '@/data/repo';
import { useNav } from '@/app/nav';

export function CollectionScreen() {
  const { startScan, openStone } = useNav();
  const stones = useLiveQuery(() => stonesRepo.all(), [], []);
  const [q, setQ] = useState('');

  const species = useMemo(
    () => new Set(stones.map((s) => s.commonName.toLowerCase().trim())).size,
    [stones],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return stones;
    return stones.filter(
      (s) =>
        s.commonName.toLowerCase().includes(needle) ||
        s.scientificName.toLowerCase().includes(needle) ||
        s.notes.toLowerCase().includes(needle) ||
        s.foundLocation.toLowerCase().includes(needle) ||
        s.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [stones, q]);

  return (
    <div className="px-4 pt-[max(20px,env(safe-area-inset-top))] pb-tab">
      <h1 className="mb-1 text-[26px] font-bold text-ink">Collection</h1>
      <p className="mb-4 text-[14px] text-ink-2">
        {stones.length} {stones.length === 1 ? 'stone' : 'stones'} · {species} {species === 1 ? 'species' : 'different species'}
      </p>

      {stones.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-ink-3">
            <Gem size={30} />
          </div>
          <h2 className="mb-2 text-lg font-bold text-ink">No stones yet</h2>
          <p className="mb-6 max-w-xs text-[14px] text-ink-2">
            Identify a crystal or rock and tap “Save” to start building your collection.
          </p>
          <Button icon={<Camera size={18} />} onClick={startScan}>
            Identify a stone
          </Button>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-white/[0.05] px-3.5 py-2.5">
            <Search size={18} className="text-ink-3" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, tag, location…"
              className="w-full bg-transparent text-[15px] text-ink placeholder:text-ink-3 outline-none"
            />
          </div>

          {filtered.length === 0 ? (
            <SectionTitle className="py-8 text-center">No matches for “{q}”</SectionTitle>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openStone(s.id)}
                  className="overflow-hidden rounded-card bg-card text-left transition-transform active:scale-[0.98]"
                >
                  <div className="relative aspect-square">
                    <img src={s.photo} alt={s.commonName} className="h-full w-full object-cover" />
                    <span className="absolute right-2 top-2 rounded-pill bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-quartz backdrop-blur">
                      {Math.round(s.confidence)}%
                    </span>
                  </div>
                  <div className="p-2.5">
                    <div className="line-clamp-1 text-[14px] font-semibold text-ink">{s.commonName}</div>
                    {s.scientificName && (
                      <div className="line-clamp-1 text-[11px] italic text-ink-3">{s.scientificName}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
