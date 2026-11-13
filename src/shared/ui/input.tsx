import type * as React from "react";
import { cn } from "@/shared/lib/utils";

/** Supabase field: dark inset fill, control border that brightens on hover/focus, green focus ring. */
export const fieldClasses =
  "w-full min-w-0 rounded-md border border-border-control bg-field px-3 text-sm text-foreground shadow-none transition-[border-color,background-color] duration-200 outline-none placeholder:text-foreground-muted hover:border-border-control-hover focus-visible:border-border-control-hover focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-foreground-muted aria-invalid:border-destructive/60 aria-invalid:bg-destructive/5 [&[readonly]]:resize-none [&[readonly]]:border-border [&[readonly]]:bg-muted [&[readonly]]:text-foreground-light";

// suppressHydrationWarning: some browsers (e.g. cmux) tag a focused input with their own data
// attributes before hydration, which made the autofocused login field log a mismatch. It only
// covers this element's attributes, not its children.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      suppressHydrationWarning
      className={cn(fieldClasses, "h-[34px] py-1", className)}
      {...props}
    />
  );
}

export { Input };
