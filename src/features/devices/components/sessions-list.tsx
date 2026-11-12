"use client";

import { LogOut, Monitor } from "lucide-react";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { timeAgo, timeUntil } from "@/shared/lib/format-time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeadSort, TableRow } from "@/shared/ui/table";
import { useOrgSessions, useRevokeSession } from "../hooks/use-devices";
import { browserName, describeBrowser, sessionFilters, sessionSearchFields, sessionSorters } from "../lib/device-query";

/** Dashboard sign-ins across members; admins can sign any of them out (behind a confirmation). */
export function SessionsList({ orgId }: { orgId: string }) {
  const sessions = useOrgSessions(orgId);
  const revoke = useRevokeSession(orgId);
  const q = useTableQuery({
    rows: sessions.data,
    fields: sessionSearchFields,
    filters: sessionFilters,
    sorters: sessionSorters,
    initialSort: { key: "active" as keyof typeof sessionSorters, dir: "desc" },
  });
  const browsers = [...new Set((sessions.data ?? []).map((s) => browserName(s.userAgent)))].sort();
  const sortHead = (key: keyof typeof sessionSorters, label: string, className?: string) => (
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
    <QueryState isPending={sessions.isPending} error={sessions.error} skeleton={<SkeletonRows rows={2} />}>
      {sessions.data?.length === 0 ? (
        <EmptyState
          icon={<Monitor strokeWidth={1.5} />}
          title="No active sessions"
          description="Browsers appear here when members sign in to the dashboard"
        />
      ) : (
        <div className="flex flex-col gap-3">
          <TableToolbar
            search={q.search}
            onSearch={q.setSearch}
            placeholder="Search browsers or people…"
            count={q.rows.length}
            total={q.total}
            noun="session"
            onClear={q.clear}
            filters={
              browsers.length > 1 && (
                <Select value={q.filter("browser")} onValueChange={(v) => q.setFilter("browser", v)}>
                  <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by browser">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All browsers</SelectItem>
                    {browsers.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }
          />
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Browser</TableHead>
                {sortHead("user", "User")}
                {sortHead("active", "Last active", "w-36")}
                <TableHead className="w-36">Expires</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="text-foreground-lighter">
                    No sessions match your filters
                  </TableCell>
                </TableRow>
              ) : (
                q.rows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <span className="flex min-w-0 items-center gap-3">
                        <Monitor
                          className="size-5 shrink-0 text-foreground-lighter"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span className="truncate text-foreground">{describeBrowser(s.userAgent)}</span>
                        {s.current && <BadgeLabel tone="strong">This browser</BadgeLabel>}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{s.user.name || s.user.email}</span>
                        {s.user.name && (
                          <span className="truncate text-xs text-foreground-lighter">{s.user.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground-lighter">
                      {timeAgo(s.lastSeenAt ?? s.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground-lighter">
                      {timeUntil(s.expiresAt)}
                    </TableCell>
                    <TableCell className="py-0 text-right">
                      {!s.current && (
                        <RowActions
                          label={`Actions for ${s.user.email}'s session`}
                          actions={[
                            {
                              label: "Sign out",
                              icon: LogOut,
                              destructive: true,
                              confirm: {
                                title: `Sign ${s.user.name || s.user.email} out of this browser?`,
                                description:
                                  "They have to sign in again in that browser. CLI devices are not affected.",
                                confirmLabel: "Sign out",
                                onConfirm: () => revoke.mutateAsync(s.id),
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
      )}
    </QueryState>
  );
}
