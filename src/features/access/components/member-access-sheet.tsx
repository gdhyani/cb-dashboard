"use client";

import { ShieldOff } from "lucide-react";
import Link from "next/link";
import type { Member } from "@/features/members/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeUntil } from "@/shared/lib/format-time";
import { Sheet, SheetContent, SheetTitle } from "@/shared/ui/sheet";
import { useAccessMutations, useMemberAccess } from "../hooks/use-access";

function RevokeProject({ projectId, member, projectName }: { projectId: string; member: Member; projectName: string }) {
  const { removeAccess } = useAccessMutations(projectId);
  return (
    <RowActions
      label={`Access actions for ${projectName}`}
      actions={[
        {
          label: `Remove access to ${projectName}`,
          icon: ShieldOff,
          destructive: true,
          confirm: {
            title: `Remove ${member.name}'s access to ${projectName}?`,
            description: "Takes effect within seconds: their active connections to this project are terminated.",
            confirmLabel: "Remove access",
            onConfirm: () => removeAccess.mutateAsync(member.userId),
          },
        },
      ]}
    />
  );
}

/** Everything one person can reach, grouped by project — the place to look when someone changes role or leaves. */
export function MemberAccessSheet({
  orgId,
  member,
  onClose,
}: {
  orgId: string;
  member: Member | null;
  onClose: () => void;
}) {
  const access = useMemberAccess(orgId, member?.role === "developer" ? member.userId : undefined);
  return (
    <Sheet open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[26rem] max-w-[92vw]">
        <SheetTitle>{member ? `${member.name}'s access` : "Access"}</SheetTitle>
        {member && (
          <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 pt-4">
            <div className="flex items-center gap-3 pr-8">
              <AvatarInitials name={member.name} />
              <div className="min-w-0">
                <p className="truncate font-medium">{member.name}</p>
                <p className="truncate font-mono text-xs text-subtle">{member.email}</p>
              </div>
              <BadgeLabel tone={member.role === "developer" ? "default" : "strong"}>{member.role}</BadgeLabel>
            </div>
            {member.role !== "developer" ? (
              <p className="text-sm text-muted-foreground">
                As {member.role === "owner" ? "an owner" : "an admin"}, {member.name} has access to every project and
                environment.
              </p>
            ) : (
              <QueryState isPending={access.isPending} error={access.error} skeleton={<SkeletonRows rows={2} />}>
                {access.data?.projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No project access yet. Grant it from a project&apos;s Access section.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {access.data?.projects.map((p, i) => (
                      <StaggerItem key={p.projectId} index={i} className="rounded-lg border border-border">
                        <div className="flex items-center gap-2 border-b border-border py-1.5 pr-1.5 pl-3">
                          <Link
                            href={`/orgs/${orgId}/projects/${p.projectId}`}
                            onClick={onClose}
                            className="min-w-0 flex-1 truncate text-sm font-medium hover:underline"
                          >
                            {p.projectName}
                          </Link>
                          <RevokeProject projectId={p.projectId} member={member} projectName={p.projectName} />
                        </div>
                        <ul className="divide-y divide-border">
                          {p.grants.map((g) => (
                            <li key={g.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
                              <span className={g.scope === "project" ? "text-foreground" : "font-mono"}>
                                {g.scope === "project" ? "All environments" : g.environmentName}
                              </span>
                              <span className="text-subtle">
                                {g.expiresAt ? `Expires ${timeUntil(g.expiresAt)}` : "No expiry"}
                                {g.resourceProfiles.length > 0 && ` · ${g.resourceProfiles.length} profile(s)`}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </StaggerItem>
                    ))}
                  </ul>
                )}
              </QueryState>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
