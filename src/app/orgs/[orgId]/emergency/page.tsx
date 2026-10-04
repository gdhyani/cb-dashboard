import { EmergencyStopView } from "@/features/emergency-stop";

export default async function EmergencyStopPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <EmergencyStopView orgId={orgId} />;
}
