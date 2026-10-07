"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { type DraftExtra, type ExtraDef, normalizeKey } from "../lib/catalog";

/** D8: optional extra keys a service can provide. Names are suggestions — the admin keeps or renames them. */
export function ExtrasSection({
  defs,
  extras,
  fields = {},
  onChange,
}: {
  defs: ExtraDef[];
  extras: DraftExtra[];
  /** The draft's typed fields, so a value that defaults from one (`defaultFrom`) shows it. */
  fields?: Record<string, string | undefined>;
  onChange: (extras: DraftExtra[]) => void;
}) {
  const [open, setOpen] = useState(false);
  if (defs.length === 0) return null;
  const ticked = extras.filter((e) => e.on).length;
  // Same fallback buildCreateRequest uses when the value is left empty.
  const defaultOf = (def: ExtraDef) => (def.defaultFrom ? (fields[def.defaultFrom] ?? "").trim() : "");
  const set = (i: number, patch: Partial<DraftExtra>) =>
    onChange(extras.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-left text-[13px] font-medium"
      >
        <ChevronRight aria-hidden className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} />
        Suggested extra keys
        <span className="font-normal text-subtle">· optional{ticked ? ` · ${ticked} selected` : ""}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-2.5 pl-5">
          <p className="text-xs text-subtle">
            Add these only if your code reads them. Rename them to match your code — now or any time later.
          </p>
          {extras.map((e, i) => {
            const def = defs.find((d) => d.suggestedKey === e.suggestedKey);
            if (!def) return null;
            return (
              <div key={e.suggestedKey} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked={e.on}
                    onChange={(ev) => set(i, { on: ev.target.checked })}
                    aria-label={`Add ${def.what}`}
                    className="size-4 accent-foreground"
                  />
                  <Input
                    value={e.key}
                    aria-label={`Key name for ${def.what}`}
                    onChange={(ev) => set(i, { key: normalizeKey(ev.target.value) })}
                    className="h-8 min-w-0 flex-1 basis-48 font-mono text-xs"
                  />
                  <span className="text-xs text-subtle">{def.what}</span>
                </div>
                {e.on && !def.field && (
                  <div className="pl-6">
                    <Input
                      value={e.value ?? defaultOf(def)}
                      aria-label={def.what}
                      placeholder={defaultOf(def) || def.placeholder}
                      onChange={(ev) => set(i, { value: ev.target.value })}
                      className="h-8 font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
