import { useDrops } from './drops';

/** The virtual-currency counter (e.g. "💧 150") with a cyan neon glow. */
export function DropsBadge() {
  const drops = useDrops();
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 h-8 rounded-full text-[13px] font-extrabold flex-shrink-0"
      style={{ background: 'color-mix(in srgb, var(--c-gold) 15%, transparent)', color: 'var(--c-gold-2)', boxShadow: '0 0 12px rgba(232,181,58,0.30)' }}
      aria-label={`${drops} Gocce`}
    >
      <span aria-hidden style={{ width: 16, height: 16, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #FFE79A, #D69A1C)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)' }} />
      <span className="tnum" style={{ backgroundImage: 'linear-gradient(180deg, #FFF0BE 0%, #FFD76A 45%, #E8B53A 70%, #FFE9A8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
        {drops.toLocaleString()}
      </span>
    </span>
  );
}
