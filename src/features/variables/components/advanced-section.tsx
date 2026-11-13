"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Admonition } from "@/shared/components/admonition";
import { cn } from "@/shared/lib/utils";
import type { FieldDef } from "../lib/catalog";
import { FieldInput } from "./field-input";

/** D7: extra connection details only (endpoint, CA certificate, hosts) — never key names. Collapsed by default. */
export function AdvancedSection({
  idPrefix,
  fields,
  values,
  onChange,
  forceOpen = false,
  hint,
}: {
  idPrefix: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  /** D3: opened on its own when a detail here is needed (e.g. an Aiven URL needs its CA certificate). */
  forceOpen?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(forceOpen);
  // Once opened for a reason it stays open (filling the CA in must not fold the section away).
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);
  if (fields.length === 0) return null;
  return (
    <section className="-mx-5 flex flex-col gap-3 border-t border-border px-5 pt-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 self-start rounded-md text-left text-sm text-foreground"
      >
        <ChevronRight
          aria-hidden
          strokeWidth={1.5}
          className={cn("size-4 text-foreground-lighter transition-transform", open && "rotate-90")}
        />
        Advanced
        <span className="text-foreground-lighter">· connection details</span>
      </button>
      {open && (
        <div className="flex flex-col gap-4 pl-5">
          {hint && <Admonition type="note">{hint}</Admonition>}
          {fields.map((f) => (
            <FieldInput
              key={f.name}
              idPrefix={idPrefix}
              def={f}
              value={values[f.name] ?? ""}
              onChange={(v) => onChange(f.name, v)}
              error={values[f.name]?.trim() ? f.validate?.(values[f.name]?.trim() ?? "") : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
