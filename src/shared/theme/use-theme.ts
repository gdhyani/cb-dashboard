"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/constants";
import { applyTheme, readThemeChoice, resolveTheme, type ThemeChoice } from "./theme";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

// One store for the whole page: every useTheme() (account menu, command menu, Account preferences) shows the same
// choice. `null` until read from storage, so nothing applies a default first and flashes the wrong theme.
let current: ThemeChoice | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Another tab changed the theme.
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_STORAGE_KEY) {
      current = readThemeChoice();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): ThemeChoice {
  if (current === null) current = readThemeChoice();
  return current;
}

const getServerSnapshot = (): ThemeChoice => "dark";

/** Theme choice for the dashboard: persisted per browser; "system" follows the OS live. */
export function useTheme() {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
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
    current = next;
    for (const l of listeners) l();
  }, []);

  return { choice, setChoice };
}
