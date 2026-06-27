import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme/theme';
import { useT } from '@/i18n';

/**
 * Sun/Moon theme toggle for the Home header. In Night it shows a sun (tap →
 * Day); in Day it shows a moon (tap → Night). Tapping stores an explicit
 * day/night override and re-themes the whole app with a smooth cross-fade.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolved, setPref } = useTheme();
  const t = useT();
  const isNight = resolved === 'dark';

  return (
    <button
      onClick={() => setPref(isNight ? 'light' : 'dark')}
      aria-label={t(isNight ? 'theme.toDay' : 'theme.toNight')}
      className={cn(
        'h-10 w-10 rounded-full flex items-center justify-center active:scale-90 transition-transform flex-shrink-0',
        className,
      )}
      style={{ background: 'color-mix(in srgb, var(--c-gold) 14%, var(--c-card))', color: 'var(--c-gold)' }}
    >
      <span className="relative inline-block h-[19px] w-[19px]" aria-hidden>
        <Sun size={19} className="absolute inset-0 transition-all duration-300 ease-out" style={{ opacity: isNight ? 1 : 0, transform: isNight ? 'rotate(0) scale(1)' : 'rotate(-90deg) scale(0.5)' }} />
        <Moon size={19} className="absolute inset-0 transition-all duration-300 ease-out" style={{ opacity: isNight ? 0 : 1, transform: isNight ? 'rotate(90deg) scale(0.5)' : 'rotate(0) scale(1)' }} />
      </span>
    </button>
  );
}
