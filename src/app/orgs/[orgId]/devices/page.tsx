import { DevicesTable } from "@/features/devices";
import { PageHeader } from "@/shared/components/page-header";

export default async function DevicesPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return (
    <>
      <PageHeader
        breadcrumb="Security"
        title="Devices"
        description="Every CLI login across your members. Revoking a device closes its connections immediately."
      />
      <DevicesTable scope="org" orgId={orgId} />
    </>
  );
}
