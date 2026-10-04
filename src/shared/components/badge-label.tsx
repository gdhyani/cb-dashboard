import { cn } from "@/shared/lib/utils";

/** Soft pill for roles, types and states. Sentence case; "warning" is the only non-grey tone. */
export function BadgeLabel({
  children,
  tone = "default",
  dot = false,
}: {
  children: string;
  tone?: "default" | "strong" | "warning" | "muted" | "success";
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-xs font-medium whitespace-nowrap",
        tone === "default" && "bg-white/[0.06] text-muted-foreground",
        tone === "strong" && "bg-white/[0.12] text-foreground",
        tone === "warning" && "bg-destructive/15 text-destructive",
        tone === "success" && "bg-white/[0.12] text-foreground",
        tone === "muted" && "text-subtle",
      )}
    >
      {dot && (
        <span
          className={cn("size-1.5 rounded-full", tone === "warning" ? "bg-destructive" : "bg-current")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
