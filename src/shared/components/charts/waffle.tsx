import { BLOCK_SHADES } from "./shades";

export interface WaffleGroup {
  label: string;
  count: number;
  /** Outlined instead of filled (e.g. time-limited). */
  hollow?: boolean;
}

/** One square per unit, grouped and shaded per category, with a counted legend. */
export function Waffle({ groups, empty = "Nothing yet." }: { groups: WaffleGroup[]; empty?: string }) {
  const total = groups.reduce((a, g) => a + g.count, 0);
  if (total === 0) return <p className="text-sm text-subtle">{empty}</p>;
  const shadeOf = (i: number) => BLOCK_SHADES[Math.max(1, 4 - i)];
  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-wrap gap-[4px]"
        role="img"
        aria-label={groups.map((g) => `${g.label} ${g.count}`).join(", ")}
      >
        {groups.flatMap((g, gi) =>
          Array.from({ length: g.count }, (_, u) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: identical unit squares within a group
              key={`${g.label}-${u}`}
              title={g.label}
              className="size-4 rounded-[3px]"
              style={g.hollow ? { boxShadow: `inset 0 0 0 1.5px ${shadeOf(gi)}` } : { background: shadeOf(gi) }}
            />
          )),
        )}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {groups.map((g, gi) => (
          <li key={g.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-2.5 rounded-[2px]"
              style={g.hollow ? { boxShadow: `inset 0 0 0 1.5px ${shadeOf(gi)}` } : { background: shadeOf(gi) }}
            />
            {g.label}
            <span className="font-mono tabular-nums text-foreground">{g.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
