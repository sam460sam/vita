import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';

export interface TabDef<T extends string> {
  id: T;
  label: string;
}

interface Props<T extends string> {
  tabs: TabDef<T>[];
  active: T;
  onChange: (id: T) => void;
}

// Horizontal scroll strip with edge fades + auto-centered active tab, so core
// nav is never visually truncated (redesign B2). Active = white label + accent
// underline; inactive = muted.
export function ScrollTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  return (
    <div className="edge-fade border-b border-hairline bg-bg">
      <div ref={ref} className="no-scrollbar flex gap-1 overflow-x-auto px-3">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              data-tab={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                'relative shrink-0 whitespace-nowrap px-3 py-3 text-sm font-bold transition-colors',
                on ? 'text-ink' : 'text-muted',
              )}
            >
              {t.label}
              {on && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
