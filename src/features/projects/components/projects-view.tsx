"use client";

import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { PageHeader } from "@/shared/components/page-header";
import { ProjectList } from "./project-list";

/** Org › Projects: the project grid. "New project" sits in the grid toolbar (admins only). */
export function ProjectsView({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  return (
    <>
      <PageHeader
        title="Projects"
        description="Each project holds environments, their variables and the services they reach"
      />
      <div className="pt-8">
        <ProjectList orgId={orgId} isAdmin={org.isAdmin} />
      </div>
    </>
  );
}
