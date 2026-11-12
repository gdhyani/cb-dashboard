import type { ReactNode } from "react";
import { EnvironmentLayout } from "@/features/environments";

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string; projectId: string; envId: string }>;
}) {
  const { orgId, projectId, envId } = await params;
  return (
    <EnvironmentLayout orgId={orgId} projectId={projectId} envId={envId}>
      {children}
    </EnvironmentLayout>
  );
}
