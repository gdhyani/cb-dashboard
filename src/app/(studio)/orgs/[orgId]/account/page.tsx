import { AccountPreferences } from "@/features/account";

export default async function AccountPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  return <AccountPreferences orgId={orgId} />;
}
