import { EnvironmentView } from "@/features/environments";

export default async function EnvironmentPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string; envId: string }>;
}) {
  const { orgId, projectId, envId } = await params;
  return <EnvironmentView orgId={orgId} projectId={projectId} envId={envId} />;
}
