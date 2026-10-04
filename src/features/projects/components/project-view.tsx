"use client";

import { useRouter } from "next/navigation";
import { AccessMatrix } from "@/features/access/components/access-matrix";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { Breadcrumb } from "@/shared/components/breadcrumb";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Section } from "@/shared/components/section";
import { Button } from "@/shared/ui/button";
import { useProject, useProjectMutations } from "../hooks/use-projects";
import { EnvironmentList } from "./environment-list";

export function ProjectView({ orgId, projectId }: { orgId: string; projectId: string }) {
  const router = useRouter();
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const { remove } = useProjectMutations(orgId);
  return (
    <QueryState isPending={project.isPending} error={project.error}>
      {project.data && (
        <>
          <PageHeader
            backHref={`/orgs/${orgId}/projects`}
            breadcrumb={
              <Breadcrumb
                items={[{ label: "Projects", href: `/orgs/${orgId}/projects` }, { label: project.data.name }]}
              />
            }
            title={project.data.name}
            description={project.data.description || <span className="font-mono">{project.data.slug}</span>}
            actions={
              org.isAdmin && (
                <ConfirmDialog
                  trigger={<Button variant="ghost">Delete project</Button>}
                  title={`Delete ${project.data.name}?`}
                  description="All environments, resources, variables and grants are deleted. Running apps lose access."
                  confirmLabel="Delete project"
                  requireReason
                  onConfirm={() =>
                    remove.mutateAsync(projectId, { onSuccess: () => router.replace(`/orgs/${orgId}/projects`) })
                  }
                />
              )
            }
          />
          <Section title="Environments" description="Each has its own variables, resources and access.">
            <EnvironmentList project={project.data} isAdmin={org.isAdmin} />
          </Section>
          {org.isAdmin && (
            <Section
              title="Access"
              description="Who can run this project locally. Developers need a grant per environment; temporary grants expire on their own."
            >
              <AccessMatrix projectId={projectId} />
            </Section>
          )}
        </>
      )}
    </QueryState>
  );
}
