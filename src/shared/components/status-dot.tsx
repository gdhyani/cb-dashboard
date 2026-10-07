import { cn } from "@/shared/lib/utils";

export type StatusTone = "ok" | "rejected" | "unknown";

const TONES: Record<StatusTone, string> = {
  ok: "bg-emerald-400",
  rejected: "bg-destructive",
  // M10: a hollow ring in the text colour — readable on any theme (a white/alpha fill vanished on light backgrounds),
  // and told apart from the filled "checked" dots by shape, not colour alone.
  unknown: "border-[1.5px] border-current bg-transparent",
};

/** A small status dot (B11). Colour carries meaning only; the label is what screen readers and tooltips say. */
export function StatusDot({ tone, label, className }: { tone: StatusTone; label: string; className?: string }) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn("inline-block size-2 shrink-0 rounded-full", TONES[tone], className)}
    />
  );
}
