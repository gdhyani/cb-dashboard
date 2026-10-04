import type { ReactNode } from "react";
import { CopyCommand } from "./copy-command";

/** FR-UI-005: empty states can show copyable CLI commands. */
export function EmptyState({
  title,
  description,
  commands,
  action,
}: {
  title: string;
  description?: ReactNode;
  commands?: string[];
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border p-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      {commands && commands.length > 0 && (
        <div className="flex w-full max-w-md flex-col gap-2">
          {commands.map((c) => (
            <CopyCommand key={c} command={c} />
          ))}
        </div>
      )}
      {action}
    </div>
  );
}
