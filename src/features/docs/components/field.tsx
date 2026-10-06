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
    <div className="flex flex-col gap-1.5 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-medium">{name}</span>
        {type && <span className="font-mono text-xs text-subtle">{type}</span>}
        {required && <BadgeLabel tone="danger">Required</BadgeLabel>}
        {def && (
          <span className="text-xs text-subtle">
            Default <code className="font-mono">{def}</code>
          </span>
        )}
      </div>
      <div className="text-sm text-muted-foreground [&_code]:font-mono [&_p]:my-0">{children}</div>
    </div>
  );
}
