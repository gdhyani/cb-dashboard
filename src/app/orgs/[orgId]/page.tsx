import { OrgOverview } from "@/features/orgs";

export default async function OrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <OrgOverview orgId={orgId} />;
}
