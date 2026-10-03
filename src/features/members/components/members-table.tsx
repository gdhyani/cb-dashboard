"use client";

import type { Role } from "@/features/auth/types";
import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { QueryState } from "@/shared/components/query-state";
import { timeAgo } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useMemberMutations, useMembers } from "../hooks/use-members";

const ROLES: Role[] = ["owner", "admin", "developer"];

export function MembersTable({
  orgId,
  canManage,
  isOwner,
  currentUserId,
}: {
  orgId: string;
  canManage: boolean;
  isOwner: boolean;
  currentUserId?: string;
}) {
  const members = useMembers(orgId);
  const { updateRole, remove } = useMemberMutations(orgId);
  return (
    <QueryState isPending={members.isPending} error={members.error}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {canManage && <TableHead className="w-28" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.data?.map((m) => (
            <TableRow key={m.userId}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {m.name} {m.userId === currentUserId && <span className="text-subtle">(you)</span>}
                  </span>
                  <span className="font-mono text-xs text-subtle">{m.email}</span>
                </div>
              </TableCell>
              <TableCell>
                {canManage && (isOwner || m.role !== "owner") ? (
                  <Select
                    value={m.role}
                    onValueChange={(role) => updateRole.mutate({ userId: m.userId, role: role as Role })}
                  >
                    <SelectTrigger className="h-8 w-32" aria-label={`Role for ${m.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.filter((r) => isOwner || r !== "owner").map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <BadgeLabel tone={m.role === "developer" ? "default" : "strong"}>{m.role}</BadgeLabel>
                )}
              </TableCell>
              <TableCell className="font-mono text-xs text-subtle">{timeAgo(m.joinedAt)}</TableCell>
              {canManage && (
                <TableCell className="text-right">
                  {m.userId !== currentUserId && (isOwner || m.role !== "owner") && (
                    <ConfirmDialog
                      trigger={
                        <Button size="sm" variant="ghost">
                          Remove
                        </Button>
                      }
                      title={`Remove ${m.name}?`}
                      description="They lose access to every project in this organization and their live connections are closed."
                      confirmLabel="Remove member"
                      onConfirm={() => remove.mutateAsync(m.userId)}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </QueryState>
  );
}
