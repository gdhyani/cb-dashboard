"use client";

import { useCallback, useSyncExternalStore } from "react";
import { ACCENT_STORAGE_KEY } from "@/constants";

/**
 * TEMPORARY accent picker (owner testing, PRD v1.61): each accent re-colours the primary button, links, focus ring,
 * switches, logo and charts (styles/accents.css). Remove once cb's accent is chosen.
 */
export const ACCENTS = [
  { value: "green", label: "Green", swatch: "#3ecf8e", note: "Supabase original" },
  { value: "brass", label: "Brass", swatch: "#e3b341", note: "Warm gold" },
  { value: "mono", label: "Monochrome", swatch: "#ededed", note: "No accent colour" },
  { value: "cobalt", label: "Cobalt", swatch: "#3e63dd", note: "Security blue" },
  { value: "iris", label: "Iris", swatch: "#6e56cf", note: "Soft violet" },
  { value: "teal", label: "Teal", swatch: "#12a594", note: "Deep teal" },
] as const;

export type Accent = (typeof ACCENTS)[number]["value"];
export const DEFAULT_ACCENT: Accent = "green";

const isAccent = (v: unknown): v is Accent => ACCENTS.some((a) => a.value === v);

const listeners = new Set<() => void>();
function read(): Accent {
  try {
    const v = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    return isAccent(v) ? v : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useAccent() {
  const accent = useSyncExternalStore(subscribe, read, () => DEFAULT_ACCENT);
  const setAccent = useCallback((next: Accent) => {
    try {
      window.localStorage.setItem(ACCENT_STORAGE_KEY, next);
    } catch {
      // Storage blocked: applies for this page only.
    }
    document.documentElement.dataset.accent = next;
    for (const l of listeners) l();
  }, []);
  return { accent, setAccent };
}
