import { ActivityFeed } from "@/features/audit";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";

export default async function AuditPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer size="large">
      <PageHeader
        title="Activity"
        description="Who did what and when: access changes, config, sign-ins and app usage"
      />
      <Section>
        <ActivityFeed orgId={orgId} />
      </Section>
    </PageContainer>
  );
}
