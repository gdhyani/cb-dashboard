"use client";

import { ProjectAccess } from "@/features/access";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { Admonition } from "@/shared/components/admonition";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { useProject } from "../hooks/use-projects";
import { ProjectNav } from "./project-nav";

/** Project › Access: who can run this project locally, across all or some environments. */
export function ProjectAccessPage({ orgId, projectId }: { orgId: string; projectId: string }) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  return (
    <PageContainer>
      <PageHeader
        title="Access"
        description="Who can run this project locally, across all environments or only some"
        nav={<ProjectNav orgId={orgId} projectId={projectId} isAdmin={org.isAdmin} />}
      />
      <div className="pt-6">
        {org.data && !org.isAdmin ? (
          <Admonition title="Only owners and admins can open this page" />
        ) : (
          <ProjectAccess projectId={projectId} projectName={project.data?.name ?? "this project"} />
        )}
      </div>
    </PageContainer>
  );
}
