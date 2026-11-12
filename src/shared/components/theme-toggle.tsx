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

export const THEME_ICONS = { dark: Moon, light: Sun, system: Monitor } as const;

/** Top-bar theme switcher: the icon shows the current choice; the menu offers Dark, Light and System (FR-UI-008). */
export function ThemeToggle({ className }: { className?: string }) {
  const { choice, setChoice } = useTheme();
  const Current = THEME_ICONS[choice];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Theme: ${choice}`}
        title="Theme"
        className={cn(
          "flex size-8 items-center justify-center rounded-md text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground",
          className,
        )}
      >
        <Current className="size-4" strokeWidth={1.5} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={choice} onValueChange={(v) => setChoice(v as ThemeChoice)}>
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
