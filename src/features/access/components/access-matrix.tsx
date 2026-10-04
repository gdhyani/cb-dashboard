"use client";

import { KeyRound, ShieldOff } from "lucide-react";
import { useState } from "react";
import type { Member } from "@/features/members/types";
import { BadgeLabel } from "@/shared/components/badge-label";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { timeUntil } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import type { Grant, AccessMatrix as Matrix } from "../types";
import { GrantDialog } from "./grant-dialog";
import { GrantProfilesDialog } from "./grant-profiles-dialog";

type Env = Matrix["environments"][number];

/** One member × environment cell: inherited, granted (with a "…" menu) or a grant button. */
function AccessCell({ projectId, member, env, grant }: { projectId: string; member: Member; env: Env; grant?: Grant }) {
  const { grant: create, revoke, setProfiles } = useAccessMutations(projectId);
  const [profilesOpen, setProfilesOpen] = useState(false);
  if (member.role !== "developer") return <BadgeLabel tone="muted">{`Inherited · ${member.role}`}</BadgeLabel>;
  if (!grant)
    return (
      <GrantDialog
        title={`Grant ${member.name} access to ${env.name}`}
        trigger={
          <Button size="xs" variant="outline">
            Grant access
          </Button>
        }
        onGrant={(expiresAt) => create.mutateAsync({ envId: env.id, userId: member.userId, expiresAt })}
      />
    );
  const custom = grant.resourceProfiles.length;
  return (
    <div className="flex items-center gap-1.5">
      <BadgeLabel tone="strong">{grant.expiresAt ? `Expires ${timeUntil(grant.expiresAt)}` : "Granted"}</BadgeLabel>
      {custom > 0 && <BadgeLabel tone="muted">{`${custom} profile${custom > 1 ? "s" : ""}`}</BadgeLabel>}
      <RowActions
        label={`Access actions for ${member.name} in ${env.name}`}
        actions={[
          { label: "Credential profiles…", icon: KeyRound, onSelect: () => setProfilesOpen(true) },
          {
            label: "Revoke access",
            icon: ShieldOff,
            destructive: true,
            confirm: {
              title: `Revoke ${member.name}'s access to ${env.name}?`,
              description:
                "Takes effect within seconds. Active database and API connections are terminated and new sessions are refused.",
              confirmLabel: "Revoke access",
              onConfirm: () => revoke.mutateAsync(grant.id),
            },
          },
        ]}
      />
      {profilesOpen && (
        <GrantProfilesDialog
          open
          onOpenChange={setProfilesOpen}
          grant={grant}
          title={`Credential profiles for ${member.name} in ${env.name}`}
          pending={setProfiles.isPending}
          onSave={(resourceProfiles) => setProfiles.mutateAsync({ grantId: grant.id, resourceProfiles })}
        />
      )}
    </div>
  );
}

/** J4/J7: members × environments. Grant, grant temporarily, choose profiles, revoke. */
export function AccessMatrix({ projectId }: { projectId: string }) {
  const matrix = useAccessMatrix(projectId);
  const data = matrix.data;
  const grantOf = (m: Member, e: Env) => data?.grants.find((g) => g.userId === m.userId && g.environmentId === e.id);
  return (
    <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={3} />}>
      {data && (
        <>
          {/* Phones: one card per member, environments stacked. */}
          <ul className="flex flex-col gap-3 md:hidden">
            {data.members.map((m, i) => (
              <StaggerItem key={m.userId} index={i} className="rounded-lg border border-border">
                <div className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-3">
                  <span className="truncate font-medium">{m.name}</span>
                  <span className="shrink-0 font-mono text-xs text-subtle">{m.role}</span>
                </div>
                <ul className="divide-y divide-border">
                  {data.environments.map((e) => (
                    <li key={e.id} className="flex min-h-12 items-center justify-between gap-3 px-4 py-2">
                      <span className="flex items-center gap-2 font-mono text-sm">
                        {e.name}
                        {e.killed && <BadgeLabel tone="warning">Suspended</BadgeLabel>}
                      </span>
                      <AccessCell projectId={projectId} member={m} env={e} grant={grantOf(m, e)} />
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </ul>
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  {data.environments.map((e) => (
                    <TableHead key={e.id} className="font-mono">
                      <span className="flex items-center gap-2">
                        {e.name} {e.killed && <BadgeLabel tone="warning">Suspended</BadgeLabel>}
                      </span>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.members.map((m) => (
                  <TableRow key={m.userId}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="font-mono text-xs text-subtle">{m.role}</span>
                      </div>
                    </TableCell>
                    {data.environments.map((e) => (
                      <TableCell key={e.id}>
                        <AccessCell projectId={projectId} member={m} env={e} grant={grantOf(m, e)} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </QueryState>
  );
}
