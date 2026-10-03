"use client";

import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Button } from "@/shared/ui/button";
import { useEnvironmentMutations } from "../hooks/use-environment";
import type { Environment } from "../types";

/** J7 kill switch at environment scope: typed reason required (FR-UI-002). */
export function KillSwitch({ env }: { env: Environment }) {
  const { kill, revive } = useEnvironmentMutations(env.id);
  if (env.killed) {
    return (
      <ConfirmDialog
        trigger={<Button variant="outline">Re-enable environment</Button>}
        title={`Re-enable ${env.name}?`}
        description="Developers with access can connect again."
        confirmLabel="Re-enable"
        destructive={false}
        onConfirm={() => revive.mutateAsync()}
      />
    );
  }
  return (
    <ConfirmDialog
      trigger={<Button variant="destructive">Kill switch</Button>}
      title={`Disable ${env.name} for everyone?`}
      description="Every tunnel into this environment closes within seconds and `cb run` refuses to start until you re-enable it."
      confirmLabel="Disable environment"
      requireReason
      onConfirm={(reason) => kill.mutateAsync(reason)}
    />
  );
}
