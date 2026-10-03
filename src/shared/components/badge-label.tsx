import { cn } from "@/shared/lib/utils";

/** Monochrome label used for roles, variable types, states. "warning" is the only non-grey tone. */
export function BadgeLabel({
  children,
  tone = "default",
}: {
  children: string;
  tone?: "default" | "strong" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wider",
        tone === "default" && "border-border text-muted-foreground",
        tone === "strong" && "border-foreground text-foreground",
        tone === "warning" && "border-destructive/60 text-destructive",
        tone === "muted" && "border-transparent text-subtle",
      )}
    >
      {children}
    </span>
  );
}
