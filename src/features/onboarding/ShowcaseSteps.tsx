import { useI18n, type TKey } from '@/i18n';
import vioHappy from '/vio/vio-happy.png';

const PILLS: { e: string; c: string }[] = [
  { e: '🌿', c: '#3da66f' }, { e: '🏋️', c: '#d98a6a' }, { e: '🌙', c: '#7079b0' }, { e: '🧭', c: '#d9b25a' }, { e: '📊', c: '#6aa3d9' },
];

/** First slide — a luminous hero: Vyta is everything in one app. */
export function HeroSlide() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-full py-6">
      <div className="relative flex items-center justify-center mb-1">
        <div aria-hidden className="absolute h-60 w-60 rounded-full" style={{ background: 'radial-gradient(circle at 50% 55%, rgba(61,166,111,0.40), rgba(13,77,50,0.18) 45%, transparent 72%)', filter: 'blur(10px)' }} />
        <img src={vioHappy} alt="" aria-hidden draggable={false} className="vio-bob relative w-44 h-44 object-contain" />
      </div>
      <h1
        className="display-serif text-[32px] leading-[1.08] mt-3 px-2"
        style={{ backgroundImage: 'linear-gradient(180deg, #ECEFF0 0%, #9FD8BC 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}
      >
        {t('onboard.hero.title')}
      </h1>
      <p className="text-[15px] text-ink-2 mt-3 max-w-sm leading-relaxed">{t('onboard.hero.desc')}</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-7 max-w-[16rem]">
        {PILLS.map((p, i) => (
          <span key={i} className="h-10 w-10 rounded-full flex items-center justify-center text-[19px] animate-rise" style={{ background: `color-mix(in srgb, ${p.c} 18%, var(--c-card))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${p.c} 45%, transparent)`, animationDelay: `${i * 70}ms` }}>{p.e}</span>
        ))}
      </div>
    </div>
  );
}

const FEATS: { e: string; c: string; t: TKey; d: TKey }[] = [
  { e: '🌿', c: '#3da66f', t: 'onboard.feat.habits.t', d: 'onboard.feat.habits.d' },
  { e: '🏋️', c: '#d98a6a', t: 'onboard.feat.workout.t', d: 'onboard.feat.workout.d' },
  { e: '🌙', c: '#7079b0', t: 'onboard.feat.routine.t', d: 'onboard.feat.routine.d' },
  { e: '🧭', c: '#d9b25a', t: 'onboard.feat.test.t', d: 'onboard.feat.test.d' },
  { e: '📊', c: '#6aa3d9', t: 'onboard.feat.widget.t', d: 'onboard.feat.widget.d' },
  { e: '🔒', c: '#9b86bf', t: 'onboard.feat.privacy.t', d: 'onboard.feat.privacy.d' },
];

/** Second slide — what's inside: an all-in-one feature showcase. */
export function InsideSlide() {
  const { t } = useI18n();
  return (
    <div className="pt-4">
      <div className="text-center mb-5">
        <h1 className="display-serif text-[26px] text-ink leading-tight">{t('onboard.inside.title')}</h1>
        <p className="text-[14.5px] text-ink-2 mt-2 max-w-sm mx-auto leading-relaxed">{t('onboard.inside.desc')}</p>
      </div>
      <div className="space-y-2.5 max-w-md mx-auto">
        {FEATS.map((f, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-card bg-card shadow-card animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
            <span className="h-10 w-10 rounded-xl flex items-center justify-center text-[20px] flex-shrink-0" style={{ background: `color-mix(in srgb, ${f.c} 16%, var(--c-card))`, boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${f.c} 40%, transparent)` }} aria-hidden>{f.e}</span>
            <div className="min-w-0 pt-0.5">
              <div className="text-[15px] font-bold text-ink">{t(f.t)}</div>
              <div className="text-[12.5px] text-ink-2 leading-snug">{t(f.d)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
