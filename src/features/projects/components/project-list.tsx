"use client";

import Link from "next/link";
import { CLI_COMMANDS } from "@/constants";
import { useOrgStats } from "@/features/stats";
import { BadgeLabel } from "@/shared/components/badge-label";
import { SegmentMeter } from "@/shared/components/charts/segment-meter";
import { EmptyState } from "@/shared/components/empty-state";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonCards } from "@/shared/components/skeletons";
import { StaggerItem } from "@/shared/components/stagger";
import { useProjects } from "../hooks/use-projects";

export function ProjectList({ orgId, isAdmin }: { orgId: string; isAdmin: boolean }) {
  const projects = useProjects(orgId);
  const stats = useOrgStats(orgId);
  const trendOf = (id: string) => stats.data?.connectionsByProject.find((p) => p.projectId === id);
  return (
    <QueryState isPending={projects.isPending} error={projects.error} skeleton={<SkeletonCards cards={2} />}>
      {projects.data?.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description={
            isAdmin
              ? "Create a project, add its variables, then invite developers."
              : "An admin hasn't created any projects yet."
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.data?.map((p, i) => (
            <StaggerItem key={p.id} index={i}>
              <Link
                href={`/orgs/${orgId}/projects/${p.id}`}
                className="cb-grid flex h-full flex-col gap-4 rounded-lg border border-border p-4 transition-colors hover:border-ring sm:p-5"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-medium tracking-tight">{p.name}</span>
                  <span className="font-mono text-xs text-subtle">{p.slug}</span>
                  {p.description && <span className="text-sm text-muted-foreground">{p.description}</span>}
                </div>
                {trendOf(p.id) && (
                  <div className="flex items-end gap-3">
                    <SegmentMeter
                      values={trendOf(p.id)?.daily ?? []}
                      segments={4}
                      className="flex h-6 flex-1 items-end gap-[2px]"
                    />
                    <span className="shrink-0 font-mono text-[11px] text-subtle">
                      {trendOf(p.id)?.connections} conn · 14d
                    </span>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2">
                  {p.environments.map((e) => (
                    <BadgeLabel key={e.id} tone={e.killed ? "warning" : e.hasAccess ? "strong" : "muted"}>
                      {e.killed ? `${e.name} · suspended` : e.name}
                    </BadgeLabel>
                  ))}
                </div>
              </Link>
            </StaggerItem>
          ))}
        </ul>
      )}
      {projects.data && projects.data.length > 0 && !isAdmin && (
        <p className="font-mono text-xs text-subtle">
          Use a project locally: {CLI_COMMANDS.login} → {CLI_COMMANDS.init} → {CLI_COMMANDS.run}
        </p>
      )}
    </QueryState>
  );
}
