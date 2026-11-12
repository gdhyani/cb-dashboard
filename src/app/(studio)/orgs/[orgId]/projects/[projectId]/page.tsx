import { ProjectView } from "@/features/projects";
import { PageContainer } from "@/shared/components/page-container";

export default async function ProjectPage({ params }: { params: Promise<{ orgId: string; projectId: string }> }) {
  const { orgId, projectId } = await params;
  return (
    <PageContainer>
      <ProjectView orgId={orgId} projectId={projectId} />
    </PageContainer>
  );
}
