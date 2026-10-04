import { ProjectView } from "@/features/projects";

export default async function ProjectPage({ params }: { params: Promise<{ orgId: string; projectId: string }> }) {
  const { orgId, projectId } = await params;
  return <ProjectView orgId={orgId} projectId={projectId} />;
}
