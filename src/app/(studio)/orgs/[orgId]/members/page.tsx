import { MembersView } from "@/features/members";
import { PageContainer } from "@/shared/components/page-container";

export default async function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <MembersView orgId={orgId} />
    </PageContainer>
  );
}
