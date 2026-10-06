import type { ReactNode } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";

/** One form field inside <Fields>: name, type, default and what it does. */
export function Field({
  name,
  type,
  default: def,
  required = false,
  children,
}: {
  name: string;
  type?: string;
  default?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-medium">{name}</span>
        {type && <BadgeLabel tone="default">{type}</BadgeLabel>}
        {required && <BadgeLabel tone="danger">Required</BadgeLabel>}
        {def && <BadgeLabel tone="muted">{`Default: ${def}`}</BadgeLabel>}
      </div>
      <div className="text-sm leading-relaxed text-[#c8c8c8] [&_code]:rounded [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:font-mono [&_p]:my-0">
        {children}
      </div>
    </div>
  );
}
