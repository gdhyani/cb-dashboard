import { MembersView } from "@/features/members";

export default async function MembersPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <MembersView orgId={orgId} />;
}
