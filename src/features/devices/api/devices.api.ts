import { apiDelete, apiGet } from "@/shared/api/http";
import type { Device } from "../types";

export const listMyDevices = () => apiGet<Device[]>("/me/devices");
export const listOrgDevices = (orgId: string) => apiGet<Device[]>(`/orgs/${orgId}/devices`);
export const revokeDevice = (deviceId: string) => apiDelete<{ revoked: true }>(`/devices/${deviceId}`);
