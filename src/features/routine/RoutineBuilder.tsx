import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { createRoutine, newRoutineStep } from '@/data/repo';
import { Sheet, Input, Button, VioCompanion } from '@/ui';
import { platform } from '@/platform/platform';
import { useT, type TKey } from '@/i18n';
import type { Routine } from '@/data/types';

type Kind = 'morning' | 'evening';

// Code-side config (emoji + which suggestions start selected). The titles and
// the short "why" rationale come from i18n (rb.<kind>.items), aligned by index.
const CONFIG: Record<Kind, { emoji: string; on: boolean[] }> = {
  morning: { emoji: '☀️', on: [true, true, false, true, true, false] },
  evening: { emoji: '🌙', on: [true, true, true, true, false, false] },
};

/**
 * "Build your routine" — opens when tapping the Morning/Evening quick-add.
 * The user composes their own to-do list from evidence-based suggestions
 * (each with a short reason), can add custom steps + personal notes, and
 * gets a friendly tip from Vio on how to personalize it.
 */
export function RoutineBuilder({ kind, onClose, onCreated }: { kind: Kind; onClose: () => void; onCreated?: (r: Routine) => void }) {
  const t = useT();
  const cfg = CONFIG[kind];
  const suggestions = t(`rb.${kind}.items` as TKey).split('|').map((s) => {
    const [title, why] = s.split('::');
    return { title, why: why ?? '' };
  });

  const [picked, setPicked] = useState<boolean[]>(suggestions.map((_, i) => cfg.on[i] ?? false));
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');

  const total = picked.filter(Boolean).length + custom.length;

  function toggle(i: number) {
    platform.haptic();
    setPicked((p) => p.map((v, k) => (k === i ? !v : v)));
  }
  function addCustom() {
    const v = draft.trim();
    if (!v) return;
    setCustom((c) => [...c, v]);
    setDraft('');
  }
  async function create() {
    const steps = [
      ...suggestions.filter((_, i) => picked[i]).map((s) => newRoutineStep(s.title)),
      ...custom.map((c) => newRoutineStep(c)),
    ];
    if (steps.length === 0) return;
    const r = await createRoutine({ name: t(`routine.tpl.${kind}.name` as TKey), emoji: cfg.emoji, steps, notes: notes.trim() || undefined });
    onClose();
    onCreated?.(r);
  }

  return (
    <Sheet open onClose={onClose} title={t(`routine.tpl.${kind}.name` as TKey)}>
      <div className="space-y-5">
        {/* Vio's personal tip */}
        <div className="flex items-start gap-3 rounded-card p-3.5" style={{ background: 'color-mix(in srgb, var(--c-primary) 12%, var(--c-section))' }}>
          <VioCompanion mood="happy" size={48} />
          <p className="flex-1 text-[13.5px] text-ink leading-relaxed pt-0.5">{t(`rb.${kind}.tip` as TKey)}</p>
        </div>

        {/* Evidence-based suggestions */}
        <div>
          <h3 className="text-[13px] font-bold text-ink-3 uppercase tracking-wide mb-2">{t('rb.suggested')}</h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-colors"
                style={{ background: picked[i] ? 'color-mix(in srgb, var(--c-primary) 14%, var(--c-card))' : 'var(--c-card)', boxShadow: picked[i] ? 'inset 0 0 0 1px color-mix(in srgb, var(--c-primary) 45%, transparent)' : 'inset 0 0 0 1px var(--c-line)' }}
              >
                <span
                  className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                  style={picked[i] ? { background: 'var(--c-primary)', borderColor: 'var(--c-primary)' } : { borderColor: 'var(--c-line)' }}
                >
                  {picked[i] && <Check size={14} className="text-on-primary" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{s.title}</span>
                  {s.why && <span className="block text-[12.5px] text-ink-3 mt-0.5 leading-snug">{s.why}</span>}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom steps */}
        <div>
          <h3 className="text-[13px] font-bold text-ink-3 uppercase tracking-wide mb-2">{t('rb.yourSteps')}</h3>
          {custom.length > 0 && (
            <div className="space-y-2 mb-2">
              {custom.map((c, k) => (
                <div key={k} className="flex items-center gap-2 bg-section rounded-xl px-3 py-2.5">
                  <span className="flex-1 min-w-0 text-[14.5px] text-ink truncate">{c}</span>
                  <button onClick={() => setCustom((cs) => cs.filter((_, j) => j !== k))} aria-label={t('common.close')} className="text-ink-3 flex-shrink-0"><X size={16} /></button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }} placeholder={t('rb.addStep')} />
            <Button onClick={addCustom} aria-label={t('plan.add')}><Plus size={18} /></Button>
          </div>
        </div>

        {/* Personal notes */}
        <div>
          <h3 className="text-[13px] font-bold text-ink-3 uppercase tracking-wide mb-2">{t('rb.notes')}</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('rb.notesPlaceholder')}
            rows={3}
            className="w-full bg-section rounded-2xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-3 outline-none resize-none leading-relaxed"
          />
        </div>

        {total === 0 && <p className="text-[13px] text-ink-3 text-center">{t('rb.empty')}</p>}
        <Button block disabled={total === 0} onClick={() => void create()}>{t('rb.create')} · {total}</Button>
      </div>
    </Sheet>
  );
}
