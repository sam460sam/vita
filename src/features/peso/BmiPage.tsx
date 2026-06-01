import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/data/db';
import { readSettings } from '@/data/repo';
import { defaultSettings } from '@/data/defaults';
import { PageHeader } from '@/app/PageHeader';
import { Screen } from '@/app/Screen';
import { Card, EmptyState } from '@/ui';
import { useT, type TKey } from '@/i18n';
import { bmi, latest } from './logic';

// BMI scale 15..40 mapped to 0..100%
const MIN = 15;
const MAX = 40;
const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - MIN) / (MAX - MIN)) * 100))}%`;

const CAT_COLOR: Record<string, string> = {
  under: '#60A5FA',
  healthy: '#10B981',
  over: '#F59E0B',
  obese: '#EF4444',
};

export function BmiPage() {
  const t = useT();
  const settings = useLiveQuery(() => readSettings(), [], undefined);
  const logs = useLiveQuery(() => db.weightLogs.toArray(), [], []);
  const s = settings ?? defaultSettings();
  const cur = latest(logs ?? []);
  const b = cur ? bmi(cur.weightKg, s.body.heightCm) : null;

  const risks: TKey[] = ['bmi.r1', 'bmi.r2', 'bmi.r3', 'bmi.r4', 'bmi.r5', 'bmi.r6', 'bmi.r7'];

  return (
    <>
      <PageHeader title={t('bmi.title')} back="/peso" />
      <Screen>
        {!b ? (
          <Card>
            <EmptyState title={t('bmi.title')} description={t('bmi.needHeight')} />
          </Card>
        ) : (
          <>
            <Card className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[15px] text-ink-2">{t('weight.yourBmi')}</span>
                <span
                  className="text-[12px] font-semibold rounded-full px-2 py-0.5"
                  style={{ background: `${CAT_COLOR[b.category]}1f`, color: CAT_COLOR[b.category] }}
                >
                  {t(`weight.bmi.${b.category}` as TKey)}
                </span>
              </div>
              <div className="text-5xl font-bold tnum text-ink">{b.value}</div>

              {/* scale with marker */}
              <div className="mt-5">
                <div className="relative h-2.5 rounded-full overflow-hidden flex">
                  <div className="flex-1" style={{ background: CAT_COLOR.under }} />
                  <div className="flex-1" style={{ background: CAT_COLOR.healthy }} />
                  <div className="flex-1" style={{ background: CAT_COLOR.over }} />
                  <div className="flex-1" style={{ background: CAT_COLOR.obese }} />
                </div>
                {/* marker */}
                <div className="relative h-0">
                  <div
                    className="absolute -top-[18px] w-0.5 h-5 bg-ink rounded-full"
                    style={{ left: pos(b.value) }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 mt-3">
                  {(['under', 'healthy', 'over', 'obese'] as const).map((c) => (
                    <div key={c} className="text-center">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-ink-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: CAT_COLOR[c] }} />
                        {t(`weight.bmi.${c}` as TKey)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1 mt-0.5 text-center text-[10px] text-ink-3">
                  <div>&lt;18.5</div>
                  <div>18.5–24.9</div>
                  <div>25–29.9</div>
                  <div>&gt;30</div>
                </div>
              </div>
            </Card>

            <Card className="mb-4">
              <h2 className="text-[15px] font-semibold text-ink mb-2">{t('bmi.disclaimer')}</h2>
              <p className="text-[14px] text-ink-2 leading-relaxed">{t('bmi.disclaimerText')}</p>
            </Card>

            <Card>
              <h2 className="text-[15px] font-semibold text-ink mb-2">{t('bmi.whyTitle')}</h2>
              <p className="text-[14px] text-ink-2 leading-relaxed mb-2">{t('bmi.whyText')}</p>
              <ul className="space-y-1">
                {risks.map((r) => (
                  <li key={r} className="flex items-center gap-2 text-[14px] text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-ink-3 flex-shrink-0" />
                    {t(r)}
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </Screen>
    </>
  );
}
