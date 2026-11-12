import { ActivityFeed } from "@/features/audit";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";

export default async function AuditPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <PageHeader
        breadcrumb="Security"
        title="Activity"
        description="Who did what, and when: access changes, config, logins and app usage."
      />
      <ActivityFeed orgId={orgId} />
    </PageContainer>
  );
}
