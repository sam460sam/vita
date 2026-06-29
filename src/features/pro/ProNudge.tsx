import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useT } from '@/i18n';
import { useIsPro } from '@/premium/premium';
import { TRIAL_DAYS } from '@/premium/config';

const KEY = 'vita.proNudge.dismissedAt';
const COOLDOWN = 5 * 24 * 60 * 60 * 1000; // reappears ~5 days after a dismiss

function dismissedRecently(): boolean {
  try {
    const v = Number(localStorage.getItem(KEY) || 0);
    return v > 0 && Date.now() - v < COOLDOWN;
  } catch {
    return false;
  }
}

/** Gentle, dismissible "Go Pro" promo. Shows for free users only and snoozes
 *  for a few days after each dismiss, so it nudges without nagging. */
export function ProNudge({ className }: { className?: string }) {
  const isPro = useIsPro();
  const t = useT();
  const [hidden, setHidden] = useState(dismissedRecently);
  if (isPro || hidden) return null;

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
    setHidden(true);
  }

  return (
    <Link
      to="/pro"
      className={cn('relative block rounded-card p-4 overflow-hidden active:scale-[0.99] transition-transform', className)}
      style={{
        background: 'color-mix(in srgb, var(--c-gold) 12%, var(--c-card))',
        boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--c-gold) 38%, transparent), 0 12px 28px rgba(0,0,0,0.35)',
      }}
    >
      <button
        onClick={dismiss}
        aria-label={t('common.close')}
        className="absolute top-2 right-2 h-7 w-7 rounded-full flex items-center justify-center text-ink-3 active:scale-90 transition-transform"
      >
        <X size={15} />
      </button>
      <div className="flex items-center gap-3 pr-7">
        <span className="h-11 w-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--c-gold) 22%, transparent)', color: 'var(--c-gold-2)' }}>
          <Crown size={22} fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-ink">{t('pro.nudge.title')}</div>
          <div className="text-[12.5px] text-ink-2 mt-0.5 leading-snug">{t('pro.nudge.desc', { n: TRIAL_DAYS })}</div>
        </div>
      </div>
      <div className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold" style={{ color: 'var(--c-gold-2)' }}>
        {t('pro.nudge.cta')} <ChevronRight size={15} />
      </div>
    </Link>
  );
}
