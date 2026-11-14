"use client";

import { useEffect } from "react";

/**
 * Starts the landing page's motion on mount and reverts all of it on unmount (e.g. navigating to /login).
 * The motion module (GSAP plugins, Lenis) is loaded after first paint, so it never delays the hero text.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-landing]");
    if (!root) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    void import("../motion/start-landing").then(({ startLanding }) => {
      if (!cancelled) stop = startLanding(root);
    });
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
  return null;
}
