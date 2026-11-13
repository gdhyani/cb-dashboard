import { OrgOverview } from "@/features/orgs";
import { PageContainer } from "@/shared/components/page-container";

export default async function OrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <OrgOverview orgId={orgId} />
    </PageContainer>
  );
}
