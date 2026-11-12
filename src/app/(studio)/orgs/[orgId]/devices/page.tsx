import { DevicesTable, SessionsList } from "@/features/devices";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";

export default async function DevicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <PageContainer>
      <PageHeader title="Devices & Sessions" description="CLI sign-ins and dashboard sessions across your members" />
      <Section
        title="CLI devices"
        description="Laptops signed in with the CLI and whether their agent is running. Revoking a device closes its connections immediately"
      >
        <DevicesTable scope="org" orgId={orgId} />
      </Section>
      <Section title="Dashboard sessions" description="Browsers signed in to this dashboard">
        <SessionsList orgId={orgId} />
      </Section>
    </PageContainer>
  );
}
