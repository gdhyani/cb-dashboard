"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { FieldDef } from "../lib/catalog";
import { FieldInput } from "./field-input";

/** D7: extra connection details only (endpoint, CA certificate, hosts) — never key names. Collapsed by default. */
export function AdvancedSection({
  idPrefix,
  fields,
  values,
  onChange,
}: {
  idPrefix: string;
  fields: FieldDef[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  if (fields.length === 0) return null;
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-left text-[13px] font-medium"
      >
        <ChevronRight aria-hidden className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} />
        Advanced
        <span className="font-normal text-subtle">· connection details</span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 pl-5">
          {fields.map((f) => (
            <FieldInput
              key={f.name}
              idPrefix={idPrefix}
              def={f}
              value={values[f.name] ?? ""}
              onChange={(v) => onChange(f.name, v)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
