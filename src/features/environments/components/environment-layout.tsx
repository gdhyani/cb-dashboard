"use client";

import type { ReactNode } from "react";
import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { useProject } from "@/features/projects/hooks/use-projects";
import { Admonition } from "@/shared/components/admonition";
import { CopyCommand } from "@/shared/components/copy-command";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { PageNav } from "@/shared/components/page-nav";
import { QueryState } from "@/shared/components/query-state";
import { SkeletonHeader } from "@/shared/components/skeletons";
import { useEnvironment } from "../hooks/use-environment";

/**
 * Environment pages share one header and a route-backed sub-nav (Variables · Access · Webhooks · Settings; only
 * Variables for developers, FR-UI-004). A suspended environment shows a warning admonition on every sub-page.
 */
export function EnvironmentLayout({
  orgId,
  projectId,
  envId,
  children,
}: {
  orgId: string;
  projectId: string;
  envId: string;
  children: ReactNode;
}) {
  const org = useOrg(orgId);
  const project = useProject(projectId);
  const env = useEnvironment(envId);
  const base = `/orgs/${orgId}/projects/${projectId}/environments/${envId}`;
  const nav = [
    { href: base, label: "Variables", exact: true },
    ...(org.isAdmin
      ? [
          { href: `${base}/access`, label: "Access" },
          { href: `${base}/webhooks`, label: "Webhooks" },
          { href: `${base}/settings`, label: "Settings" },
        ]
      : []),
  ];
  return (
    <PageContainer>
      <QueryState isPending={env.isPending} error={env.error} skeleton={<SkeletonHeader />}>
        {env.data && (
          <>
            <PageHeader
              title={env.data.name}
              description={`Environment of ${project.data?.name ?? "this project"}: the keys your apps read and who can use them`}
              actions={
                env.data.hasAccess &&
                project.data && (
                  <div className="w-full sm:w-auto sm:min-w-80">
                    <CopyCommand command={`npx cb init --project ${project.data.slug} --env ${env.data.name}`} />
                  </div>
                )
              }
              nav={<PageNav label="Environment" items={nav} />}
            />
            {env.data.killed && (
              <Admonition type="warning" title="This environment is suspended" className="mt-6">
                {env.data.killedReason ?? "Apps cannot reach its services until it is resumed."}
              </Admonition>
            )}
          </>
        )}
      </QueryState>
      <div className="flex min-w-0 flex-col pt-6">{children}</div>
    </PageContainer>
  );
}
