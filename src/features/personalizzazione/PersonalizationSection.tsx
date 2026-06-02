import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, LayoutGrid, RefreshCw, Info } from 'lucide-react';
import { Card, CardHeader, Divider, Button } from '@/ui';
import { useT } from '@/i18n';
import { cn } from '@/lib/cn';
import { ALL_MODULES, type ModuleId } from '@/data/types';
import { setEnabledModules, reorderModules } from '@/data/repo';
import { resetOnboarding } from '@/features/onboarding/Onboarding';
import { MODULE_CATALOG } from './modules';
import { useModules } from './prefs';

/** Settings → "Personalizzazione": interests/sections + home widgets + redo. */
export function PersonalizationSection() {
  const t = useT();
  const navigate = useNavigate();
  const { enabled, order } = useModules();

  const disabled = ALL_MODULES.filter((m) => !enabled.includes(m));

  async function toggle(id: ModuleId, on: boolean) {
    const next = on ? [...enabled, id] : enabled.filter((m) => m !== id);
    await setEnabledModules(next);
  }
  async function move(id: ModuleId, dir: -1 | 1) {
    const idx = order.indexOf(id);
    const to = idx + dir;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    [next[idx], next[to]] = [next[to], next[idx]];
    await reorderModules(next);
  }

  function redo() {
    resetOnboarding();
    // The onboarding gate reads the flag on mount; a reload re-shows it.
    window.location.reload();
  }

  return (
    <Card className="mb-4" id="personalizzazione">
      <CardHeader title={t('personalize.title')} />
      <p className="text-[13px] text-ink-2 mb-3 flex items-start gap-2">
        <Info size={15} className="mt-0.5 flex-shrink-0" />
        {t('personalize.note')}
      </p>

      <div className="metric-label mb-1.5">{t('personalize.active')}</div>
      <div>
        {order.map((id, i) => {
          const m = MODULE_CATALOG[id];
          const Icon = m.icon;
          return (
            <div key={id}>
              {i > 0 && <Divider />}
              <div className="flex items-center gap-2.5 py-2.5">
                <span className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${m.accent}1a`, color: m.accent }}>
                  <Icon size={16} />
                </span>
                <span className="flex-1 text-[15px] text-ink truncate">{t(m.labelKey)}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => move(id, -1)} disabled={i === 0} aria-label={t('personalize.moveUp')} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-2 disabled:opacity-30 active:bg-section">
                    <ChevronUp size={18} />
                  </button>
                  <button onClick={() => move(id, 1)} disabled={i === order.length - 1} aria-label={t('personalize.moveDown')} className="h-8 w-8 rounded-full flex items-center justify-center text-ink-2 disabled:opacity-30 active:bg-section">
                    <ChevronDown size={18} />
                  </button>
                </div>
                <Switch on label={t(m.labelKey)} onToggle={() => toggle(id, false)} />
              </div>
            </div>
          );
        })}
      </div>

      {disabled.length > 0 && (
        <>
          <div className="metric-label mt-4 mb-1.5">{t('personalize.inactive')}</div>
          <div>
            {disabled.map((id, i) => {
              const m = MODULE_CATALOG[id];
              const Icon = m.icon;
              return (
                <div key={id}>
                  {i > 0 && <Divider />}
                  <div className="flex items-center gap-2.5 py-2.5 opacity-70">
                    <span className="h-8 w-8 rounded-full bg-section flex items-center justify-center flex-shrink-0 text-ink-3">
                      <Icon size={16} />
                    </span>
                    <span className="flex-1 text-[15px] text-ink truncate">{t(m.labelKey)}</span>
                    <Switch on={false} label={t(m.labelKey)} onToggle={() => toggle(id, true)} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <Button variant="subtle" block icon={<LayoutGrid size={18} />} onClick={() => navigate('/oggi?edit=1')}>
          {t('personalize.editHome')}
        </Button>
        <Button variant="ghost" block icon={<RefreshCw size={18} />} onClick={redo}>
          {t('personalize.redo')}
        </Button>
      </div>
    </Card>
  );
}

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={cn('relative h-7 w-12 rounded-full transition-colors flex-shrink-0')}
      style={{ background: on ? 'var(--c-ink)' : 'var(--c-line)' }}
    >
      <span
        className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-card transition-transform"
        style={{ transform: on ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  );
}
