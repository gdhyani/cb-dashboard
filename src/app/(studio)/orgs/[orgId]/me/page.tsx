import { MyAccess } from "@/features/orgs";
import { PageContainer } from "@/shared/components/page-container";

export default async function MyAccessPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <MyAccess orgId={orgId} />
    </PageContainer>
  );
}
