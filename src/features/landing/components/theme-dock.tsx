"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { THEME_CHOICES } from "@/shared/theme/theme";
import { useTheme } from "@/shared/theme/use-theme";

const ICONS = { dark: Moon, light: Sun, system: Monitor } as const;

/**
 * Theme switcher. `floating`: pinned bottom-right on desktop (hidden on phones, where it would cover content);
 * `inline`: in the phone menu and the footer. Same stored choice as the dashboard (FR-UI-008).
 */
export function ThemeDock({ variant = "floating" }: { variant?: "floating" | "inline" }) {
  const { choice, setChoice } = useTheme();
  return (
    <fieldset className={`lp-dock lp-dock--${variant}`}>
      <legend className="lp-sr">Theme</legend>
      {THEME_CHOICES.map((t) => {
        const Icon = ICONS[t.value];
        return (
          <button
            key={t.value}
            type="button"
            className="lp-dock__option"
            aria-pressed={choice === t.value}
            aria-label={`${t.label} theme`}
            title={`${t.label} theme`}
            onClick={() => setChoice(t.value)}
          >
            <Icon aria-hidden="true" size={15} strokeWidth={1.75} />
            <span className="lp-dock__label">{t.label}</span>
          </button>
        );
      })}
    </fieldset>
  );
}
