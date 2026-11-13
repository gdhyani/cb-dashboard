import { EnvironmentSettings } from "@/features/environments";

export default async function Page({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string; envId: string }>;
}) {
  const { orgId, projectId, envId } = await params;
  return <EnvironmentSettings orgId={orgId} projectId={projectId} envId={envId} />;
}
