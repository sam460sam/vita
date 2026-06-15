import { useEffect, useState } from 'react';
import vLogoUrl from '/vyta-v.png';
import wordmarkUrl from '/vyta-wordmark.png';

// The final wordmark is the user's full botanical "Vyta" artwork. The intro
// still plays the V alone first: it pops in centered, slides left to where the
// wordmark's own V sits, then crossfades into the complete wordmark.
const WM_H = 104; // wordmark display height (px)
const WM_W = Math.round(WM_H * 2.21); // wordmark aspect ≈ 899×406 (botanical "Vyta")
const V_H = 102; // standalone V display height (matches the wordmark's V)
const V_LEFT = Math.round(WM_W * 0.192); // the wordmark V's center, from its left
const START_SHIFT = Math.round(WM_W / 2 - V_LEFT); // start = viewport center

export function BrandSplash() {
  // mount: 0 hidden · 1 V centered (entered) · 2 slid left + wordmark in
  const [mount, setMount] = useState(0);
  // exit: 0 none · 1 word out · 2 bg out · 3 gone
  const [exit, setExit] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t: ReturnType<typeof setTimeout>[] = [];
    t.push(setTimeout(() => setMount(1), 40));
    if (reduce) {
      t.push(setTimeout(() => setMount(2), 80));
      t.push(setTimeout(() => setExit(1), 1100));
      t.push(setTimeout(() => setExit(2), 1380));
      t.push(setTimeout(() => setExit(3), 1800));
    } else {
      t.push(setTimeout(() => setMount(2), 820)); // slide left + wordmark in
      t.push(setTimeout(() => setExit(1), 2350)); // wordmark fades out
      t.push(setTimeout(() => setExit(2), 2660)); // bg fades out
      t.push(setTimeout(() => setExit(3), 3100)); // unmount
    }
    return () => t.forEach(clearTimeout);
  }, []);

  if (exit === 3) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center select-none"
      style={{
        background: 'var(--c-app)',
        opacity: exit >= 2 ? 0 : 1,
        transition: 'opacity 420ms ease',
      }}
      aria-hidden
    >
      <div
        style={{
          position: 'relative',
          width: WM_W,
          height: WM_H,
          opacity: exit >= 1 ? 0 : 1,
          transition: 'opacity 300ms ease',
        }}
      >
        {/* full botanical wordmark (fades in as the V settles) */}
        <img
          src={wordmarkUrl}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            height: WM_H,
            width: WM_W,
            objectFit: 'contain',
            opacity: mount < 2 ? 0 : 1,
            transition: 'opacity 560ms ease 180ms',
          }}
        />
        {/* standalone V: pops centered, slides to the wordmark's V, fades away */}
        <img
          src={vLogoUrl}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            top: '50%',
            left: V_LEFT,
            height: V_H,
            width: 'auto',
            transform: `translate(-50%, -50%) translateX(${mount < 2 ? START_SHIFT : 0}px) scale(${mount === 0 ? 0.82 : 1})`,
            opacity: mount === 0 ? 0 : mount < 2 ? 1 : 0,
            transition:
              'transform 640ms cubic-bezier(0.4, 0, 0.2, 1), opacity 380ms ease 120ms',
          }}
        />
      </div>
    </div>
  );
}
