"use client";

import { Ban, Trash2 } from "lucide-react";

import { CLI_COMMANDS } from "@/constants";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { timeAgo } from "@/shared/lib/format-time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useMyDevices, useOrgDevices, useRevokeDevice } from "../hooks/use-devices";
import type { Device } from "../types";

function DeviceRows({ devices, showOwner }: { devices: Device[]; showOwner: boolean }) {
  const revoke = useRevokeDevice();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Device</TableHead>
          {showOwner && <TableHead>Owner</TableHead>}
          <TableHead>Last seen</TableHead>
          <TableHead className="w-24" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {devices.map((d) => (
          <TableRow key={d.id}>
            <TableCell>
              <span className="font-medium">{d.name}</span> <BadgeLabel tone="muted">{d.os}</BadgeLabel>
            </TableCell>
            {showOwner && <TableCell className="text-muted-foreground">{d.user.name}</TableCell>}
            <TableCell className="font-mono text-xs text-subtle">{timeAgo(d.lastSeenAt)}</TableCell>
            <TableCell className="text-right">
              <RowActions
                label={`Actions for ${d.name}`}
                actions={[
                  {
                    label: "Revoke device",
                    icon: Ban,
                    destructive: true,
                    confirm: {
                      title: `Revoke ${d.name}?`,
                      description:
                        "Its token stops working immediately and every open connection from this device is closed.",
                      confirmLabel: "Revoke device",
                      onConfirm: () => revoke.mutateAsync(d.id),
                    },
                  },
                ]}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function DevicesTable({ scope, orgId }: { scope: "mine" | "org"; orgId?: string }) {
  const mine = useMyDevices();
  const org = useOrgDevices(orgId ?? "", scope === "org" && Boolean(orgId));
  const query = scope === "mine" ? mine : org;
  return (
    <QueryState isPending={query.isPending} error={query.error}>
      {query.data && query.data.length > 0 ? (
        <DeviceRows devices={query.data} showOwner={scope === "org"} />
      ) : (
        <EmptyState
          title="No logged-in devices"
          description="Log in from a terminal to connect a device."
          commands={[CLI_COMMANDS.login]}
        />
      )}
    </QueryState>
  );
}
