import { SquarePlus } from "lucide-react";
import type { ReactNode } from "react";
import { CopyCommand } from "./copy-command";

/**
 * FR-UI-005 / Supabase EmptyStatePresentational: dashed panel, a quiet icon, what is missing, how to add it, and the
 * action (commands to copy or a button).
 */
export function EmptyState({
  title,
  description,
  commands,
  action,
  icon,
}: {
  title: string;
  description?: ReactNode;
  commands?: string[];
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface-100 px-4 py-10 text-center">
      <span className="text-foreground-muted [&_svg]:size-6">{icon ?? <SquarePlus strokeWidth={1.5} />}</span>
      <div className="flex flex-col items-center gap-1">
        <h3 className="heading-default font-sans text-foreground">{title}</h3>
        {description && <div className="max-w-[640px] text-sm text-foreground-light">{description}</div>}
      </div>
      {commands && commands.length > 0 && (
        <div className="flex w-full max-w-md flex-col gap-2 text-left">
          {commands.map((c) => (
            <CopyCommand key={c} command={c} />
          ))}
        </div>
      )}
      {action && <div className="mt-1 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}
