"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { ThemeMenu } from "@/shared/components/theme-toggle";
import { isThemeChoice } from "@/shared/theme/theme";

const noop = () => () => {};

/**
 * Docs and blog theme switcher: the same control as the dashboard's, driven by next-themes (which Fumadocs runs here and
 * which writes the same `cb-theme` choice). Before mount the stored choice is unknown, so it shows Dark, the default,
 * and never mismatches the server HTML.
 */
export function SiteThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const choice = mounted && isThemeChoice(theme) ? theme : "dark";
  return <ThemeMenu choice={choice} onChoice={setTheme} className={className} />;
}
