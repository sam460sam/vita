import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { Card, ProgressRing, StarMascot } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { useStella } from '@/features/stella';
import type { Momentum } from './momentum';
import { momentumMessageKey, stellaMood, updateStreak } from './momentum';
import { pandaLine } from './coach';

const LEGEND: { key: keyof Momentum['rings']; labelKey: TKey; color: string }[] = [
  { key: 'habits', labelKey: 'momentum.legend.habits', color: 'var(--c-habit)' },
  { key: 'water', labelKey: 'momentum.legend.water', color: '#0EA5E9' },
  { key: 'tasks', labelKey: 'momentum.legend.tasks', color: 'var(--c-project)' },
  { key: 'move', labelKey: 'momentum.legend.move', color: 'var(--c-activity)' },
  { key: 'mind', labelKey: 'momentum.legend.mind', color: 'var(--c-journal)' },
];

export function MomentumCard({ m }: { m: Momentum }) {
  const t = useT();
  const stella = useStella();
  const mood = stellaMood(m.score);
  const [streak, setStreak] = useState(0);
  const [burst, setBurst] = useState(false);
  const prevScore = useRef(m.score);

  useEffect(() => {
    setStreak(updateStreak(m.score));
  }, [m.score]);

  // Celebrate when crossing into "great" territory.
  useEffect(() => {
    if (m.score >= 80 && prevScore.current < 80) {
      setBurst(true);
      const id = setTimeout(() => setBurst(false), 1400);
      return () => clearTimeout(id);
    }
    prevScore.current = m.score;
  }, [m.score]);

  return (
    <Card className="mb-4 relative overflow-hidden">
      {burst && <Confetti />}
      <div className="flex items-center gap-4">
        <button onClick={stella.open} aria-label="Stella" className="flex-shrink-0 active:scale-95 transition-transform">
          <ProgressRing progress={m.score / 100} size={72} stroke={7} color="var(--c-habit)">
            <StarMascot size={46} mood={mood} animated={m.score >= 80} />
          </ProgressRing>
        </button>

        <Link to="/recap" className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="metric-label">{t('momentum.title')}</span>
            {streak > 1 && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-activity">
                <Flame size={12} /> {t('momentum.streak', { n: streak })}
              </span>
            )}
            <ChevronRight size={16} className="text-ink-3 ml-auto" />
          </div>
          <div className="text-2xl font-bold tnum text-ink leading-tight mt-0.5">{m.score}<span className="text-ink-3 text-base font-semibold">/100</span></div>
          <p className="text-[13px] text-ink-2 leading-snug mt-0.5">{t(momentumMessageKey(m.score) as TKey)}</p>
        </Link>
      </div>

      {/* 5 cross-life progress bars — tap to see the full recap */}
      <Link to="/recap" className="flex gap-1.5 mt-3">
        {LEGEND.map((l) => (
          <div key={l.key} className="flex-1">
            <div className="h-1.5 rounded-full bg-section overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(m.rings[l.key] * 100)}%`, background: l.color }}
              />
            </div>
            <div className="text-[9px] text-ink-3 text-center mt-1 truncate">{t(l.labelKey)}</div>
          </div>
        ))}
      </Link>

      {/* Panda coach speech bubble */}
      <button onClick={stella.open} className="mt-3 flex items-start gap-2 w-full text-left">
        <span className="flex-shrink-0">
          <StarMascot size={32} mood={mood} />
        </span>
        <span className="relative flex-1 bg-section rounded-2xl rounded-tl-sm px-3 py-2 text-[13px] text-ink-2 leading-snug">
          {(() => {
            const line = pandaLine(m, streak);
            return t(line.key as TKey, line.vars);
          })()}
        </span>
      </button>
    </Card>
  );
}

/** Lightweight CSS confetti burst (no library). */
function Confetti() {
  const colors = ['#FF6B57', '#10B981', '#4F46E5', '#F59E0B', '#0EA5E9', '#EC4899'];
  const pieces = Array.from({ length: 28 });
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.2;
        const dur = 0.9 + Math.random() * 0.6;
        const color = colors[i % colors.length];
        const size = 5 + Math.random() * 5;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '-10px',
              width: size,
              height: size * 1.4,
              background: color,
              borderRadius: 1,
              animation: `confetti-fall ${dur}s ${delay}s ease-in forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
