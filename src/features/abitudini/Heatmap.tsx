import { cn } from '@/lib/cn';

/** Calendar heatmap: columns = weeks, rows = weekdays (GitHub-style). */
export function Heatmap({
  cells,
  color,
}: {
  cells: { date: string; done: boolean; scheduled: boolean }[];
  color: string;
}) {
  // Group into weeks of 7 (input is oldest..newest, length multiple-ish of 7).
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((c) => (
            <div
              key={c.date}
              title={c.date}
              className={cn('h-3 w-3 rounded-[3px]')}
              style={{
                background: c.done ? color : c.scheduled ? 'var(--c-divider)' : 'var(--c-section)',
                opacity: c.done ? 1 : 0.9,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
