import type * as React from "react";
import { cn } from "@/shared/lib/utils";

export const fieldClasses =
  "w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-subtle hover:border-border-strong focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive/70";

// suppressHydrationWarning: some browsers (e.g. cmux) tag a focused input with their own data
// attributes before hydration, which made the autofocused login field log a mismatch. It only
// covers this element's attributes, not its children.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      suppressHydrationWarning
      className={cn(fieldClasses, "h-9 py-1", className)}
      {...props}
    />
  );
}

export { Input };
