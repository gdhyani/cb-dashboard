import { MyAccess } from "@/features/orgs";

export default async function MyAccessPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <MyAccess orgId={orgId} />;
}
