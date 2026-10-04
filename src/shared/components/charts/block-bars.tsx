import { StaggerItem } from "../stagger";
import { BLOCK_SHADES } from "./shades";

const UNITS = 20;

/** Ranked rows of unit blocks: lit blocks ∝ value against the top row; the leader is brightest. */
export function BlockBars({
  items,
  empty = "Nothing yet.",
}: {
  items: { label: string; value: number }[];
  empty?: string;
}) {
  if (items.length === 0) return <p className="text-sm text-subtle">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, rank) => {
        const lit = item.value > 0 ? Math.max(1, Math.round((item.value / max) * UNITS)) : 0;
        return (
          <StaggerItem key={item.label} index={rank} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{item.label}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{item.value}</span>
            </div>
            <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${UNITS}, minmax(0, 1fr))` }}>
              {Array.from({ length: UNITS }, (_, u) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed unit row
                  key={u}
                  className="h-2.5 rounded-[2px]"
                  style={{ background: u < lit ? BLOCK_SHADES[rank === 0 ? 4 : 3] : BLOCK_SHADES[0] }}
                />
              ))}
            </div>
          </StaggerItem>
        );
      })}
    </ul>
  );
}
