"use client";

import { Copy, PauseCircle } from "lucide-react";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { RowActions } from "@/shared/components/row-actions";
import { useCopy } from "@/shared/hooks/use-copy";
import { Button } from "@/shared/ui/button";
import { useEnvironmentMutations } from "../hooks/use-environment";
import type { Environment } from "../types";

/**
 * Environment header actions. Suspension is destructive, so it lives in the "…" menu with a required reason
 * (FR-UI-002); resuming is a plain button shown only while suspended.
 */
export function SuspensionControl({ env }: { env: Environment }) {
  const { kill, revive } = useEnvironmentMutations(env.id);
  const { copy } = useCopy("Environment ID copied");
  return (
    <div className="flex items-center gap-2">
      {env.killed && (
        <ConfirmDialog
          trigger={<Button variant="secondary">Resume environment</Button>}
          title={`Resume ${env.name}?`}
          description="Members with access can connect again. Running applications reconnect automatically."
          confirmLabel="Resume environment"
          destructive={false}
          onConfirm={() => revive.mutateAsync()}
        />
      )}
      <RowActions
        prominent
        label={`Actions for ${env.name}`}
        actions={[
          { label: "Copy environment ID", icon: Copy, onSelect: () => void copy(env.id) },
          ...(env.killed
            ? []
            : [
                {
                  label: "Suspend environment",
                  icon: PauseCircle,
                  destructive: true,
                  confirm: {
                    title: `Suspend ${env.name}?`,
                    description:
                      "All active connections to this environment are terminated within seconds, and new sessions are refused until it is resumed.",
                    confirmLabel: "Suspend environment",
                    requireReason: true,
                    onConfirm: (reason: string) => kill.mutateAsync(reason),
                  },
                },
              ]),
        ]}
      />
    </div>
  );
}
