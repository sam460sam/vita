import { useState } from 'react';
import { Check } from 'lucide-react';
import { Sheet, Button } from '@/ui';
import { setEquipment } from '@/data/repo';
import { useT, type TKey } from '@/i18n';
import { EQUIPMENT_LIST } from './exercises';
import type { Equipment } from '@/data/types';

const EMOJI: Record<Equipment, string> = {
  bodyweight: '🧍', dumbbell: '🏋️', barbell: '➖', band: '🪢', kettlebell: '🔔', machine: '⚙️', pullupbar: '🚪',
};

/** Choose the equipment you own — drives the workout generator & templates. */
export function EquipmentSheet({ current, onClose }: { current: Equipment[]; onClose: () => void }) {
  const t = useT();
  const [sel, setSel] = useState<Set<Equipment>>(new Set(current));

  function toggle(e: Equipment) {
    setSel((p) => {
      const n = new Set(p);
      n.has(e) ? n.delete(e) : n.add(e);
      return n;
    });
  }

  async function save() {
    await setEquipment([...sel]);
    onClose();
  }

  return (
    <Sheet open onClose={onClose} title={t('workout.equipment')}>
      <p className="text-[13px] text-ink-2 mb-3">{t('workout.equipmentDesc')}</p>
      <div className="space-y-2">
        {EQUIPMENT_LIST.map((e) => {
          const on = sel.has(e);
          return (
            <button key={e} onClick={() => toggle(e)} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-section text-left" style={{ outline: on ? '2px solid var(--c-primary)' : 'none' }}>
              <span className="text-[20px]">{EMOJI[e]}</span>
              <span className="flex-1 text-[15px] font-semibold text-ink">{t(`equip.${e}` as TKey)}</span>
              <span className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0" style={on ? { background: 'var(--c-primary)' } : { border: '2px solid var(--c-line)' }}>
                {on && <Check size={14} className="text-white" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <Button block className="mt-4" onClick={() => void save()}>{t('common.save')}</Button>
    </Sheet>
  );
}
