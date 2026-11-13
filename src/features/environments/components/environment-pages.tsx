"use client";

import { EnvironmentAccess } from "@/features/access";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { useProject } from "@/features/projects/hooks/use-projects";
import { VariablesPanel } from "@/features/variables";
import { WebhooksTab } from "@/features/webhooks";
import { Admonition } from "@/shared/components/admonition";
import { useEnvironment } from "../hooks/use-environment";

type EnvPageProps = { orgId: string; projectId: string; envId: string };

/** Shown on admin-only sub-pages when a developer opens the URL directly (FR-UI-004; the backend enforces it too). */
function AdminsOnly() {
  return (
    <Admonition title="Only owners and admins can open this page">
      Ask an admin of this organization if you need a change here.
    </Admonition>
  );
}

export function EnvironmentVariablesPage({ orgId, projectId, envId }: EnvPageProps) {
  const org = useOrg(orgId);
  return <VariablesPanel projectId={projectId} envId={envId} isAdmin={org.isAdmin} />;
}

export function EnvironmentAccessPage({ orgId, projectId, envId }: EnvPageProps) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const env = useEnvironment(envId);
  if (org.data && !org.isAdmin) return <AdminsOnly />;
  return (
    <EnvironmentAccess
      projectId={projectId}
      projectName={project.data?.name ?? "this project"}
      envId={envId}
      envName={env.data?.name ?? "this environment"}
    />
  );
}

export function EnvironmentWebhooksPage({ orgId, envId }: EnvPageProps) {
  const org = useOrg(orgId);
  if (org.data && !org.isAdmin) return <AdminsOnly />;
  return <WebhooksTab envId={envId} />;
}

export { AdminsOnly };
