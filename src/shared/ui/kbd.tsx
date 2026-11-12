import type * as React from "react";
import { cn } from "@/shared/lib/utils";

/** Keyboard hint chip, e.g. ⌘K. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-border-strong bg-surface-200 px-1 font-mono text-[11px] text-foreground-lighter",
        className,
      )}
      {...props}
    />
  );
}
