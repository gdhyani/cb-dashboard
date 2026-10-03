import { apiPost } from "@/shared/api/http";

export const approveDevice = (body: { userCode: string; deviceName?: string }) =>
  apiPost<{ deviceName: string; os: string }>("/cli/device/approve", body);
