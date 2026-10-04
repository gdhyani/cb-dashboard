"use client";

import { UserMinus } from "lucide-react";
import type { Role } from "@/features/auth/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeAgo } from "@/shared/lib/format-time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useMemberMutations, useMembers } from "../hooks/use-members";

const ROLES: Role[] = ["owner", "admin", "developer"];

/** People list: identity takes the flexible space; role, joined and actions keep a fixed width. */
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
    <QueryState isPending={members.isPending} error={members.error} skeleton={<SkeletonRows rows={2} />}>
      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {members.data?.map((m, i) => {
          const editable = canManage && (isOwner || m.role !== "owner");
          const removable = editable && m.userId !== currentUserId;
          return (
            <StaggerItem key={m.userId} index={i} className="flex items-start gap-3 px-3 py-3 sm:items-center sm:px-4">
              <AvatarInitials name={m.name} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {m.name} {m.userId === currentUserId && <span className="font-normal text-subtle">(you)</span>}
                </span>
                <span className="truncate font-mono text-xs text-subtle">{m.email}</span>
                {/* Phones: role and joined on their own line so the name keeps the full width. */}
                <div className="mt-2 flex items-center gap-3 sm:hidden">
                  {editable ? (
                    <Select
                      value={m.role}
                      onValueChange={(role) => updateRole.mutate({ userId: m.userId, role: role as Role })}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs" aria-label={`Role for ${m.name}`}>
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
                  <span className="min-w-0 truncate whitespace-nowrap font-mono text-[11px] text-subtle">
                    joined {timeAgo(m.joinedAt)}
                  </span>
                </div>
              </div>
              <span className="hidden w-28 shrink-0 text-right font-mono text-xs text-subtle sm:block">
                joined {timeAgo(m.joinedAt)}
              </span>
              <div className="hidden w-32 shrink-0 justify-end sm:flex">
                {editable ? (
                  <Select
                    value={m.role}
                    onValueChange={(role) => updateRole.mutate({ userId: m.userId, role: role as Role })}
                  >
                    <SelectTrigger className="h-8 w-full text-xs sm:text-sm" aria-label={`Role for ${m.name}`}>
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
              </div>
              {canManage && (
                <div className="flex w-8 shrink-0 justify-end">
                  {removable && (
                    <RowActions
                      label={`Actions for ${m.name}`}
                      actions={[
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
                      ]}
                    />
                  )}
                </div>
              )}
            </StaggerItem>
          );
        })}
      </ul>
    </QueryState>
  );
}
