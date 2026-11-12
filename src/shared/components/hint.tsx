"use client";

import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

/**
 * Studio-style hover/focus label for icon-only controls (top-bar buttons, the collapsed rail). The child must be a
 * single focusable element; `disabled` turns the hint off (e.g. when the label is already visible).
 */
export function Hint({
  label,
  side = "bottom",
  disabled = false,
  children,
}: {
  label: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  disabled?: boolean;
  children: ReactNode;
}) {
  if (disabled) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
