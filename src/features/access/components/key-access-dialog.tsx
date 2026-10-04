"use client";

import { useProfiles } from "@/features/resources";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import { admins, environmentPeople, expiryLabel, peopleWithAccess, toInput } from "../lib/people";

const DEFAULT = "default";

/**
 * D10 "Who can use it": for one key's service, choose the login (credential profile) each person with this
 * environment gets. Granting or removing people stays on the Access tab.
 */
export function KeyAccessDialog({
  projectId,
  envId,
  resourceId,
  keyName,
  open,
  onOpenChange,
}: {
  projectId: string;
  envId: string;
  resourceId: string;
  keyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const matrix = useAccessMatrix(projectId, open);
  const profiles = useProfiles(resourceId);
  const { setAccess } = useAccessMutations(projectId);
  const names = profiles.data?.map((p) => p.name) ?? [DEFAULT];
  const onlyDefault = names.length < 2;

  function choose(userId: string, profile: string) {
    if (!matrix.data) return;
    const person = peopleWithAccess(matrix.data).find((p) => p.member.userId === userId);
    const base = toInput(person);
    const others = base.resourceProfiles.filter((r) => r.resourceId !== resourceId);
    setAccess.mutate({
      userId,
      body: { ...base, resourceProfiles: profile === DEFAULT ? others : [...others, { resourceId, profile }] },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Who can use {keyName}</DialogTitle>
          <DialogDescription>Choose which login each person's app uses for this key.</DialogDescription>
        </DialogHeader>
        <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={3} />}>
          {matrix.data && (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {admins(matrix.data).map((m) => (
                <li key={m.userId} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm">{m.name}</span>
                    <span className="text-xs text-subtle">{m.role}</span>
                  </span>
                  <span className="text-xs text-subtle">Always · default login</span>
                </li>
              ))}
              {environmentPeople(matrix.data, envId).map((p) => {
                const current = p.grant.resourceProfiles.find((r) => r.resourceId === resourceId)?.profile ?? DEFAULT;
                const person = peopleWithAccess(matrix.data).find((x) => x.member.userId === p.member.userId);
                return (
                  <li key={p.member.userId} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm">{p.member.name}</span>
                      <span className="text-xs text-subtle">{person ? expiryLabel(person) : ""}</span>
                    </span>
                    <Select
                      value={current}
                      onValueChange={(v) => v && choose(p.member.userId, v)}
                      disabled={onlyDefault}
                    >
                      <SelectTrigger className="w-40" aria-label={`Login for ${p.member.name}`}>
                        <SelectValue>{current}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {names.map((n) => (
                          <SelectItem key={n} value={n}>
                            {n}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </li>
                );
              })}
            </ul>
          )}
        </QueryState>
        {onlyDefault && (
          <p className="text-xs text-subtle">
            Everyone uses the default login. Add a read-only login in Edit → Read-only login to offer a second one.
          </p>
        )}
        <p className="text-xs text-subtle">Add or remove people on the Access tab.</p>
      </DialogContent>
    </Dialog>
  );
}
