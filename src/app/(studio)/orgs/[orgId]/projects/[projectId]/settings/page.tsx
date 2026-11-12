import { ProjectSettings } from "@/features/projects";

export default async function Page({ params }: { params: Promise<{ orgId: string; projectId: string }> }) {
  const { orgId, projectId } = await params;
  return <ProjectSettings orgId={orgId} projectId={projectId} />;
}
