"use client";

import { KeyRound, UserMinus } from "lucide-react";
import type { Role } from "@/features/auth/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { timeAgo } from "@/shared/lib/format-time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableHeadSort, TableRow } from "@/shared/ui/table";
import { useMemberMutations, useMembers } from "../hooks/use-members";
import { memberFilters, memberSearchFields, memberSorters, ROLE_LABEL, ROLE_ORDER } from "../lib/member-query";
import type { Member } from "../types";

/** Studio Team table: search, role filter and sortable columns over the org's members. */
export function MembersTable({
  orgId,
  canManage,
  isOwner,
  currentUserId,
  onSelect,
}: {
  orgId: string;
  canManage: boolean;
  isOwner: boolean;
  currentUserId?: string;
  /** Opens the member's access panel. */
  onSelect?: (member: Member) => void;
}) {
  const members = useMembers(orgId);
  const { updateRole, remove } = useMemberMutations(orgId);
  const q = useTableQuery({
    rows: members.data,
    fields: memberSearchFields,
    filters: memberFilters,
    sorters: memberSorters,
    initialSort: { key: "name" as keyof typeof memberSorters, dir: "asc" },
  });
  const columns = canManage ? 4 : 3;
  const sortHead = (key: keyof typeof memberSorters, label: string, className?: string) => (
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
    <QueryState isPending={members.isPending} error={members.error} skeleton={<SkeletonRows rows={3} />}>
      <div className="flex flex-col gap-3">
        <TableToolbar
          search={q.search}
          onSearch={q.setSearch}
          placeholder="Search by name or email…"
          count={q.rows.length}
          total={q.total}
          noun="member"
          onClear={q.clear}
          filters={
            <Select value={q.filter("role")} onValueChange={(v) => q.setFilter("role", v)}>
              <SelectTrigger className="h-[28px] w-auto text-xs" aria-label="Filter by role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {ROLE_ORDER.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <Table className="min-w-[560px]">
          <TableHeader>
            <TableRow>
              {sortHead("name", "User")}
              {sortHead("role", "Role", "w-36")}
              {sortHead("joined", "Joined", "w-36")}
              {canManage && (
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {q.rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns} className="text-foreground-lighter">
                  No members match your search
                </TableCell>
              </TableRow>
            ) : (
              q.rows.map((m) => {
                const editable = canManage && (isOwner || m.role !== "owner");
                const removable = editable && m.userId !== currentUserId;
                const you = m.userId === currentUserId;
                return (
                  <TableRow key={m.userId}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-3">
                        <AvatarInitials name={m.name} />
                        <div className="flex min-w-0 flex-col">
                          {onSelect ? (
                            <button
                              type="button"
                              onClick={() => onSelect(m)}
                              className="truncate text-left text-foreground hover:underline"
                            >
                              {m.name} {you && <span className="text-foreground-lighter">(you)</span>}
                            </button>
                          ) : (
                            <span className="truncate text-foreground">
                              {m.name} {you && <span className="text-foreground-lighter">(you)</span>}
                            </span>
                          )}
                          <span className="truncate text-xs text-foreground-lighter">{m.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editable ? (
                        <Select
                          value={m.role}
                          onValueChange={(role) => updateRole.mutate({ userId: m.userId, role: role as Role })}
                        >
                          <SelectTrigger className="h-[28px] w-28 text-xs" aria-label={`Role for ${m.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_ORDER.filter((r) => isOwner || r !== "owner").map((r) => (
                              <SelectItem key={r} value={r}>
                                {ROLE_LABEL[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <BadgeLabel tone={m.role === "developer" ? "default" : "strong"}>
                          {ROLE_LABEL[m.role]}
                        </BadgeLabel>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-foreground-lighter">
                      <time dateTime={m.joinedAt} title={new Date(m.joinedAt).toLocaleString()}>
                        {timeAgo(m.joinedAt)}
                      </time>
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-0 text-right">
                        {(removable || onSelect) && (
                          <RowActions
                            label={`Actions for ${m.name}`}
                            actions={[
                              ...(onSelect
                                ? [{ label: "View access", icon: KeyRound, onSelect: () => onSelect(m) }]
                                : []),
                              ...(removable
                                ? [
                                    {
                                      label: "Remove member",
                                      icon: UserMinus,
                                      destructive: true,
                                      confirm: {
                                        title: `Remove ${m.name}?`,
                                        description:
                                          "They lose access to every project in this organization and their live connections are closed.",
                                        confirmLabel: "Remove member",
                                        onConfirm: () => remove.mutateAsync(m.userId),
                                      },
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </QueryState>
  );
}
