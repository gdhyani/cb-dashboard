"use client";

import { Copy, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProjectAccess } from "@/features/access";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { Breadcrumb } from "@/shared/components/breadcrumb";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { RowActions } from "@/shared/components/row-actions";
import { Section } from "@/shared/components/section";
import { SkeletonHeader, SkeletonRows } from "@/shared/components/skeletons";
import { useCopy } from "@/shared/hooks/use-copy";
import { useProject, useProjectMutations } from "../hooks/use-projects";
import { EnvironmentList } from "./environment-list";

export function ProjectView({ orgId, projectId }: { orgId: string; projectId: string }) {
  const router = useRouter();
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const { remove } = useProjectMutations(orgId);
  const { copy } = useCopy("Project slug copied");
  return (
    <QueryState
      isPending={project.isPending}
      error={project.error}
      skeleton={
        <>
          <SkeletonHeader />
          <SkeletonRows rows={2} />
        </>
      }
    >
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
                <RowActions
                  prominent
                  label={`Actions for ${project.data.name}`}
                  actions={[
                    { label: "Copy project slug", icon: Copy, onSelect: () => void copy(project.data.slug) },
                    {
                      label: "Delete project",
                      icon: Trash2,
                      destructive: true,
                      confirm: {
                        title: `Delete ${project.data.name}?`,
                        description:
                          "All environments, resources, variables and grants are deleted. Running apps lose access.",
                        confirmLabel: "Delete project",
                        requireReason: true,
                        onConfirm: () =>
                          remove.mutateAsync(projectId, { onSuccess: () => router.replace(`/orgs/${orgId}/projects`) }),
                      },
                    },
                  ]}
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
              description="Who can run this project locally — across all environments or only some. Time-limited access ends on its own."
            >
              <ProjectAccess projectId={projectId} projectName={project.data.name} />
            </Section>
          )}
        </>
      )}
    </QueryState>
  );
}
