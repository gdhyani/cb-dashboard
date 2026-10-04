import { cn } from "@/shared/lib/utils";

/** A project's first letter in a small square: the project "logo" in lists and the switcher. */
export function ProjectMark({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-[4px] border border-border-strong font-mono text-[10px] leading-none text-foreground uppercase",
        className,
      )}
    >
      {name.slice(0, 1)}
    </span>
  );
}
