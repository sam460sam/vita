import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import vLogoUrl from '/vyta-v.png';

// Wordmark sizing. The "yta" gradient mirrors the V logo's leaf greens so the
// two read as one identical color.
const V_H = 74; // logo height (px)
const FONT = 58; // "yta" font size (px)
const GAP = 4; // space between V and "yta" (px)
const YTA_GRADIENT = 'linear-gradient(180deg, #93c24a 0%, #6aa742 48%, #4c9038 100%)';

/**
 * Animated brand splash shown only at app launch: the green "V" logo appears
 * centered, then slides left while "yta" fades in beside it — forming a
 * perfectly centered "Vyta". The wordmark fades out first, then the background,
 * so nothing is ever left layered over the home screen behind it.
 */
export function BrandSplash() {
  const ytaRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState<number | null>(null);
  // mount: 0 hidden · 1 V centered (entered) · 2 V slid left + word in
  const [mount, setMount] = useState(0);
  // exit: 0 none · 1 word out · 2 bg out · 3 gone
  const [exit, setExit] = useState(0);

  // Measure "yta" width before paint so we can start the V exactly centered.
  useLayoutEffect(() => {
    if (ytaRef.current) setShift((ytaRef.current.offsetWidth + GAP) / 2);
  }, []);

  useEffect(() => {
    if (shift == null) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t: ReturnType<typeof setTimeout>[] = [];
    // pop the V in centered
    t.push(setTimeout(() => setMount(1), 40));
    if (reduce) {
      t.push(setTimeout(() => setMount(2), 80));
      t.push(setTimeout(() => setExit(1), 1100));
      t.push(setTimeout(() => setExit(2), 1380));
      t.push(setTimeout(() => setExit(3), 1800));
    } else {
      t.push(setTimeout(() => setMount(2), 820)); // slide left + word in
      t.push(setTimeout(() => setExit(1), 2250)); // word fades out
      t.push(setTimeout(() => setExit(2), 2560)); // bg fades out
      t.push(setTimeout(() => setExit(3), 3000)); // unmount
    }
    return () => t.forEach(clearTimeout);
  }, [shift]);

  if (exit === 3) return null;

  const vTransform =
    mount < 2 ? `translateX(${shift ?? 0}px) scale(${mount === 0 ? 0.82 : 1})` : 'translateX(0) scale(1)';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center select-none"
      style={{
        background: 'var(--c-app)',
        opacity: exit >= 2 ? 0 : 1,
        transition: 'opacity 420ms ease',
        visibility: shift == null ? 'hidden' : 'visible',
      }}
      aria-hidden
    >
      <div
        className="flex items-center"
        style={{ gap: GAP, opacity: exit >= 1 ? 0 : 1, transition: 'opacity 300ms ease' }}
      >
        <img
          src={vLogoUrl}
          alt=""
          draggable={false}
          className="object-contain"
          style={{
            height: V_H,
            width: 'auto',
            opacity: mount === 0 ? 0 : 1,
            transform: vTransform,
            transition: 'transform 640ms cubic-bezier(0.4, 0, 0.2, 1), opacity 380ms ease',
          }}
        />
        <span
          ref={ytaRef}
          className="font-extrabold tracking-tight"
          style={{
            fontSize: FONT,
            lineHeight: 1,
            opacity: mount < 2 ? 0 : 1,
            transition: 'opacity 520ms ease 140ms',
            backgroundImage: YTA_GRADIENT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          yta
        </span>
      </div>
    </div>
  );
}
