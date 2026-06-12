import { useEffect, useState } from 'react';
import vLogoUrl from '/vyta-v.png';

// Wordmark sizing. "yta" is rendered as transparent, branch-like letterforms:
// hollow gradient strokes with an inner vein and small leaves sprouting from
// the letter tips — matching the V's botanical line-art style.
const V_H = 88; // logo height (px)
const YTA_W = 168; // svg width (px)
const YTA_H = 110; // svg height (px)
const GAP = 0; // space between V and "yta" (px)

/** "yta" as botanical line-art: transparent letters, gradient stroke, leaves. */
function YtaMark({ opacity }: { opacity: number }) {
  return (
    <svg
      width={YTA_W}
      height={YTA_H}
      viewBox="0 0 168 110"
      style={{ opacity, transition: 'opacity 520ms ease 140ms', display: 'block' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="yta-g" x1="0" y1="10" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a8d05c" />
          <stop offset="0.55" stopColor="#6aa742" />
          <stop offset="1" stopColor="#3f7d31" />
        </linearGradient>
        <linearGradient id="yta-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9dd6e" />
          <stop offset="1" stopColor="#4c9038" />
        </linearGradient>
      </defs>

      {/* hollow branch letters: thick gradient stroke + inner carve in app bg */}
      <text
        x="6"
        y="74"
        fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
        fontSize="64"
        fontWeight="800"
        letterSpacing="1"
        fill="none"
        stroke="url(#yta-g)"
        strokeWidth="8.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        yta
      </text>
      <text
        x="6"
        y="74"
        fontFamily="ui-rounded, 'SF Pro Rounded', system-ui, sans-serif"
        fontSize="64"
        fontWeight="800"
        letterSpacing="1"
        fill="none"
        stroke="var(--c-app)"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        yta
      </text>

      {/* leaves sprouting from the letter tips (like the V) */}
      {/* leaf on the t's stem (top), attached and pointing up-right */}
      <g transform="translate(61,31) rotate(-24)">
        <path d="M0 0 C 10 -3 16 -13 14 -24 C 4 -19 -2 -10 0 0 Z" fill="url(#yta-leaf)" />
        <path d="M1 -2 C 5 -8 9 -14 12 -20" stroke="var(--c-app)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
      {/* small leaf on the a's top-right terminal */}
      <g transform="translate(119,45) rotate(35)">
        <path d="M0 0 C 7 -2 11 -9 10 -17 C 3 -13 -2 -7 0 0 Z" fill="url(#yta-leaf)" />
        <path d="M1 -2 C 3 -6 6 -10 8 -13" stroke="var(--c-app)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </g>
      {/* leaf at the end of the y's tail, pointing down-left */}
      <g transform="translate(13,87) rotate(200)">
        <path d="M0 0 C 9 -3 14 -12 12 -21 C 3 -17 -2 -9 0 0 Z" fill="url(#yta-leaf)" />
        <path d="M1 -2 C 4 -7 7 -12 10 -17" stroke="var(--c-app)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Animated brand splash shown only at app launch: the green "V" logo appears
 * centered, then slides left while "yta" fades in beside it — forming a
 * centered "Vyta". The wordmark fades out first, then the background.
 */
export function BrandSplash() {
  const shift = (YTA_W + GAP) / 2;
  // mount: 0 hidden · 1 V centered (entered) · 2 V slid left + word in
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
      t.push(setTimeout(() => setMount(2), 820)); // slide left + word in
      t.push(setTimeout(() => setExit(1), 2250)); // word fades out
      t.push(setTimeout(() => setExit(2), 2560)); // bg fades out
      t.push(setTimeout(() => setExit(3), 3000)); // unmount
    }
    return () => t.forEach(clearTimeout);
  }, []);

  if (exit === 3) return null;

  const vTransform = mount < 2 ? `translateX(${shift}px) scale(${mount === 0 ? 0.82 : 1})` : 'translateX(0) scale(1)';

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
      <div className="flex items-center" style={{ gap: GAP, opacity: exit >= 1 ? 0 : 1, transition: 'opacity 300ms ease' }}>
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
        <div style={{ position: 'relative', top: 10, left: -14 }}>
          <YtaMark opacity={mount < 2 ? 0 : 1} />
        </div>
      </div>
    </div>
  );
}
