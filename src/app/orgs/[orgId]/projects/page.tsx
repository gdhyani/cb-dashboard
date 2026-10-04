import { ProjectsView } from "@/features/projects/components/projects-view";

export default async function ProjectsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <ProjectsView orgId={orgId} />;
}
