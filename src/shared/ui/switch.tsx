"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

/** Supabase Switch (medium 34×20): bright green when on, control grey when off. */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-[34px] shrink-0 cursor-pointer items-center rounded-full border border-border-control transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-transparent data-[state=checked]:bg-primary-bright data-[state=unchecked]:bg-control",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none block size-4 translate-x-px rounded-full bg-foreground-lighter shadow-lg transition-transform data-[state=checked]:translate-x-[15px] data-[state=checked]:bg-white" />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
