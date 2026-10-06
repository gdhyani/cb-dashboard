"use client";

import { cn } from "@/shared/lib/utils";

export interface Choice<T extends string> {
  value: T;
  title: string;
  hint: string;
}

/** A single choice shown as selectable cards (radio semantics, keyboard focus ring). */
export function ChoiceCards<T extends string>({
  name,
  legend,
  choices,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  legend: string;
  choices: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <fieldset className={cn("grid gap-2", columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      <legend className="sr-only">{legend}</legend>
      {choices.map((c) => (
        <label
          key={c.value}
          className={cn(
            "relative flex cursor-pointer flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
            value === c.value ? "border-foreground bg-white/[0.04]" : "border-border hover:border-border-strong",
          )}
        >
          <input
            type="radio"
            name={name}
            value={c.value}
            checked={value === c.value}
            onChange={() => onChange(c.value)}
            className="sr-only"
          />
          <span className="text-sm font-medium">{c.title}</span>
          <span className="text-xs text-subtle">{c.hint}</span>
        </label>
      ))}
    </fieldset>
  );
}
