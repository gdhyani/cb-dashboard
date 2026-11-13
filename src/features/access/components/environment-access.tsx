"use client";

import { Eye, Pencil, ShieldOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { AccessPreviewSheet, type PreviewPerson } from "@/features/variables";
import { BadgeLabel } from "@/shared/components/badge-label";
import { DocsLink } from "@/shared/components/docs-link";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { Section } from "@/shared/components/section";
import { SkeletonRows } from "@/shared/components/skeletons";
import { StaggerBlock } from "@/shared/components/stagger";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { timeUntil } from "@/shared/lib/format-time";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useAccessMatrix, useAccessMutations } from "../hooks/use-access";
import { environmentPeople, type PersonAccess, peopleWithAccess, toInput } from "../lib/people";
import { personFields } from "../lib/search";
import type { ProjectAccessInput } from "../types";
import { AccessDialog } from "./access-dialog";
import { PersonCell } from "./person-cell";

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
  const query = useTableQuery({ rows: people, fields: personFields });
  const personOf = (userId: string) =>
    data ? peopleWithAccess(data).find((p) => p.member.userId === userId) : undefined;
  /** Adding from here grants this environment only. */
  const addInitial: ProjectAccessInput = {
    scope: "environments",
    environmentIds: [envId],
    expiresAt: null,
    resourceProfiles: [],
  };
  const addButton = (
    <Button size="sm" onClick={() => setAdding(true)} disabled={!data}>
      <UserPlus />
      Add people
    </Button>
  );

  return (
    <Section
      className="pt-0 md:pt-0"
      title="People with access"
      description={
        <>
          Developers who can run <span className="font-mono text-foreground">{envName}</span> locally. Owners and admins
          always can
        </>
      }
    >
      <QueryState isPending={matrix.isPending} error={matrix.error} skeleton={<SkeletonRows rows={2} />}>
        {people.length === 0 ? (
          <EmptyState
            title="No developers have access"
            description={`Add people to give them access to ${envName}`}
            action={
              <>
                {addButton}
                <DocsLink href="/docs/guides/admin/access">How access works</DocsLink>
              </>
            }
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
                    <TableHead>Access</TableHead>
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
                      <TableCell className="py-2.5">
                        <BadgeLabel tone={p.via === "project" ? "muted" : "strong"}>
                          {p.via === "project" ? "Via project access" : "This environment"}
                        </BadgeLabel>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs whitespace-nowrap text-foreground-lighter">
                        {p.grant.expiresAt ? `Expires ${timeUntil(p.grant.expiresAt)}` : "No expiry"}
                      </TableCell>
                      <TableCell className="py-2.5">
                        {p.grant.resourceProfiles.length > 0 ? (
                          <BadgeLabel tone="muted">{`${p.grant.resourceProfiles.length} profile${p.grant.resourceProfiles.length > 1 ? "s" : ""}`}</BadgeLabel>
                        ) : (
                          <span className="text-xs text-foreground-muted">Default</span>
                        )}
                      </TableCell>
                      <TableCell className="w-10 py-1.5 pr-2 pl-0 text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </StaggerBlock>
          </>
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
    </Section>
  );
}
