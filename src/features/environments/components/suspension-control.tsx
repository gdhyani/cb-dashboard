"use client";

import { useState } from "react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Card, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { useEnvironmentMutations } from "../hooks/use-environment";
import type { Environment } from "../types";

/**
 * Environment Settings › Suspension: one card row with the current status and an "Accept connections" switch.
 * Turning it off suspends the environment (typed reason, FR-UI-002); turning it on resumes it. Both confirm first.
 */
export function SuspensionControl({ env }: { env: Environment }) {
  const { kill, revive } = useEnvironmentMutations(env.id);
  const [pending, setPending] = useState<"suspend" | "resume" | null>(null);
  const switchId = `accept-connections-${env.id}`;
  return (
    <Card>
      {/* The switch stays on the right at every width (Studio setting rows). */}
      <CardContent className="flex items-start justify-between gap-4 md:gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor={switchId} className="leading-normal">
              Accept connections
            </Label>
            <BadgeLabel tone={env.killed ? "warning" : "success"} dot>
              {env.killed ? "Suspended" : "Active"}
            </BadgeLabel>
          </div>
          <p className="text-sm leading-normal text-foreground-lighter">
            {env.killed
              ? `Suspended: ${env.killedReason ?? "no reason given"}. Apps cannot reach its services until it is resumed`
              : "Apps and members with access can connect. Turn off to end every connection within seconds"}
          </p>
        </div>
        <Switch
          className="mt-0.5"
          id={switchId}
          checked={!env.killed}
          disabled={kill.isPending || revive.isPending}
          onCheckedChange={(checked) => setPending(checked ? "resume" : "suspend")}
        />
      </CardContent>
      <ConfirmDialog
        open={pending === "suspend"}
        onOpenChange={(open) => !open && setPending(null)}
        title={`Suspend ${env.name}?`}
        description="All active connections to this environment are terminated within seconds, and new sessions are refused until it is resumed."
        confirmLabel="Suspend environment"
        requireReason
        onConfirm={(reason) => kill.mutateAsync(reason)}
      />
      <ConfirmDialog
        open={pending === "resume"}
        onOpenChange={(open) => !open && setPending(null)}
        title={`Resume ${env.name}?`}
        description="Members with access can connect again. Running applications reconnect automatically."
        confirmLabel="Resume environment"
        destructive={false}
        onConfirm={() => revive.mutateAsync()}
      />
    </Card>
  );
}
