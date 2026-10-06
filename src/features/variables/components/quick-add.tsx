"use client";

import { QUICK_ADD, type TypeId } from "../lib/catalog";
import { logoColor, ServiceLogo } from "./service-logo";

/** D4: one row of shortcuts above the table; a badge only sets the type (and provider) of the Add dialog. */
export function QuickAdd({ onPick }: { onPick: (type: TypeId, provider?: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">Quick add</span>
      <div className="flex min-w-0 flex-nowrap gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {QUICK_ADD.map((q) => {
          const color = logoColor(q.icon);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onPick(q.type, q.provider)}
              // Boxy like the rest of the UI, tinted with the brand colour (neutral when there is none).
              style={
                color
                  ? {
                      borderColor: `color-mix(in srgb, ${color} 35%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
                    }
                  : undefined
              }
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-card py-1 pr-3 pl-1 text-xs whitespace-nowrap transition-[filter,border-color] hover:border-foreground/60 hover:brightness-125"
            >
              <ServiceLogo icon={q.icon} />
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
