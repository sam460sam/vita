import { useEffect } from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { VioCompanion, Button } from '@/ui';
import { useT } from '@/i18n';
import { platform } from '@/platform/platform';

interface DailyWinProps {
  streak: number;
  pointsToday: number;
  pointsYesterday: number;
  onClose: () => void;
}

/** Duolingo-style end-of-day celebration. Rendered as a full-screen overlay. */
export function DailyWin({ streak, pointsToday, pointsYesterday, onClose }: DailyWinProps) {
  const t = useT();
  const diff = pointsToday - pointsYesterday;

  useEffect(() => {
    platform.haptic();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <DailyConfetti />
      <div
        className="relative w-full max-w-sm rounded-3xl bg-card shadow-2xl px-6 pt-7 pb-6 text-center animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <VioCompanion mood="happy" size={132} animated />
        </div>
        <h2 className="text-2xl font-bold text-ink mt-2">{t('win.title')}</h2>
        <p className="text-[15px] text-ink-2 mt-1">{t('win.subtitle')}</p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-2xl bg-section py-4">
            <div className="flex items-center justify-center gap-1 text-activity">
              <Flame size={20} />
              <span className="text-2xl font-bold tnum">{streak}</span>
            </div>
            <div className="text-[12px] text-ink-3 mt-1">{t('win.streak')}</div>
          </div>
          <div className="rounded-2xl bg-section py-4">
            <div className="flex items-center justify-center gap-1 text-habit">
              <TrendingUp size={20} />
              <span className="text-2xl font-bold tnum">+{pointsToday}</span>
            </div>
            <div className="text-[12px] text-ink-3 mt-1">{t('win.points')}</div>
          </div>
        </div>

        {diff > 0 && (
          <p className="text-[13px] text-habit font-medium mt-3">{t('win.better', { n: diff })}</p>
        )}

        <Button block size="lg" className="mt-5" onClick={onClose}>
          {t('win.cta')}
        </Button>
      </div>
    </div>
  );
}

function DailyConfetti() {
  const colors = ['#FF6B57', '#10B981', '#4F46E5', '#F59E0B', '#0EA5E9', '#EC4899'];
  const pieces = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.4;
        const dur = 1.4 + Math.random() * 1.2;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 6;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '-12px',
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
