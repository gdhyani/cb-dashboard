"use client";

import { ScrollRow } from "@/shared/components/scroll-row";
import { logoColor, ServiceLogo } from "@/shared/components/service-logo";
import { QUICK_ADD, type TypeId } from "../lib/catalog";

/** D4: one row of compact shortcuts above the table; a chip only sets the type (and provider) of the Add dialog. */
export function QuickAdd({ onPick }: { onPick: (type: TypeId, provider?: string) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="heading-meta shrink-0 text-foreground-lighter">Quick add</span>
      {/* No visible scrollbar: the edge with more shortcuts fades; wheel, trackpad and touch scroll it. */}
      <ScrollRow className="gap-1.5">
        {QUICK_ADD.map((q) => {
          const color = logoColor(q.icon);
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onPick(q.type, q.provider)}
              // Boxy Studio chip, tinted with the brand colour (neutral when there is none).
              style={
                color
                  ? {
                      borderColor: `color-mix(in srgb, ${color} 30%, var(--color-border-strong))`,
                      backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
                    }
                  : undefined
              }
              className="flex h-[26px] shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface-100 pr-2.5 pl-1 text-xs whitespace-nowrap text-foreground-light transition-[filter,color,border-color] hover:border-border-stronger hover:text-foreground hover:brightness-110"
            >
              <ServiceLogo icon={q.icon} />
              {q.label}
            </button>
          );
        })}
      </ScrollRow>
    </div>
  );
}
