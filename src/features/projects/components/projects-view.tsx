"use client";

import { useOrg } from "@/features/orgs/hooks/use-orgs";
import { PageHeader } from "@/shared/components/page-header";
import { CreateProjectDialog } from "./create-project-dialog";
import { ProjectList } from "./project-list";

export function ProjectsView({ orgId }: { orgId: string }) {
  const org = useOrg(orgId);
  return (
    <>
      <PageHeader
        breadcrumb="Projects"
        title="Projects"
        description="Each project holds environments, their variables and the resources they reach."
        actions={org.isAdmin && <CreateProjectDialog orgId={orgId} />}
      />
      <ProjectList orgId={orgId} isAdmin={org.isAdmin} />
    </>
  );
}
