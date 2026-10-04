import { DevicesTable, SessionsList } from "@/features/devices";
import { PageHeader } from "@/shared/components/page-header";
import { Section } from "@/shared/components/section";

export default async function DevicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <>
      <PageHeader
        breadcrumb="Security"
        title="Devices & sessions"
        description="CLI logins and dashboard sign-ins across your members. Revoking a device closes its connections immediately."
      />
      <Section
        title="CLI devices"
        description="Laptops logged in with npx cb login, and whether their agent is running."
      >
        <DevicesTable scope="org" orgId={orgId} />
      </Section>
      <Section title="Dashboard sessions" description="Browsers signed in to this dashboard.">
        <SessionsList orgId={orgId} />
      </Section>
    </>
  );
}
