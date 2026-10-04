"use client";

import { Eye, Pencil, ShieldOff } from "lucide-react";
import { useState } from "react";
import { AccessPreviewSheet, type PreviewPerson } from "@/features/variables";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeUntil } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import { environmentPeople, type PersonAccess, peopleWithAccess, toInput } from "../lib/people";
import type { ProjectAccessInput } from "../types";
import { AccessDialog } from "./access-dialog";

/** J4: who can use this environment, and whether that comes from project-wide or environment access. */
export function EnvironmentAccess({
  projectId,
  projectName,
  envId,
  envName,
}: {
  projectId: string;
  projectName: string;
  envId: string;
  envName: string;
}) {
  const matrix = useAccessMatrix(projectId);
  const { revoke } = useAccessMutations(projectId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PersonAccess | null>(null);
  const [previewing, setPreviewing] = useState<PreviewPerson | null>(null);
  const data = matrix.data;
  const people = data ? environmentPeople(data, envId) : [];
  const personOf = (userId: string) =>
    data ? peopleWithAccess(data).find((p) => p.member.userId === userId) : undefined;
  /** Adding from here grants this environment only. */
  const addInitial: ProjectAccessInput = {
    scope: "environments",
    environmentIds: [envId],
    expiresAt: null,
    resourceProfiles: [],
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Developers who can run <span className="font-mono text-foreground">{envName}</span> locally. Owners and admins
          always can.
        </p>
        <Button onClick={() => setAdding(true)} disabled={!data} className="shrink-0">
          Add people
        </Button>
      </div>
      <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={2} />}>
        {people.length === 0 ? (
          <EmptyState title="No developers have access" description={`Add people to give them access to ${envName}.`} />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {people.map((p, i) => (
              <StaggerItem key={p.member.userId} index={i} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                <AvatarInitials name={p.member.name} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium">{p.member.name}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                    <BadgeLabel tone={p.via === "project" ? "muted" : "strong"}>
                      {p.via === "project" ? "Via project access" : "This environment"}
                    </BadgeLabel>
                    {p.grant.expiresAt ? `Expires ${timeUntil(p.grant.expiresAt)}` : "No expiry"}
                    {p.grant.resourceProfiles.length > 0 && (
                      <span>{`${p.grant.resourceProfiles.length} profile(s)`}</span>
                    )}
                  </span>
                </div>
                <RowActions
                  label={`Access actions for ${p.member.name}`}
                  actions={[
                    {
                      label: "Preview access",
                      icon: Eye,
                      onSelect: () => setPreviewing({ userId: p.member.userId, name: p.member.name }),
                    },
                    {
                      label: p.via === "project" ? "Edit project access" : "Edit access",
                      icon: Pencil,
                      onSelect: () => {
                        const person = personOf(p.member.userId);
                        if (person) setEditing(person);
                      },
                    },
                    ...(p.via === "environment"
                      ? [
                          {
                            label: `Revoke access to ${envName}`,
                            icon: ShieldOff,
                            destructive: true,
                            confirm: {
                              title: `Revoke ${p.member.name}'s access to ${envName}?`,
                              description:
                                "Takes effect within seconds: active connections to this environment are terminated. Access to other environments is unchanged.",
                              confirmLabel: "Revoke access",
                              onConfirm: () => revoke.mutateAsync(p.grant.id),
                            },
                          },
                        ]
                      : []),
                  ]}
                />
              </StaggerItem>
            ))}
          </ul>
        )}
      </QueryState>
      {data && adding && (
        <AccessDialog
          open
          onOpenChange={setAdding}
          projectId={projectId}
          projectName={projectName}
          matrix={data}
          candidates={data.members.filter(
            (m) => m.role === "developer" && !people.some((p) => p.member.userId === m.userId),
          )}
          initial={addInitial}
          existingEnvironments={(userId) =>
            (personOf(userId)?.environmentGrants ?? []).map((g) => g.environmentId ?? "").filter(Boolean)
          }
        />
      )}
      {data && editing && (
        <AccessDialog
          open
          onOpenChange={(open) => !open && setEditing(null)}
          projectId={projectId}
          projectName={projectName}
          matrix={data}
          person={editing.member}
          initial={toInput(editing)}
        />
      )}
      <AccessPreviewSheet envId={envId} envName={envName} person={previewing} onClose={() => setPreviewing(null)} />
    </div>
  );
}
