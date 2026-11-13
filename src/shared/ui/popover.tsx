"use client";

import { Popover as PopoverPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/shared/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

/** Floating panel anchored to its trigger: raised surface, hairline edge. */
function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "cb-pop z-50 overflow-hidden rounded-md bg-overlay text-foreground shadow-floating outline-none",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
