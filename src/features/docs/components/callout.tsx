import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const STYLES = {
  note: { label: "Note", icon: Info, border: "border-l-info bg-info/[0.06]", text: "text-info", role: "note" },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    border: "border-l-success bg-success/[0.06]",
    text: "text-success",
    role: "note",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    border: "border-l-warning bg-warning/[0.06]",
    text: "text-warning",
    role: "alert",
  },
  danger: {
    label: "Danger",
    icon: OctagonAlert,
    border: "border-l-hot bg-hot-soft",
    text: "text-hot",
    role: "alert",
  },
} as const;

/** FR-DOC-007: guidance inside the flow, at the step it applies to. Colours follow badge-tones. */
export function Callout({ type, title, children }: { type: keyof typeof STYLES; title?: string; children: ReactNode }) {
  const s = STYLES[type];
  const Icon = s.icon;
  return (
    <div
      role={s.role}
      data-callout={type}
      className={cn("not-prose my-6 rounded-md border border-border border-l-4 px-4 py-3.5", s.border)}
    >
      <p className={cn("flex items-center gap-2 text-sm font-semibold", s.text)}>
        <Icon className="size-4" aria-hidden="true" /> {title ?? s.label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-(--docs-prose) [&_a]:text-placeholder [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_p]:my-1">
        {children}
      </div>
    </div>
  );
}
