import { useT, type TKey } from '@/i18n';

/** An editorial, antique-gold "quote of the day" card that closes a screen
 *  with breathing room and a premium, luxury finish. Rotates daily, offline. */
export function DailyInspiration({ className = '' }: { className?: string }) {
  const t = useT();
  const pool = t('inspire.pool' as TKey).split('|').filter(Boolean);
  const start = new Date(new Date().getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000);
  const quote = pool[((dayOfYear % pool.length) + pool.length) % pool.length] ?? pool[0];

  return (
    <div className={`rounded-card bg-card shadow-card px-7 py-8 text-center relative overflow-hidden ${className}`}>
      {/* Gold eyebrow with thin rules */}
      <div className="flex items-center justify-center gap-2.5 mb-4">
        <span className="h-px w-7" style={{ background: 'linear-gradient(90deg, transparent, var(--c-gold))' }} />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--c-gold)' }}>{t('inspire.label')}</span>
        <span className="h-px w-7" style={{ background: 'linear-gradient(90deg, var(--c-gold), transparent)' }} />
      </div>

      {/* Oversized antique-gold quotation mark */}
      <div aria-hidden className="display-serif leading-none select-none" style={{ color: 'var(--c-gold)', opacity: 0.55, fontSize: 46, marginBottom: -10 }}>“</div>

      <p className="display-serif italic text-[18.5px] leading-relaxed text-ink max-w-[17rem] mx-auto">{quote}</p>

      <div className="mt-4 text-[12px] font-semibold tracking-[0.12em]" style={{ color: 'var(--c-gold-2)' }}>— VYTA</div>
    </div>
  );
}
