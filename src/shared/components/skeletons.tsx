import { Skeleton } from "@/shared/ui/skeleton";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Table/list rows: a title line, a meta line, a trailing control. */
export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border" aria-busy="true">
      {range(rows).map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** Card grid (projects, resources). */
export function SkeletonCards({ cards = 2, columns = 2 }: { cards?: number; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "grid gap-3 sm:grid-cols-2" : "flex flex-col gap-3"} aria-busy="true">
      {range(cards).map((i) => (
        <div key={i} className="flex flex-col gap-4 rounded-lg border border-border p-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A chart's footprint: axis line plus bars. */
export function SkeletonChart({ height = 160 }: { height?: number }) {
  return (
    <div className="flex items-end gap-1.5 border-b border-border pb-px" style={{ height }} aria-busy="true">
      {range(14).map((i) => (
        <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${25 + ((i * 37) % 60)}%` }} />
      ))}
    </div>
  );
}

/** Page header: eyebrow, display title, one line of description. */
export function SkeletonHeader() {
  return (
    <div className="flex flex-col gap-3 pb-2" aria-busy="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}
