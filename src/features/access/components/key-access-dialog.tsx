"use client";

import { useProfiles } from "@/features/resources";
import { Admonition } from "@/shared/components/admonition";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonRows } from "@/shared/components/skeletons";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
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
      <DialogContent className="max-h-[90dvh] max-w-2xl">
        <DialogHeader className="sticky -top-5 z-10 bg-dialog">
          <DialogTitle>Who can use {keyName}</DialogTitle>
          <DialogDescription>Choose which login each person's app uses for this key</DialogDescription>
        </DialogHeader>
        <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={3} />}>
          {matrix.data && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead className="text-right">Login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins(matrix.data).map((m) => (
                  <TableRow key={m.userId}>
                    <TableCell className="py-2.5">
                      <span className="flex min-w-0 items-center gap-3">
                        <AvatarInitials name={m.name} size="sm" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-foreground">{m.name}</span>
                          <span className="block text-xs text-foreground-lighter">{m.role}</span>
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-xs text-foreground-lighter">
                      Always · default login
                    </TableCell>
                  </TableRow>
                ))}
                {environmentPeople(matrix.data, envId).map((p) => {
                  const current = p.grant.resourceProfiles.find((r) => r.resourceId === resourceId)?.profile ?? DEFAULT;
                  const person = peopleWithAccess(matrix.data).find((x) => x.member.userId === p.member.userId);
                  return (
                    <TableRow key={p.member.userId}>
                      <TableCell className="py-2.5">
                        <span className="flex min-w-0 items-center gap-3">
                          <AvatarInitials name={p.member.name} size="sm" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-foreground">{p.member.name}</span>
                            <span className="block text-xs text-foreground-lighter">
                              {person ? expiryLabel(person) : ""}
                            </span>
                          </span>
                        </span>
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <Select
                          value={current}
                          onValueChange={(v) => v && choose(p.member.userId, v)}
                          disabled={onlyDefault}
                        >
                          <SelectTrigger
                            className="ml-auto h-[28px] w-36 font-mono text-xs"
                            aria-label={`Login for ${p.member.name}`}
                          >
                            <SelectValue>{current}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {names.map((n) => (
                              <SelectItem key={n} value={n} className="font-mono">
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </QueryState>
        {onlyDefault && (
          <Admonition type="note">
            Everyone uses the default login. Add a read-only login in Edit → Read-only login to offer a second one.
          </Admonition>
        )}
        <DialogFooter className="sticky -bottom-5 z-10 bg-dialog sm:justify-between">
          <p className="text-xs text-foreground-lighter">Add or remove people on the Access tab.</p>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
