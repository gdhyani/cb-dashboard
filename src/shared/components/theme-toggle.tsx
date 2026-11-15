"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { THEME_CHOICES, type ThemeChoice } from "@/shared/theme/theme";
import { useTheme } from "@/shared/theme/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Hint } from "./hint";

export const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor } as const;

/**
 * The one theme switcher of the site (FR-UI-008): an icon showing the current choice, a menu with Dark, Light and
 * System. Presentational — the dashboard feeds it from its theme store, docs and blog from next-themes; both write the
 * same `cb-theme` choice.
 */
export function ThemeMenu({
  choice,
  onChoice,
  className,
}: {
  choice: ThemeChoice;
  onChoice: (next: ThemeChoice) => void;
  className?: string;
}) {
  const Current = THEME_ICONS[choice];
  return (
    <DropdownMenu>
      <Hint label="Theme">
        <DropdownMenuTrigger
          aria-label={`Theme: ${choice}`}
          className={cn(
            "flex size-8 items-center justify-center rounded-md text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
            className,
          )}
        >
          <Current className="size-4" strokeWidth={1.5} />
        </DropdownMenuTrigger>
      </Hint>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={choice} onValueChange={(v) => onChoice(v as ThemeChoice)}>
          {THEME_CHOICES.map((t) => {
            const Icon = THEME_ICONS[t.value];
            return (
              <DropdownMenuRadioItem key={t.value} value={t.value}>
                <Icon /> {t.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Dashboard top-bar theme switcher (FR-UI-008). */
export function ThemeToggle({ className }: { className?: string }) {
  const { choice, setChoice } = useTheme();
  return <ThemeMenu choice={choice} onChoice={setChoice} className={className} />;
}
