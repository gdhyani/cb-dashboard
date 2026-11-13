"use client";

import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { SkeletonHeader, SkeletonRows } from "@/shared/components/skeletons";
import { useProject } from "../hooks/use-projects";
import { EnvironmentList } from "./environment-list";
import { ProjectNav } from "./project-nav";

/** Project › Overview: its environments. Access and Settings (rename, delete) are their own pages. */
export function ProjectView({ orgId, projectId }: { orgId: string; projectId: string }) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  return (
    <QueryState
      isPending={project.isPending}
      error={project.error}
      skeleton={
        <>
          <SkeletonHeader />
          <div className="pt-10">
            <SkeletonRows rows={2} />
          </div>
        </>
      }
    >
      {project.data && (
        <>
          <PageHeader
            title={project.data.name}
            description={
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-sm text-foreground-lighter">{project.data.slug}</span>
                {project.data.description && <span className="min-w-0">{project.data.description}</span>}
              </span>
            }
            nav={<ProjectNav orgId={orgId} projectId={projectId} isAdmin={org.isAdmin} />}
          />
          <Section title="Environments" description="Each has its own variables, services and access">
            <EnvironmentList project={project.data} isAdmin={org.isAdmin} />
          </Section>
        </>
      )}
    </QueryState>
  );
}
