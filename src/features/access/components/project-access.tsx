"use client";

import { ChevronDown, Pencil, ShieldOff, UserPlus } from "lucide-react";
import { useState } from "react";
import type { Member } from "@/features/members/types";
import { AvatarInitials } from "@/shared/components/avatar-initials";
import { BadgeLabel } from "@/shared/components/badge-label";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerBlock } from "@/shared/components/stagger";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
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
import { personFields } from "../lib/search";
import { AccessDialog } from "./access-dialog";
import { PersonCell } from "./person-cell";

/** J4/J7: who can run this project locally — a Studio table of people with access, plus a collapsed admins line. */
export function ProjectAccess({ projectId, projectName }: { projectId: string; projectName: string }) {
  const matrix = useAccessMatrix(projectId);
  const { removeAccess } = useAccessMutations(projectId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<PersonAccess | null>(null);
  const [showAdmins, setShowAdmins] = useState(false);
  const data = matrix.data;
  const people = data ? peopleWithAccess(data) : [];
  const adminList: Member[] = data ? admins(data) : [];
  const query = useTableQuery({ rows: people, fields: personFields });

  const addButton = (
    <Button size="sm" onClick={() => setAdding(true)} disabled={!data}>
      <UserPlus />
      Add people
    </Button>
  );

  return (
    <div className="flex flex-col gap-3">
      <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={2} />}>
        {data &&
          (people.length === 0 ? (
            <EmptyState
              title="No developers have access yet"
              description="Add people to let them run this project locally, across all environments or just some"
              action={addButton}
            />
          ) : (
            <>
              <TableToolbar
                search={query.search}
                onSearch={query.setSearch}
                placeholder="Search people…"
                count={query.rows.length}
                total={query.total}
                noun="developer"
                onClear={query.clear}
                actions={addButton}
              />
              <StaggerBlock>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead>Environments</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Profiles</TableHead>
                      <TableHead className="w-10">
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.rows.length === 0 && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="py-6 text-center text-foreground-lighter">
                          No people match your search
                        </TableCell>
                      </TableRow>
                    )}
                    {query.rows.map((p) => (
                      <TableRow key={p.member.userId}>
                        <TableCell className="py-2.5">
                          <PersonCell member={p.member} />
                        </TableCell>
                        <TableCell className="max-w-[16rem] py-2.5">
                          <span
                            className={cn(
                              "block truncate text-xs",
                              p.projectGrant ? "text-foreground" : "font-mono text-foreground-light",
                            )}
                          >
                            {scopeLabel(p, data)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs whitespace-nowrap text-foreground-lighter">
                          {expiryLabel(p)}
                        </TableCell>
                        <TableCell className="py-2.5">
                          {profileCount(p) > 0 ? (
                            <BadgeLabel tone="muted">{`${profileCount(p)} profile${profileCount(p) > 1 ? "s" : ""}`}</BadgeLabel>
                          ) : (
                            <span className="text-xs text-foreground-muted">Default</span>
                          )}
                        </TableCell>
                        <TableCell className="w-10 py-1.5 pr-2 pl-0 text-right">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StaggerBlock>
            </>
          ))}
        {data && adminList.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-border bg-surface-100">
            <button
              type="button"
              onClick={() => setShowAdmins((v) => !v)}
              aria-expanded={showAdmins}
              className="focus-inset flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-xs text-foreground-lighter transition-colors hover:bg-surface-200 hover:text-foreground-light"
            >
              <span>Owners and admins ({adminList.length}) have access to everything</span>
              <ChevronDown
                strokeWidth={1.5}
                className={cn("size-4 transition-transform", showAdmins && "rotate-180")}
              />
            </button>
            {showAdmins && (
              <ul className="divide-y divide-border border-t border-border">
                {adminList.map((m) => (
                  <li key={m.userId} className="flex items-center gap-3 px-4 py-2">
                    <AvatarInitials name={m.name} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{m.name}</span>
                    <BadgeLabel tone="strong">{m.role}</BadgeLabel>
                  </li>
                ))}
              </ul>
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
