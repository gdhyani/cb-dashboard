"use client";

import { ChevronDown, Pencil, ShieldOff } from "lucide-react";
import { useState } from "react";
import type { Member } from "@/features/members/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import {
  admins,
  developersWithoutAccess,
  expiryLabel,
  type PersonAccess,
  peopleWithAccess,
  profileCount,
  scopeLabel,
  toInput,
} from "../lib/people";
import { AccessDialog } from "./access-dialog";

/** J4/J7: who can run this project locally — only people with access, plus a collapsed admins line. */
export function ProjectAccess({ projectId, projectName }: { projectId: string; projectName: string }) {
  const matrix = useAccessMatrix(projectId);
  const { removeAccess } = useAccessMutations(projectId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PersonAccess | null>(null);
  const [showAdmins, setShowAdmins] = useState(false);
  const data = matrix.data;
  const people = data ? peopleWithAccess(data) : [];
  const adminList: Member[] = data ? admins(data) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {data ? `${people.length} ${people.length === 1 ? "person has" : "people have"} access` : " "}
        </p>
        <Button onClick={() => setAdding(true)} disabled={!data}>
          Add people
        </Button>
      </div>
      <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={2} />}>
        {data && (
          <div className="overflow-hidden rounded-lg border border-border">
            {people.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="No developers have access yet"
                  description="Add people to let them run this project locally, across all environments or just some."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {people.map((p, i) => (
                  <StaggerItem key={p.member.userId} index={i} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                    <AvatarInitials name={p.member.name} />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                      <span className="min-w-0 sm:w-44 sm:shrink-0">
                        <span className="block truncate text-sm font-medium">{p.member.name}</span>
                        <span className="block truncate font-mono text-xs text-subtle">{p.member.email}</span>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className={cn("truncate", p.projectGrant ? "text-foreground" : "font-mono")}>
                          {scopeLabel(p, data)}
                        </span>
                        <span className="text-subtle">{expiryLabel(p)}</span>
                        {profileCount(p) > 0 && (
                          <BadgeLabel tone="muted">{`${profileCount(p)} profile${profileCount(p) > 1 ? "s" : ""}`}</BadgeLabel>
                        )}
                      </span>
                    </div>
                    <RowActions
                      label={`Access actions for ${p.member.name}`}
                      actions={[
                        { label: "Edit access", icon: Pencil, onSelect: () => setEditing(p) },
                        {
                          label: "Remove access",
                          icon: ShieldOff,
                          destructive: true,
                          confirm: {
                            title: `Remove ${p.member.name}'s access to ${projectName}?`,
                            description:
                              "Takes effect within seconds: active database and API connections are terminated and new sessions are refused.",
                            confirmLabel: "Remove access",
                            onConfirm: () => removeAccess.mutateAsync(p.member.userId),
                          },
                        },
                      ]}
                    />
                  </StaggerItem>
                ))}
              </ul>
            )}
            {adminList.length > 0 && (
              <div className="border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAdmins((v) => !v)}
                  aria-expanded={showAdmins}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs text-subtle hover:text-muted-foreground sm:px-4"
                >
                  <span>Owners and admins ({adminList.length}) have access to everything</span>
                  <ChevronDown className={cn("size-4 transition-transform", showAdmins && "rotate-180")} />
                </button>
                {showAdmins && (
                  <ul className="divide-y divide-border border-t border-border">
                    {adminList.map((m) => (
                      <li key={m.userId} className="flex items-center gap-3 px-3 py-2 sm:px-4">
                        <AvatarInitials name={m.name} />
                        <span className="min-w-0 flex-1 truncate text-sm">{m.name}</span>
                        <span className="font-mono text-xs text-subtle">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </QueryState>
      {data && adding && (
        <AccessDialog
          open
          onOpenChange={setAdding}
          projectId={projectId}
          projectName={projectName}
          matrix={data}
          candidates={developersWithoutAccess(data)}
          initial={toInput(undefined)}
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
    </div>
  );
}
