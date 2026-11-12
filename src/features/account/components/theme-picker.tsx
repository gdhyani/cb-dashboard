"use client";

import { cn } from "@/shared/lib/utils";
import { THEME_CHOICES, type ThemeChoice } from "@/shared/theme/theme";
import { useTheme } from "@/shared/theme/use-theme";

/**
 * Fixed colours for the previews only: each card must show its theme while the page is in the other one, so it
 * cannot use the theme tokens (they follow the active theme). Values match styles/studio.css.
 */
const PREVIEW = {
  dark: { bg: "#121212", panel: "#1c1c1c", line: "#2e2e2e", text: "#ededed", muted: "#707070" },
  light: { bg: "#fcfcfc", panel: "#f8f8f8", line: "#e6e6e6", text: "#171717", muted: "#8f8f8f" },
} as const;
const BRAND = "#3ecf8e";

function Preview({ theme }: { theme: "dark" | "light" }) {
  const c = PREVIEW[theme];
  return (
    <div className="flex h-full w-full" style={{ background: c.bg }} aria-hidden="true">
      <div
        className="flex w-1/4 flex-col gap-1.5 p-2"
        style={{ background: c.panel, borderRight: `1px solid ${c.line}` }}
      >
        <span className="h-2 w-2 rounded-[2px]" style={{ background: BRAND }} />
        <span className="h-1 w-3/4 rounded-full" style={{ background: c.muted }} />
        <span className="h-1 w-1/2 rounded-full" style={{ background: c.muted }} />
        <span className="h-1 w-2/3 rounded-full" style={{ background: c.muted }} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <span className="h-1.5 w-1/2 rounded-full" style={{ background: c.text }} />
        <span className="h-1 w-3/4 rounded-full" style={{ background: c.muted }} />
        <span
          className="mt-1 h-6 w-full rounded-[3px]"
          style={{ background: c.panel, border: `1px solid ${c.line}` }}
        />
        <span className="ml-auto h-2 w-6 rounded-[2px]" style={{ background: BRAND }} />
      </div>
    </div>
  );
}

const DESCRIPTIONS: Record<ThemeChoice, string> = {
  dark: "The default",
  light: "Light surfaces, dark text",
  system: "Follows your device setting",
};

/** Dark / Light / System as three selectable preview cards (radio semantics, keyboard focus ring). */
export function ThemePicker() {
  const { choice, setChoice } = useTheme();
  return (
    <fieldset className="grid gap-3 sm:grid-cols-3">
      <legend className="sr-only">Theme</legend>
      {THEME_CHOICES.map((t) => {
        const selected = choice === t.value;
        return (
          <label
            key={t.value}
            className={cn(
              "group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-surface-100 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring",
              selected ? "border-foreground-lighter" : "border-border hover:border-border-strong",
            )}
          >
            <input
              type="radio"
              name="theme"
              value={t.value}
              checked={selected}
              onChange={() => setChoice(t.value)}
              className="sr-only"
            />
            <div className="h-24 border-b border-border">
              {t.value === "system" ? (
                <div className="relative h-full w-full">
                  <Preview theme="dark" />
                  <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
                    <Preview theme="light" />
                  </div>
                </div>
              ) : (
                <Preview theme={t.value} />
              )}
            </div>
            <div className="flex items-start gap-2 px-3 py-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                  selected ? "border-primary" : "border-border-control",
                )}
              >
                {selected && <span className="size-1.5 rounded-full bg-primary" />}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm text-foreground">{t.label}</span>
                <span className="text-xs text-foreground-lighter">{DESCRIPTIONS[t.value]}</span>
              </span>
            </div>
          </label>
        );
      })}
    </fieldset>
  );
}
