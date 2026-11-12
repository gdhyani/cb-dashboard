"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { CLI_COMMANDS } from "@/constants";
import { useOrgStats } from "@/features/stats";
import { BadgeLabel } from "@/shared/components/badge-label";
import { DocsLink } from "@/shared/components/docs-link";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonCards } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { TableToolbar } from "@/shared/components/table-toolbar";
import { useTableQuery } from "@/shared/hooks/use-table-query";
import { useProjects } from "../hooks/use-projects";
import type { Project } from "../types";
import { CreateProjectDialog } from "./create-project-dialog";
import { environmentStatus } from "./environment-table";
import { ProjectMark } from "./project-mark";

const searchFields = (p: Project) => [p.name, p.slug, p.description, ...p.environments.map((e) => e.name)];
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** Studio project grid: a search toolbar with "New project" (admins), then one card per project. */
export function ProjectList({ orgId, isAdmin }: { orgId: string; isAdmin: boolean }) {
  const projects = useProjects(orgId);
  const stats = useOrgStats(orgId);
  const query = useTableQuery({ rows: projects.data, fields: searchFields });
  const connectionsOf = (id: string) => stats.data?.connectionsByProject.find((p) => p.projectId === id)?.connections;

  return (
    <QueryState isPending={projects.isPending} error={projects.error} skeleton={<SkeletonCards cards={3} />}>
      {query.total === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            isAdmin
              ? "Create a project, add its variables, then invite developers"
              : "An admin has not created any projects yet"
          }
          commands={[CLI_COMMANDS.login, CLI_COMMANDS.init]}
          action={
            <>
              {isAdmin && <CreateProjectDialog orgId={orgId} />}
              <DocsLink href="/docs/quick-start">Quick start guide</DocsLink>
            </>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <TableToolbar
            search={query.search}
            onSearch={query.setSearch}
            placeholder="Search for a project…"
            count={query.rows.length}
            total={query.total}
            noun="project"
            onClear={query.clear}
            actions={isAdmin && <CreateProjectDialog orgId={orgId} size="sm" />}
          />
          {query.rows.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface-100 px-4 py-6 text-center text-sm text-foreground-lighter">
              No projects match your search
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {query.rows.map((p, i) => {
                const connections = connectionsOf(p.id);
                return (
                  <StaggerItem key={p.id} index={i} className="min-w-0">
                    <Link
                      href={`/orgs/${orgId}/projects/${p.id}`}
                      className="group flex h-full min-h-[156px] flex-col gap-4 rounded-lg border border-border bg-surface-100 p-4 shadow-xs transition-colors hover:border-border-strong hover:bg-surface-200 focus-visible:border-border-stronger focus-visible:outline-none"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <ProjectMark name={p.name} className="size-8 rounded-md text-xs" />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <h3 className="truncate text-sm text-foreground">{p.name}</h3>
                          <span className="truncate font-mono text-xs text-foreground-lighter">{p.slug}</span>
                        </div>
                        <ChevronRight
                          className="size-4 shrink-0 text-foreground-muted transition-colors group-hover:text-foreground"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      </div>
                      {p.description && <p className="line-clamp-2 text-xs text-foreground-light">{p.description}</p>}
                      {p.environments.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.environments.map((e) => {
                            const status = environmentStatus(e);
                            return (
                              <BadgeLabel key={e.id} tone={status.tone}>
                                {e.killed ? `${e.name} · suspended` : e.name}
                              </BadgeLabel>
                            );
                          })}
                        </div>
                      )}
                      <p className="mt-auto flex flex-wrap gap-x-1.5 border-t border-border pt-3 text-xs text-foreground-lighter">
                        <span>{plural(p.environments.length, "environment")}</span>
                        {connections !== undefined && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{plural(connections, "connection")} in 14 days</span>
                          </>
                        )}
                      </p>
                    </Link>
                  </StaggerItem>
                );
              })}
            </ul>
          )}
          {!isAdmin && (
            <p className="text-xs text-foreground-lighter">
              Run a project locally: <code className="font-mono">{CLI_COMMANDS.login}</code>, then{" "}
              <code className="font-mono">{CLI_COMMANDS.init}</code> and{" "}
              <code className="font-mono">{CLI_COMMANDS.run}</code>
            </p>
          )}
        </div>
      )}
    </QueryState>
  );
}
