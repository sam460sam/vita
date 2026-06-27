import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useT, type TKey } from '@/i18n';
import { hasOnboarded } from './Onboarding';
import { isTourDone, markTourDone, TOUR_START_EVENT } from './tour';

interface Step { sel: string; t: TKey; d: TKey }
// Home-only steps. No bottom-nav / other-tab steps — the tour never leaves Home.
const STEPS: Step[] = [
  { sel: '[data-tour="focus"]', t: 'tour.focus.t', d: 'tour.focus.d' },
  { sel: '[data-tour="addtask"]', t: 'tour.addtask.t', d: 'tour.addtask.d' },
  { sel: '[data-tour="habit"]', t: 'tour.habit.t', d: 'tour.habit.d' },
  { sel: '[data-tour="workout"]', t: 'tour.workout.t', d: 'tour.workout.d' },
  { sel: '[data-tour="chips"]', t: 'tour.chips.t', d: 'tour.chips.d' },
  { sel: '[data-tour="momentum"]', t: 'tour.momentum.t', d: 'tour.momentum.d' },
  { sel: '[data-tour="saved"]', t: 'tour.saved.t', d: 'tour.saved.d' },
];
const PAD = 8;

/** First-run interactive tutorial — entirely on the Home page. */
export function HomeTour() {
  const t = useT();
  const loc = useLocation();
  const onHome = loc.pathname === '/oggi' || loc.pathname === '/';
  const [phase, setPhase] = useState<'off' | 'welcome' | 'steps' | 'done'>('off');
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const [tipH, setTipH] = useState(150);

  useEffect(() => {
    if (onHome && phase === 'off' && hasOnboarded() && !isTourDone()) {
      const id = setTimeout(() => setPhase('welcome'), 450);
      return () => clearTimeout(id);
    }
  }, [onHome, phase]);
  useEffect(() => {
    const onStart = () => { if (onHome) { setIdx(0); setPhase('welcome'); } };
    window.addEventListener(TOUR_START_EVENT, onStart);
    return () => window.removeEventListener(TOUR_START_EVENT, onStart);
  }, [onHome]);

  // Lock the page scroll while the tour is active.
  useEffect(() => {
    if (phase === 'off') return;
    const root = document.getElementById('root');
    const prev = root?.style.overflow;
    if (root) root.style.overflow = 'hidden';
    return () => { if (root) root.style.overflow = prev ?? ''; };
  }, [phase]);

  function finish() { markTourDone(); setPhase('off'); setIdx(0); setRect(null); }

  // Track the current target's rect (robust to async content + scroll/resize).
  useEffect(() => {
    if (phase !== 'steps') return;
    let alive = true;
    const step = STEPS[idx];
    const el = document.querySelector<HTMLElement>(step.sel);
    if (!el) { // not mounted (e.g. no habits yet) → skip gracefully
      if (idx + 1 >= STEPS.length) setPhase('done'); else setIdx((i) => i + 1);
      return;
    }
    const root = document.getElementById('root');
    if (root) root.style.overflow = ''; // allow programmatic scroll into view
    el.scrollIntoView({ block: 'center', behavior: 'auto' });
    const read = () => { if (alive) { const e = document.querySelector<HTMLElement>(step.sel); if (e) setRect(e.getBoundingClientRect()); } };
    const r1 = requestAnimationFrame(() => requestAnimationFrame(() => { read(); if (root) root.style.overflow = 'hidden'; }));
    const timers = [120, 350, 700, 1100].map((ms) => setTimeout(read, ms));
    window.addEventListener('resize', read);
    const ro = new ResizeObserver(read);
    ro.observe(document.body);
    return () => { alive = false; cancelAnimationFrame(r1); timers.forEach(clearTimeout); window.removeEventListener('resize', read); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx]);

  useLayoutEffect(() => { if (tipRef.current) setTipH(tipRef.current.offsetHeight); }, [idx, rect, phase]);

  if (phase === 'off') return null;

  // Centered intro / outro card (welcome + done).
  if (phase === 'welcome' || phase === 'done') {
    const welcome = phase === 'welcome';
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center px-7" style={{ background: 'rgba(0,0,0,0.78)' }}>
        <div className="w-full max-w-sm rounded-card bg-card p-6 text-center animate-rise" style={{ boxShadow: 'inset 0 0 0 1px var(--c-hairline), 0 24px 60px rgba(0,0,0,0.6)' }}>
          <div className="display-serif text-[24px] text-ink leading-tight">{t(welcome ? 'tour.welcome.t' : 'tour.done.t')}</div>
          <p className="text-[14.5px] text-ink-2 mt-2.5 leading-relaxed">{t(welcome ? 'tour.welcome.d' : 'tour.done.d')}</p>
          <button onClick={() => (welcome ? (setIdx(0), setPhase('steps')) : finish())} className="w-full mt-6 h-12 rounded-full font-bold text-[15.5px]" style={{ background: 'var(--c-primary)', color: 'var(--c-on-primary)' }}>
            {t(welcome ? 'tour.start' : 'tour.finish')}
          </button>
          {welcome && <button onClick={finish} className="mt-2.5 text-[14px] font-semibold text-ink-3 py-2">{t('tour.skip')}</button>}
        </div>
      </div>
    );
  }

  if (!rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const last = idx === STEPS.length - 1;
  const safeBottom = 96;
  const sx = Math.max(4, rect.left - PAD);
  const sy = Math.max(4, rect.top - PAD);
  const sw = Math.min(vw - 8, rect.width + PAD * 2);
  const sh = rect.height + PAD * 2;
  const tipW = Math.min(vw - 32, 340);
  const below = sy + sh + 14 + tipH < vh - safeBottom;
  const tipTop = below ? sy + sh + 14 : Math.max(54, sy - tipH - 14);
  const tipLeft = Math.min(Math.max(16, sx + sw / 2 - tipW / 2), vw - 16 - tipW);

  return (
    <div className="fixed inset-0 z-[200]" aria-modal>
      <div className="absolute inset-0" />
      <div className="absolute rounded-2xl pointer-events-none transition-all duration-300" style={{ left: sx, top: sy, width: sw, height: sh, boxShadow: '0 0 0 9999px rgba(0,0,0,0.74), 0 0 0 1.5px var(--c-gold), 0 0 22px color-mix(in srgb, var(--c-gold) 55%, transparent)' }} />
      <div ref={tipRef} className="absolute rounded-card bg-card p-4 animate-rise" style={{ top: tipTop, left: tipLeft, width: tipW, boxShadow: 'inset 0 0 0 1px var(--c-hairline), 0 18px 44px rgba(0,0,0,0.6)' }}>
        <div className="text-[15.5px] font-bold text-ink">{t(STEPS[idx].t)}</div>
        <div className="text-[13.5px] text-ink-2 mt-1 leading-snug">{t(STEPS[idx].d)}</div>
        <div className="flex items-center gap-1.5 mt-3.5">
          {STEPS.map((_, i) => (
            <span key={i} className="h-1.5 rounded-full transition-all" style={{ width: i === idx ? 18 : 6, background: i === idx ? 'var(--c-gold)' : 'var(--c-line)' }} />
          ))}
          <div className="flex-1" />
          {idx > 0 && <button onClick={() => setIdx((i) => Math.max(0, i - 1))} className="text-[13.5px] font-semibold text-ink-3 px-2 py-1">{t('tour.back')}</button>}
          <button onClick={() => (last ? setPhase('done') : setIdx((i) => i + 1))} className="text-[13.5px] font-bold px-3.5 py-1.5 rounded-full" style={{ background: 'var(--c-primary)', color: 'var(--c-on-primary)' }}>
            {last ? t('tour.finish') : t('tour.next')}
          </button>
        </div>
      </div>
      <button onClick={finish} className="absolute right-4 text-[14px] font-semibold text-ink-2 px-3 py-2 rounded-full bg-card/80 backdrop-blur" style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}>
        {t('tour.skip')}
      </button>
    </div>
  );
}
