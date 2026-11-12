"use client";

import { useCallback, useEffect, useState } from "react";
import { SIDEBAR_STORAGE_KEY } from "@/constants";

/** Studio's sidebar behaviour: always expanded, always collapsed (icons), or expand on hover (default). */
export type SidebarMode = "expanded" | "collapsed" | "hover";

export const SIDEBAR_MODES: { value: SidebarMode; label: string }[] = [
  { value: "expanded", label: "Expanded" },
  { value: "collapsed", label: "Collapsed" },
  { value: "hover", label: "Expand on hover" },
];

const isMode = (v: unknown): v is SidebarMode => v === "expanded" || v === "collapsed" || v === "hover";

export function useSidebarMode() {
  const [mode, setModeState] = useState<SidebarMode>("hover");
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (isMode(stored)) setModeState(stored);
    } catch {
      // Storage blocked: keep the default.
    }
  }, []);
  const setMode = useCallback((next: SidebarMode) => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next);
    } catch {
      // Storage blocked: applies for this visit only.
    }
    setModeState(next);
  }, []);
  return { mode, setMode };
}
