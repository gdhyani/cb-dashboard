import type { ReactNode } from "react";
import { ProjectLayout } from "@/features/projects";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { orgId, projectId } = await params;
  return (
    <ProjectLayout orgId={orgId} projectId={projectId}>
      {children}
    </ProjectLayout>
  );
}
