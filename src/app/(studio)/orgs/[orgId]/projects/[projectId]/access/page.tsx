import { ProjectAccessPage } from "@/features/projects";

export default async function Page({ params }: { params: Promise<{ orgId: string; projectId: string }> }) {
  const { orgId, projectId } = await params;
  return <ProjectAccessPage orgId={orgId} projectId={projectId} />;
}
