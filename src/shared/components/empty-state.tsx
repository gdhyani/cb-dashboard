import type { ReactNode } from "react";
import { CopyCommand } from "./copy-command";

/** FR-UI-005: an empty screen is an invitation to act — headline, one line of direction, commands or an action. */
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
    <div className="flex flex-col items-start gap-5 rounded-lg border border-dashed border-border-strong px-5 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-col gap-1.5">
        <p className="text-title font-semibold">{title}</p>
        {description && <div className="max-w-md text-sm text-muted-foreground">{description}</div>}
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
