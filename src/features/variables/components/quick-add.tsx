"use client";

import { QUICK_ADD, type TypeId } from "../lib/catalog";
import { ServiceLogo } from "./service-logo";

/** D4: one row of shortcuts above the table; a badge only sets the type (and provider) of the Add dialog. */
export function QuickAdd({ onPick }: { onPick: (type: TypeId, provider?: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Quick add</span>
      <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {QUICK_ADD.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onPick(q.type, q.provider)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-card py-1 pr-3 pl-1 text-xs whitespace-nowrap transition-colors hover:border-foreground/60"
          >
            <ServiceLogo icon={q.icon} />
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
