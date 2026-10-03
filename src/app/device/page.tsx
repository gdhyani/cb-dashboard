import { DeviceApproval } from "@/features/device-approval";

export default async function DevicePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return <DeviceApproval initialCode={code ?? ""} />;
}
