import { AuditFeed } from "@/features/audit";
import { PageHeader } from "@/shared/components/page-header";

export default async function AuditPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <>
      <PageHeader
        eyebrow="security"
        title="Audit log"
        description="Every login, grant, revocation, tunnel and gateway request."
      />
      <AuditFeed orgId={orgId} />
    </>
  );
}
