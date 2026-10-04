"use client";

import { Ban, Laptop } from "lucide-react";
import { CLI_COMMANDS } from "@/constants";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { useMyDevices, useOrgDevices, useRevokeDevice } from "../hooks/use-devices";
import type { Device } from "../types";

function DeviceRows({ devices, showOwner }: { devices: Device[]; showOwner: boolean }) {
  const revoke = useRevokeDevice();
  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {devices.map((d, i) => (
        <StaggerItem key={d.id} index={i} className="flex items-center gap-3 px-3 py-3 sm:px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-strong bg-muted text-subtle">
            <Laptop className="size-4" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{d.name}</span>
            <span className="truncate font-mono text-xs text-subtle">
              {[showOwner ? d.user.name : null, d.os, `seen ${timeAgo(d.lastSeenAt)}`].filter(Boolean).join(" · ")}
            </span>
          </div>
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
        </StaggerItem>
      ))}
    </ul>
  );
}

export function DevicesTable({ scope, orgId }: { scope: "mine" | "org"; orgId?: string }) {
  const mine = useMyDevices();
  const org = useOrgDevices(orgId ?? "", scope === "org" && Boolean(orgId));
  const query = scope === "mine" ? mine : org;
  return (
    <QueryState isPending={query.isPending} error={query.error} skeleton={<SkeletonRows rows={2} />}>
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
