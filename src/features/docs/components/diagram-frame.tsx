import type { ReactNode } from "react";

/** Docs diagrams sit on the same gradient as screenshots (PRD v1.36 exception), on a black card. */
export function DiagramFrame({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-6">
      <div data-docs-frame className="rounded-xl p-3 sm:p-6" style={{ background: "var(--docs-frame-gradient)" }}>
        <div className="overflow-x-auto rounded-lg bg-background p-4">{children}</div>
      </div>
      {caption && <figcaption className="mt-2 text-center text-hint text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}
