"use client";

import { Ban, Laptop } from "lucide-react";
import { CLI_COMMANDS } from "@/constants";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { timeAgo } from "@/shared/lib/format-time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeadSort, TableRow } from "@/shared/ui/table";
import { useMyDevices, useOrgDevices, useRevokeDevice } from "../hooks/use-devices";
import { deviceFilters, deviceSearchFields, deviceSorters } from "../lib/device-query";
import type { Device } from "../types";

function AgentStatus({ device }: { device: Device }) {
  const { agent } = device;
  return (
    <span
      className="inline-flex items-center gap-2 whitespace-nowrap"
      title={agent.seenAt ? `Last heartbeat ${timeAgo(agent.seenAt)}` : "No heartbeat yet"}
    >
      <BadgeLabel tone={agent.online ? "success" : "muted"} dot>
        {agent.online ? "Running" : "Stopped"}
      </BadgeLabel>
      {agent.online && agent.activeTunnels > 0 && (
        <span className="text-xs text-foreground-lighter">{agent.activeTunnels} open</span>
      )}
    </span>
  );
}

function DeviceTableView({ devices, showOwner }: { devices: Device[]; showOwner: boolean }) {
  const revoke = useRevokeDevice();
  const q = useTableQuery({
    rows: devices,
    fields: deviceSearchFields,
    filters: deviceFilters,
    sorters: deviceSorters,
    initialSort: { key: "seen" as keyof typeof deviceSorters, dir: "desc" },
  });
  const hasRevoked = devices.some((d) => d.revoked);
  const columns = showOwner ? 5 : 4;
  const sortHead = (key: keyof typeof deviceSorters, label: string, className?: string) => (
    <TableHeadSort
      className={className}
      active={q.sort?.key === key}
      dir={q.sort?.dir}
      onSort={() => q.toggleSort(key)}
    >
      {label}
    </TableHeadSort>
  );

  return (
    <div className="flex flex-col gap-3">
      {showOwner && (
        <TableToolbar
          search={q.search}
          onSearch={q.setSearch}
          placeholder="Search devices or people…"
          count={q.rows.length}
          total={q.total}
          noun="device"
          onClear={q.clear}
          filters={
            <>
              <Select value={q.filter("agent")} onValueChange={(v) => q.setFilter("agent", v)}>
                <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by agent status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any agent status</SelectItem>
                  <SelectItem value="running">Agent running</SelectItem>
                  <SelectItem value="stopped">Agent stopped</SelectItem>
                </SelectContent>
              </Select>
              {hasRevoked && (
                <Select value={q.filter("status")} onValueChange={(v) => q.setFilter("status", v)}>
                  <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by device status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Active and revoked</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </>
          }
        />
      )}
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            {sortHead("name", "Device")}
            {showOwner && sortHead("user", "User")}
            <TableHead className="w-44">Agent</TableHead>
            {sortHead("seen", "Last seen", "w-36")}
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {q.rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns} className="text-foreground-lighter">
                No devices match your filters
              </TableCell>
            </TableRow>
          ) : (
            q.rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-3">
                    <Laptop className="size-5 shrink-0 text-foreground-lighter" strokeWidth={1.5} aria-hidden="true" />
                    <div className="flex min-w-0 flex-col">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-foreground">{d.name}</span>
                        {d.revoked && <BadgeLabel tone="danger">Revoked</BadgeLabel>}
                      </span>
                      <span className="truncate text-xs text-foreground-lighter">
                        {[d.os, d.agent.version && `agent ${d.agent.version}`].filter(Boolean).join(" · ")}
                      </span>
                    </div>
                  </div>
                </TableCell>
                {showOwner && (
                  <TableCell>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{d.user.name}</span>
                      <span className="truncate text-xs text-foreground-lighter">{d.user.email}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <AgentStatus device={d} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-foreground-lighter">{timeAgo(d.lastSeenAt)}</TableCell>
                <TableCell className="py-0 text-right">
                  {!d.revoked && (
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
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

/** CLI devices: `org` lists every member's devices with a toolbar; `mine` lists the signed-in user's own. */
export function DevicesTable({ scope, orgId }: { scope: "mine" | "org"; orgId?: string }) {
  const mine = useMyDevices();
  const org = useOrgDevices(orgId ?? "", scope === "org" && Boolean(orgId));
  const query = scope === "mine" ? mine : org;
  return (
    <QueryState isPending={query.isPending} error={query.error} skeleton={<SkeletonRows rows={2} />}>
      {query.data && query.data.length > 0 ? (
        <DeviceTableView devices={query.data} showOwner={scope === "org"} />
      ) : (
        <EmptyState
          icon={<Laptop strokeWidth={1.5} />}
          title="No signed-in devices"
          description="Sign in from a terminal to connect a device"
          commands={[CLI_COMMANDS.login]}
        />
      )}
    </QueryState>
  );
}
