import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const STYLES = {
  note: { label: "Note", icon: Info, border: "border-l-sky-400", role: "note" },
  tip: { label: "Tip", icon: Lightbulb, border: "border-l-emerald-400", role: "note" },
  warning: { label: "Warning", icon: TriangleAlert, border: "border-l-amber-400", role: "alert" },
  danger: { label: "Danger", icon: OctagonAlert, border: "border-l-destructive", role: "alert" },
} as const;

/** FR-DOC-007: guidance inside the flow, at the step it applies to. Colours follow badge-tones. */
export function Callout({ type, title, children }: { type: keyof typeof STYLES; title?: string; children: ReactNode }) {
  const s = STYLES[type];
  const Icon = s.icon;
  return (
    <div
      role={s.role}
      data-callout={type}
      className={cn("not-prose my-5 rounded-md border border-border border-l-4 bg-card px-4 py-3", s.border)}
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4" aria-hidden="true" /> {title ?? s.label}
      </p>
      <div className="mt-1 text-sm text-muted-foreground [&_a]:underline [&_code]:font-mono [&_p]:my-1">{children}</div>
    </div>
  );
}
