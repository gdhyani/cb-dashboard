"use client";

import { Palette } from "lucide-react";
import { ACCENTS, type Accent, useAccent } from "@/shared/theme/accent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Hint } from "./hint";

/** TEMPORARY (PRD v1.61): try each accent live before choosing cb's main colour. */
export function AccentPicker() {
  const { accent, setAccent } = useAccent();
  return (
    <DropdownMenu>
      <Hint label="Accent (testing)">
        <DropdownMenuTrigger
          aria-label="Accent colour"
          className="flex size-8 items-center justify-center rounded-md text-foreground-lighter transition-colors hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
        >
          <Palette className="size-4" strokeWidth={1.5} />
        </DropdownMenuTrigger>
      </Hint>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Accent colour (testing)</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={accent} onValueChange={(v) => setAccent(v as Accent)}>
          {ACCENTS.map((a) => (
            <DropdownMenuRadioItem key={a.value} value={a.value} onSelect={(e) => e.preventDefault()}>
              <span
                aria-hidden="true"
                className="size-3.5 shrink-0 rounded-[4px] border border-border-strong"
                style={{ background: a.swatch }}
              />
              <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2">
                <span className="text-foreground">{a.label}</span>
                <span className="truncate text-[11px] text-foreground-lighter">{a.note}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
