import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

const STYLES = {
  note: { label: "Note", icon: Info, border: "border-l-sky-400 bg-sky-400/[0.06]", text: "text-sky-300", role: "note" },
  tip: {
    label: "Tip",
    icon: Lightbulb,
    border: "border-l-emerald-400 bg-emerald-400/[0.06]",
    text: "text-emerald-300",
    role: "note",
  },
  warning: {
    label: "Warning",
    icon: TriangleAlert,
    border: "border-l-amber-400 bg-amber-400/[0.06]",
    text: "text-amber-300",
    role: "alert",
  },
  danger: {
    label: "Danger",
    icon: OctagonAlert,
    border: "border-l-destructive bg-destructive/[0.07]",
    text: "text-red-300",
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
      <div className="mt-1.5 text-sm leading-relaxed text-[#c8c8c8] [&_a]:text-sky-300 [&_a]:underline [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:font-mono [&_p]:my-1">
        {children}
      </div>
    </div>
  );
}
