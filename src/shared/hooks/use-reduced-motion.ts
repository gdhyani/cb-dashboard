"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Environments without matchMedia (tests, very old browsers) count as "no preference".
const query = () => (typeof window.matchMedia === "function" ? window.matchMedia(QUERY) : null);

function subscribe(onChange: () => void) {
  const q = query();
  q?.addEventListener("change", onChange);
  return () => q?.removeEventListener("change", onChange);
}

/**
 * Whether the reader asked for reduced motion. Hydration-safe: the server (and the first client render, which must match
 * it) answers `false`, then React re-renders with the real value. `motion`'s own `useReducedMotion` reads the media query
 * during the first client render, so a reduced-motion reader's HTML never matched the server's and the page failed to
 * hydrate.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => query()?.matches ?? false,
    () => false,
  );
}
