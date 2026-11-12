"use client";

import { ShieldCheck } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { RowActions } from "@/shared/components/row-actions";
import { timeAgo } from "@/shared/lib/format-time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useStopMutations } from "../hooks/use-emergency-stop";
import type { EmergencyStop } from "../types";

export const SCOPE_LABEL: Record<EmergencyStop["scope"], string> = {
  org: "Everyone",
  environment: "Environment",
  resource: "Service",
  user: "Person",
  device: "Device",
};

/** Active stops (with "Restore access" in the row menu) or restored ones (history). */
export function StopsTable({
  orgId,
  stops,
  history = false,
}: {
  orgId: string;
  stops: EmergencyStop[];
  history?: boolean;
}) {
  const { clear } = useStopMutations(orgId);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target</TableHead>
          <TableHead>Scope</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>{history ? "Restored" : "Stopped"}</TableHead>
          {!history && (
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {stops.map((stop) => (
          <TableRow key={stop.id}>
            <TableCell className="max-w-56 truncate whitespace-nowrap text-foreground">{stop.targetLabel}</TableCell>
            <TableCell>
              <BadgeLabel tone={history ? "muted" : "warning"}>{SCOPE_LABEL[stop.scope]}</BadgeLabel>
            </TableCell>
            <TableCell className="max-w-72 truncate text-foreground-light" title={stop.reason}>
              {stop.reason}
            </TableCell>
            <TableCell className="whitespace-nowrap text-foreground-lighter">
              {timeAgo(history ? stop.clearedAt : stop.createdAt)}
            </TableCell>
            {!history && (
              <TableCell className="w-12 text-right">
                <RowActions
                  label={`Actions for the stop on ${stop.targetLabel}`}
                  actions={[
                    {
                      label: "Restore access",
                      icon: ShieldCheck,
                      confirm: {
                        title: `Restore access for ${stop.targetLabel}?`,
                        description: "People with access can connect again; running apps reconnect automatically.",
                        confirmLabel: "Restore access",
                        destructive: false,
                        onConfirm: () => clear.mutateAsync(stop.id),
                      },
                    },
                  ]}
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
