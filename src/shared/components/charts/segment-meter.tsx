import { BLOCK_SHADES } from "./shades";

/**
 * LED-style level meter: one column per day, each a stack of small segments lit up to that day's level.
 * The latest day is drawn brightest.
 */
export function SegmentMeter({
  values,
  segments = 6,
  className,
}: {
  values: number[];
  segments?: number;
  className?: string;
}) {
  const max = Math.max(1, ...values);
  return (
    <div
      role="img"
      aria-label={`Last ${values.length} days, latest ${values.at(-1) ?? 0}, peak ${Math.max(0, ...values)}`}
      className={className ?? "flex h-8 items-end gap-[3px]"}
    >
      {values.map((v, i) => {
        const lit = v > 0 ? Math.max(1, Math.round((v / max) * segments)) : 0;
        const latest = i === values.length - 1;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length day series
          <div key={i} title={`${v}`} className="flex h-full flex-1 flex-col-reverse gap-[2px]">
            {Array.from({ length: segments }, (_, s) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed segment stack
                key={s}
                className="flex-1 rounded-[1.5px]"
                style={{ background: s < lit ? (latest ? BLOCK_SHADES[4] : BLOCK_SHADES[3]) : BLOCK_SHADES[0] }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
