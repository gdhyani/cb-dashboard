import { KINDS } from "../lib/kinds";
import type { Resource } from "../types";

function Node({ title, detail, strong = false }: { title: string; detail: string; strong?: boolean }) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 rounded-md border px-3 py-2 ${strong ? "border-foreground/60 bg-white/[0.04]" : "border-border-strong bg-card"}`}
    >
      <span className="truncate text-sm font-medium">{title}</span>
      <span className="truncate font-mono text-[11px] text-subtle">{detail}</span>
    </div>
  );
}

/** Dashed on the laptop side (fake values), solid past the gateway (real credentials). */
function Link({ solid = false }: { solid?: boolean }) {
  return (
    <div aria-hidden className="flex items-center justify-center">
      <span
        className={`h-5 w-px md:h-px md:w-full md:min-w-6 ${solid ? "bg-foreground/50" : "border-l border-dashed border-border-strong md:border-l-0 md:border-t"}`}
      />
    </div>
  );
}

/** How an app in this environment reaches each service: fake values locally, real credentials only server-side. */
export function ConnectionMap({ resources }: { resources: Resource[] }) {
  if (resources.length === 0) return null;
  return (
    <figure className="cb-grid-wide flex flex-col gap-3 rounded-lg border border-border p-4">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Connection map</span>
        <span className="flex items-center gap-4 text-[11px] text-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t border-dashed border-border-strong" /> fake values
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-foreground/50" /> real credentials
          </span>
        </span>
      </figcaption>
      <div className="grid grid-cols-1 items-center md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_minmax(0,1fr)_2rem_minmax(0,1.3fr)]">
        <Node title="Your app" detail="process.env: fake only" />
        <Link />
        <Node title="cb agent" detail="127.0.0.1 · byte pipe" />
        <Link />
        <Node title="Gateway" detail="verifies, injects secrets" strong />
        <Link solid />
        <ul className="flex flex-col gap-1.5 border-l border-foreground/50 pl-3">
          {resources.map((r) => (
            <li key={r.id} className="flex min-w-0 items-center gap-2 rounded-md border border-border px-3 py-1.5">
              <span className="min-w-[40%] flex-1 truncate text-sm">{r.name}</span>
              <span className="max-w-[55%] truncate text-right font-mono text-[11px] text-subtle">
                {KINDS[r.kind]?.label ?? r.kind}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
