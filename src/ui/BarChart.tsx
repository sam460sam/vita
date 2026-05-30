interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  unit?: string;
}

/** Minimal native-SVG bar chart — clean, no dependency. */
export function BarChart({ data, color = 'var(--c-ink)', height = 120, unit }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * (height - 20);
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
              <div
                className="w-full rounded-md transition-all duration-500"
                style={{
                  height: Math.max(2, h),
                  background: d.value > 0 ? color : 'var(--c-divider)',
                  opacity: d.value > 0 ? 1 : 0.6,
                }}
                title={`${d.value}${unit ? ' ' + unit : ''}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-[10px] text-ink-3 font-medium truncate">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
