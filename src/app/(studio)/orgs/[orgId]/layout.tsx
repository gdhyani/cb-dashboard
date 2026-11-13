import type { ReactNode } from "react";
import { OrgShell } from "@/features/orgs";

export default async function OrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  return <OrgShell orgId={orgId}>{children}</OrgShell>;
}
