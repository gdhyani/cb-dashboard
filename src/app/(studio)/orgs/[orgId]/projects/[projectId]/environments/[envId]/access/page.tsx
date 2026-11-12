import { EnvironmentAccessPage } from "@/features/environments";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string; envId: string }>;
}) {
  const { orgId, projectId, envId } = await params;
  return <EnvironmentAccessPage orgId={orgId} projectId={projectId} envId={envId} />;
}
