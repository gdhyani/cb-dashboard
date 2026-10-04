import { cn } from "@/shared/lib/utils";
import { BLOCK_SHADES, shadeStep } from "./shades";

export interface HeatmapRow {
  label: string;
  values: number[];
}

/**
 * Rows × days of blocks (full width, fixed height); brightness = activity that day relative to that row's busiest day
 * (so quiet rows still show their pattern), with each row's total on the right.
 * Each block carries its count in a native tooltip and in the accessible label.
 */
export function BlockHeatmap({ rows, columns }: { rows: HeatmapRow[]; columns: string[] }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-x-3 gap-y-1 sm:grid-cols-[7rem_minmax(0,1fr)_3rem]">
        {rows.map((row) => {
          const max = Math.max(0, ...row.values);
          return (
            <div key={row.label} className="contents">
              <span className="truncate text-xs text-muted-foreground">{row.label}</span>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
                {row.values.map((v, i) => (
                  <span
                    key={columns[i]}
                    role="img"
                    title={`${row.label} · ${columns[i]}: ${v}`}
                    aria-label={`${row.label} on ${columns[i]}: ${v}`}
                    className="h-5 rounded-[3px] transition-colors sm:h-7"
                    style={{ background: BLOCK_SHADES[shadeStep(v, max)] }}
                  />
                ))}
              </div>
              <span className="text-right font-mono text-xs tabular-nums">{row.values.reduce((a, b) => a + b, 0)}</span>
            </div>
          );
        })}
        <span />
        <div className="flex justify-between font-mono text-[10px] text-subtle">
          <span>{columns[0]}</span>
          <span className="hidden sm:inline">{columns[Math.floor(columns.length / 2)]}</span>
          <span>{columns.at(-1)}</span>
        </div>
        <span />
      </div>
      <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] text-subtle">
        less
        {BLOCK_SHADES.map((c, i) => (
          <span
            key={c}
            className={cn("size-2.5 rounded-[2px]", i === 0 && "outline outline-1 outline-border")}
            style={{ background: c }}
          />
        ))}
        more
      </div>
    </div>
  );
}
