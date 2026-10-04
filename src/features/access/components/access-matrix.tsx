"use client";

import { BadgeLabel } from "@/shared/components/badge-label";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { QueryState } from "@/shared/components/query-state";
import { timeUntil } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import { GrantDialog } from "./grant-dialog";

/** J4/J7: members × environments. Grant, grant temporarily, revoke. Owners/admins have implicit access. */
export function AccessMatrix({ projectId }: { projectId: string }) {
  const matrix = useAccessMatrix(projectId);
  const { grant, revoke } = useAccessMutations(projectId);
  const data = matrix.data;
  return (
    <QueryState isPending={matrix.isPending} error={matrix.error}>
      {data && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                {data.environments.map((e) => (
                  <TableHead key={e.id} className="font-mono">
                    {e.name} {e.killed && <BadgeLabel tone="warning">off</BadgeLabel>}
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
                  {data.environments.map((e) => {
                    if (m.role !== "developer") {
                      return (
                        <TableCell key={e.id}>
                          <BadgeLabel tone="muted">{`Inherited · ${m.role}`}</BadgeLabel>
                        </TableCell>
                      );
                    }
                    const g = data.grants.find((x) => x.userId === m.userId && x.environmentId === e.id);
                    return (
                      <TableCell key={e.id}>
                        {g ? (
                          <div className="flex items-center gap-2">
                            <BadgeLabel tone="strong">
                              {g.expiresAt ? `Expires ${timeUntil(g.expiresAt)}` : "Granted"}
                            </BadgeLabel>
                            <ConfirmDialog
                              trigger={
                                <Button size="xs" variant="ghost">
                                  Revoke
                                </Button>
                              }
                              title={`Revoke ${m.name}'s access to ${e.name}?`}
                              description="Takes effect within seconds. Active database and API connections are terminated and new sessions are refused."
                              confirmLabel="Revoke access"
                              onConfirm={() => revoke.mutateAsync(g.id)}
                            />
                          </div>
                        ) : (
                          <GrantDialog
                            title={`Grant ${m.name} access to ${e.name}`}
                            trigger={
                              <Button size="xs" variant="outline">
                                Grant access
                              </Button>
                            }
                            onGrant={(expiresAt) => grant.mutateAsync({ envId: e.id, userId: m.userId, expiresAt })}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </QueryState>
  );
}
