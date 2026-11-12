"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/constants";
import { applyTheme, readThemeChoice, resolveTheme, type ThemeChoice } from "./theme";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** Theme choice for the dashboard: persisted per browser; "system" follows the OS live. */
export function useTheme() {
  // null until the stored choice is read: applying a default first would flash the wrong theme.
  const [choice, setChoiceState] = useState<ThemeChoice | null>(null);

  useEffect(() => setChoiceState(readThemeChoice()), []);

  useEffect(() => {
    if (!choice) return;
    const query = window.matchMedia(LIGHT_QUERY);
    const update = () => applyTheme(resolveTheme(choice, query.matches));
    update();
    if (choice !== "system") return;
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [choice]);

  const setChoice = useCallback((next: ThemeChoice) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage blocked (private window): the choice still applies for this visit.
    }
    setChoiceState(next);
  }, []);

  return { choice: choice ?? "dark", setChoice };
}
