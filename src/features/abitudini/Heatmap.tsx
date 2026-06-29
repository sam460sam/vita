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
                // Empty by default; a cell only takes the habit color once it's
                // actually completed. Scheduled-but-not-done stays neutral so the
                // grid fills in over time instead of looking pre-painted.
                background: c.done ? color : 'var(--c-line)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
