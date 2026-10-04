import { apiDelete, apiGet } from "@/shared/api/http";
import type { Device, WebSession } from "../types";

export const listMyDevices = () => apiGet<Device[]>("/me/devices");
export const listOrgDevices = (orgId: string) => apiGet<Device[]>(`/orgs/${orgId}/devices`);
export const revokeDevice = (deviceId: string) => apiDelete<{ revoked: true }>(`/devices/${deviceId}`);
export const listOrgSessions = (orgId: string) => apiGet<WebSession[]>(`/orgs/${orgId}/sessions`);
export const revokeSession = (sessionId: string) => apiDelete<{ revoked: true }>(`/sessions/${sessionId}`);
