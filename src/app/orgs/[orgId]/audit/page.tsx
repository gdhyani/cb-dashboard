import { ActivityFeed } from "@/features/audit";
import { PageHeader } from "@/shared/components/page-header";

export default async function AuditPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <>
      <PageHeader
        breadcrumb="Security"
        title="Activity"
        description="Who did what, and when: access changes, config, logins and app usage."
      />
      <ActivityFeed orgId={orgId} />
    </>
  );
}
