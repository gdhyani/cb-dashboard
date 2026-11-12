import { ProjectsView } from "@/features/projects/components/projects-view";
import { PageContainer } from "@/shared/components/page-container";

export default async function ProjectsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <ProjectsView orgId={orgId} />
    </PageContainer>
  );
}
