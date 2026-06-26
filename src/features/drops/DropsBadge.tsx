import { useDrops } from './drops';

/** The virtual-currency counter (e.g. "💧 150") with a cyan neon glow. */
export function DropsBadge() {
  const drops = useDrops();
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 h-8 rounded-full text-[13px] font-extrabold flex-shrink-0"
      style={{ background: 'color-mix(in srgb, var(--c-drops) 16%, transparent)', color: 'var(--c-drops)', boxShadow: '0 0 12px rgba(45,212,247,0.28)' }}
      aria-label={`${drops} Drops`}
    >
      💧 {drops.toLocaleString()}
    </span>
  );
}
