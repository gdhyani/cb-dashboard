"use client";

import type { FocusEvent, ReactNode } from "react";
import { useMediaQuery } from "@/shared/hooks/use-media-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

/** Devices with a real pointer: phones and tablets never get hover hints (a tap is not a hover). */
const HOVER_DEVICE = "(hover: hover) and (pointer: fine)";

/**
 * Studio-style hover label for icon-only controls (top-bar buttons, the collapsed rail). Shown on mouse hover and on
 * keyboard focus only — not on touch screens, and not when focus merely returns to the button after its menu or
 * dialog closes. The child must be a single focusable element; `disabled` turns the hint off.
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
  const canHover = useMediaQuery(HOVER_DEVICE);
  if (disabled || !canHover) return <>{children}</>;
  // Radix opens a tooltip on any focus; keep it for keyboard focus (:focus-visible) only.
  const keyboardFocusOnly = (e: FocusEvent<HTMLElement>) => {
    let keyboard = true;
    try {
      keyboard = e.currentTarget.matches(":focus-visible");
    } catch {
      // Very old engines without :focus-visible: keep the default behaviour.
    }
    if (!keyboard) e.preventDefault();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild onFocus={keyboardFocusOnly}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
