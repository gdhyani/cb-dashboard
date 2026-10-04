"use client";

import { useMembers } from "@/features/members/hooks/use-members";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { useProject } from "@/features/projects/hooks/use-projects";
import { ResourcesPanel } from "@/features/resources/components/resources-panel";
import { PreviewPanel } from "@/features/variables/components/preview-panel";
import { VariablesPanel } from "@/features/variables/components/variables-panel";
import { BadgeLabel } from "@/shared/components/badge-label";
import { Breadcrumb } from "@/shared/components/breadcrumb";
import { CopyCommand } from "@/shared/components/copy-command";
import { PageHeader } from "@/shared/components/page-header";
import { QueryState } from "@/shared/components/query-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useEnvironment } from "../hooks/use-environment";
import { SuspensionControl } from "./suspension-control";

export function EnvironmentView({ orgId, projectId, envId }: { orgId: string; projectId: string; envId: string }) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const env = useEnvironment(envId);
  const members = useMembers(orgId);
  return (
    <QueryState isPending={env.isPending} error={env.error}>
      {env.data && (
        <>
          <PageHeader
            backHref={`/orgs/${orgId}/projects/${projectId}`}
            breadcrumb={
              <Breadcrumb
                items={[
                  { label: "Projects", href: `/orgs/${orgId}/projects` },
                  { label: project.data?.name ?? "Project", href: `/orgs/${orgId}/projects/${projectId}` },
                  { label: env.data.name },
                ]}
              />
            }
            title={env.data.name}
            description={
              env.data.killed ? (
                <span className="flex items-center gap-2">
                  <BadgeLabel tone="warning" dot>
                    Suspended
                  </BadgeLabel>{" "}
                  {env.data.killedReason}
                </span>
              ) : (
                "Configuration delivered to applications in this environment, and the services it connects to."
              )
            }
            actions={org.isAdmin && <SuspensionControl env={env.data} />}
          />
          {env.data.hasAccess && project.data && (
            <div className="flex max-w-xl flex-col gap-2">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">Local development</p>
              <CopyCommand command={`npx cb init --project ${project.data.slug} --env ${env.data.name}`} />
            </div>
          )}
          <Tabs defaultValue="variables">
            <TabsList>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              {org.isAdmin && <TabsTrigger value="preview">Access preview</TabsTrigger>}
            </TabsList>
            <TabsContent value="variables" className="pt-4">
              <VariablesPanel envId={envId} isAdmin={org.isAdmin} />
            </TabsContent>
            <TabsContent value="resources" className="pt-4">
              <ResourcesPanel envId={envId} isAdmin={org.isAdmin} />
            </TabsContent>
            {org.isAdmin && (
              <TabsContent value="preview" className="pt-4">
                <PreviewPanel envId={envId} members={members.data ?? []} />
              </TabsContent>
            )}
          </Tabs>
        </>
      )}
    </QueryState>
  );
}
