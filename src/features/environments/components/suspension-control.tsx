"use client";

import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/ui/button";
import { useEnvironmentMutations } from "../hooks/use-environment";
import type { Environment } from "../types";

/** J7 environment suspension: stops all brokered access until resumed. A reason is required (FR-UI-002). */
export function SuspensionControl({ env }: { env: Environment }) {
  const { kill, revive } = useEnvironmentMutations(env.id);
  if (env.killed) {
    return (
      <ConfirmDialog
        trigger={<Button variant="secondary">Resume environment</Button>}
        title={`Resume ${env.name}?`}
        description="Members with access can connect again. Running applications reconnect automatically."
        confirmLabel="Resume environment"
        destructive={false}
        onConfirm={() => revive.mutateAsync()}
      />
    );
  }
  return (
    <ConfirmDialog
      trigger={<Button variant="destructive-ghost">Suspend environment</Button>}
      title={`Suspend ${env.name}?`}
      description="All active connections to this environment are terminated within seconds, and new sessions are refused until it is resumed."
      confirmLabel="Suspend environment"
      requireReason
      onConfirm={(reason) => kill.mutateAsync(reason)}
    />
  );
}
