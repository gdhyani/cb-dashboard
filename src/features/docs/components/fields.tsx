"use client";

import { ChevronRight } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { cn } from "@/shared/lib/utils";

/** A form's fields as one block (FR-DOC-007): "Required" open, "Optional (Advanced)" collapsible. */
export function Fields({
  title,
  collapsible = false,
  children,
}: {
  title: string;
  collapsible?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!collapsible);
  const id = useId();
  return (
    <section className="not-prose my-5 rounded-md border border-border">
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold"
        >
          <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} aria-hidden="true" />
          {title}
        </button>
      ) : (
        <h4 className="px-4 py-3 text-sm font-semibold">{title}</h4>
      )}
      <div id={id} hidden={!open} className="divide-y divide-border border-t border-border">
        {children}
      </div>
    </section>
  );
}
