/** Media queries and the one easing family of the landing page. No DOM access at import time. */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isTouch = () => window.matchMedia("(hover: none), (pointer: coarse)").matches;

export const ease = {
  out: "expo.out", // entrances
  inOut: "expo.inOut", // sweeps (the highlighter, the packet)
  soft: "power3.out", // small UI
} as const;

/** Set on <html> before first paint when motion is allowed: hides reveal targets until they animate in. */
export const MOTION_CLASS = "lp-motion";
